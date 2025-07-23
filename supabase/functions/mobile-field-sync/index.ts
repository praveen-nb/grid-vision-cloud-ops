import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: ''
      })
    }

    const { action, data } = await req.json()

    switch (action) {
      case 'sync_offline_data':
        return await syncOfflineData(supabase, data)
      case 'get_assignments':
        return await getFieldAssignments(supabase, data.technicianId)
      case 'update_operation':
        return await updateFieldOperation(supabase, data)
      case 'upload_photos':
        return await uploadFieldPhotos(supabase, data)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in mobile field sync:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function syncOfflineData(supabase: any, offlineData: any) {
  const { operations, findings, photos } = offlineData
  const syncResults = {
    synced_operations: 0,
    synced_findings: 0,
    synced_photos: 0,
    errors: []
  }

  // Sync field operations
  for (const operation of operations || []) {
    try {
      const { error } = await supabase
        .from('field_operations')
        .upsert({
          ...operation,
          offline_data: null, // Clear offline data after sync
          updated_at: new Date().toISOString()
        })

      if (error) {
        syncResults.errors.push(`Operation ${operation.id}: ${error.message}`)
      } else {
        syncResults.synced_operations++
      }
    } catch (error) {
      syncResults.errors.push(`Operation ${operation.id}: ${error.message}`)
    }
  }

  // Sync findings
  for (const finding of findings || []) {
    try {
      const { error } = await supabase
        .from('field_operations')
        .update({
          findings: finding.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', finding.operation_id)

      if (error) {
        syncResults.errors.push(`Finding ${finding.operation_id}: ${error.message}`)
      } else {
        syncResults.synced_findings++
      }
    } catch (error) {
      syncResults.errors.push(`Finding ${finding.operation_id}: ${error.message}`)
    }
  }

  // Sync photos (in production, upload to storage bucket)
  for (const photo of photos || []) {
    try {
      // Mock photo upload - in production, upload to Supabase storage
      const photoUrl = `https://storage.example.com/field-photos/${photo.filename}`
      
      const { error } = await supabase
        .from('field_operations')
        .update({
          photos: supabase.rpc('array_append', {
            array_column: 'photos',
            new_value: {
              url: photoUrl,
              filename: photo.filename,
              timestamp: photo.timestamp,
              location: photo.location
            }
          })
        })
        .eq('id', photo.operation_id)

      if (error) {
        syncResults.errors.push(`Photo ${photo.filename}: ${error.message}`)
      } else {
        syncResults.synced_photos++
      }
    } catch (error) {
      syncResults.errors.push(`Photo ${photo.filename}: ${error.message}`)
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      sync_results: syncResults
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getFieldAssignments(supabase: any, technicianId: string) {
  const { data: assignments, error } = await supabase
    .from('field_operations')
    .select(`
      *,
      grid_connections!inner(name, location, type),
      gis_assets(asset_id, asset_type, properties)
    `)
    .eq('technician_id', technicianId)
    .in('status', ['assigned', 'in_progress'])
    .order('priority', { ascending: false })
    .order('scheduled_start', { ascending: true })

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch assignments', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // Enrich assignments with nearby assets and recent alerts
  const enrichedAssignments = []
  for (const assignment of assignments) {
    // Get recent alerts for this connection
    const { data: alerts } = await supabase
      .from('grid_alerts')
      .select('*')
      .eq('connection_id', assignment.connection_id)
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get environmental data for the area
    const { data: envData } = await supabase
      .from('environmental_data')
      .select('*')
      .eq('connection_id', assignment.connection_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    enrichedAssignments.push({
      ...assignment,
      related_alerts: alerts || [],
      environmental_conditions: envData || []
    })
  }

  return new Response(
    JSON.stringify({
      success: true,
      assignments: enrichedAssignments
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateFieldOperation(supabase: any, updateData: any) {
  const { operationId, status, findings, location, photos } = updateData

  const updateFields: any = {
    updated_at: new Date().toISOString()
  }

  if (status) {
    updateFields.status = status
    
    if (status === 'in_progress' && !updateFields.actual_start) {
      updateFields.actual_start = new Date().toISOString()
    }
    
    if (status === 'completed') {
      updateFields.completed_at = new Date().toISOString()
    }
  }

  if (findings) {
    updateFields.findings = findings
  }

  if (location) {
    updateFields.location = location
  }

  if (photos) {
    updateFields.photos = photos
  }

  const { data, error } = await supabase
    .from('field_operations')
    .update(updateFields)
    .eq('id', operationId)
    .select()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update operation', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  // If operation is completed, generate completion report
  if (status === 'completed') {
    await generateCompletionReport(supabase, data[0])
  }

  return new Response(
    JSON.stringify({
      success: true,
      operation: data[0]
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function uploadFieldPhotos(supabase: any, photoData: any) {
  const { operationId, photos } = photoData
  
  // In production, upload photos to Supabase storage
  const uploadedPhotos = []
  
  for (const photo of photos) {
    // Mock photo upload
    const photoUrl = `https://storage.example.com/field-photos/${photo.filename}`
    uploadedPhotos.push({
      url: photoUrl,
      filename: photo.filename,
      timestamp: new Date().toISOString(),
      location: photo.location,
      description: photo.description
    })
  }

  // Update the operation with photo references
  const { data, error } = await supabase
    .from('field_operations')
    .update({
      photos: uploadedPhotos,
      updated_at: new Date().toISOString()
    })
    .eq('id', operationId)
    .select()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to upload photos', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      uploaded_photos: uploadedPhotos.length,
      operation: data[0]
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateCompletionReport(supabase: any, operation: any) {
  // Generate automated completion report
  const report = {
    operation_id: operation.id,
    connection_id: operation.connection_id,
    completion_time: operation.completed_at,
    duration_hours: calculateDuration(operation.actual_start, operation.completed_at),
    findings_summary: summarizeFindings(operation.findings),
    photos_count: operation.photos?.length || 0,
    recommendations: generateRecommendations(operation)
  }

  // Store report (you might want to create a separate reports table)
  console.log('Completion report generated:', report)
  
  return report
}

function calculateDuration(start: string, end: string): number {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  return (endTime - startTime) / (1000 * 60 * 60) // hours
}

function summarizeFindings(findings: any): string {
  if (!findings || Object.keys(findings).length === 0) {
    return 'No significant findings reported'
  }
  
  const keys = Object.keys(findings)
  return `${keys.length} findings documented including: ${keys.slice(0, 3).join(', ')}`
}

function generateRecommendations(operation: any): string[] {
  const recommendations = []
  
  if (operation.priority === 'emergency') {
    recommendations.push('Schedule follow-up inspection within 48 hours')
  }
  
  if (operation.findings && Object.keys(operation.findings).length > 0) {
    recommendations.push('Review findings with engineering team')
  }
  
  if (operation.operation_type === 'maintenance') {
    recommendations.push('Update maintenance schedule based on findings')
  }
  
  return recommendations
}