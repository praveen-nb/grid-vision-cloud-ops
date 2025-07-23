import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Send, Database, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface GISCopilotProps {
  connectionId?: string
}

export function GISCopilot({ connectionId }: GISCopilotProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [queryHistory, setQueryHistory] = useState<any[]>([])

  const exampleQueries = [
    "Show me all high-risk assets in the last 30 days",
    "Find substations with voltage above 50kV",
    "List all maintenance operations completed this week",
    "Show customer incidents with more than 100 affected customers",
    "Find environmental data with critical severity level",
    "Show predictive analytics with failure probability above 70%"
  ]

  const handleQuerySubmit = async (queryText: string = query) => {
    if (!queryText.trim()) {
      toast.error("Please enter a query")
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('gis-copilot', {
        body: {
          query: queryText,
          connectionId: connectionId || null
        }
      })

      if (error) {
        throw error
      }

      setResults(data)
      setQuery("")
      
      // Refresh query history
      loadQueryHistory()
      
      if (data.error) {
        toast.error(`Query error: ${data.error}`)
      } else {
        toast.success(`Query executed successfully. ${data.row_count} rows returned.`)
      }
    } catch (error) {
      console.error('Error executing query:', error)
      toast.error('Failed to execute query')
    } finally {
      setLoading(false)
    }
  }

  const loadQueryHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('copilot_queries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setQueryHistory(data)
      }
    } catch (error) {
      console.error('Error loading query history:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">GIS Copilot</h2>
          <p className="text-muted-foreground">Ask questions about your grid data in natural language</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
              <CardDescription>
                Use natural language to query your grid data. The AI will convert your question to SQL and execute it safely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="e.g., Show me all assets with high failure probability in the downtown area"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      handleQuerySubmit()
                    }
                  }}
                />
                <Button 
                  onClick={() => handleQuerySubmit()} 
                  disabled={loading || !query.trim()}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Tip: Press Ctrl+Enter to submit your query
              </div>
            </CardContent>
          </Card>

          {/* Example Queries */}
          <Card>
            <CardHeader>
              <CardTitle>Example Queries</CardTitle>
              <CardDescription>Click on any example to try it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {exampleQueries.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto p-3"
                    onClick={() => handleQuerySubmit(example)}
                    disabled={loading}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Query Results */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Query Results
                  {results.error ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  {results.error ? (
                    <span className="text-destructive">Query failed to execute</span>
                  ) : (
                    <span>
                      Returned {results.row_count} rows in {results.execution_time_ms}ms
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Generated SQL */}
                <div>
                  <h4 className="font-medium mb-2">Generated SQL Query:</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm font-mono">{results.query}</code>
                  </div>
                </div>

                <Separator />

                {/* Results Table */}
                {results.error ? (
                  <div className="text-destructive">
                    <h4 className="font-medium mb-2">Error:</h4>
                    <p>{results.error}</p>
                  </div>
                ) : results.results && results.results.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2">Results:</h4>
                    <div className="border rounded-lg overflow-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(results.results[0]).map((column) => (
                              <TableHead key={column}>{column}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.results.slice(0, 100).map((row: any, index: number) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value: any, cellIndex) => (
                                <TableCell key={cellIndex}>
                                  {typeof value === 'object' && value !== null 
                                    ? JSON.stringify(value)
                                    : String(value)
                                  }
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {results.results.length > 100 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Showing first 100 rows of {results.results.length} total results
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    No results returned from query
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Query History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Queries
              </CardTitle>
              <CardDescription>Your query history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queryHistory.map((historyItem, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium line-clamp-2">
                        {historyItem.natural_query}
                      </p>
                      <Badge variant={historyItem.executed_successfully ? "default" : "destructive"}>
                        {historyItem.executed_successfully ? "✓" : "✗"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(historyItem.created_at).toLocaleTimeString()}</span>
                      {historyItem.execution_time_ms && (
                        <span>• {historyItem.execution_time_ms}ms</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => setQuery(historyItem.natural_query)}
                    >
                      Use this query
                    </Button>
                    {index < queryHistory.length - 1 && <Separator />}
                  </div>
                ))}
                
                {queryHistory.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No queries yet. Try asking a question!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips for Better Queries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">Be Specific</h4>
                <p className="text-muted-foreground">
                  Include specific criteria like dates, locations, or thresholds
                </p>
              </div>
              <div>
                <h4 className="font-medium">Use Domain Terms</h4>
                <p className="text-muted-foreground">
                  Reference "substations", "transformers", "alerts", etc.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Filter by Time</h4>
                <p className="text-muted-foreground">
                  Add time ranges like "last week", "this month", "past 30 days"
                </p>
              </div>
              <div>
                <h4 className="font-medium">Ask for Insights</h4>
                <p className="text-muted-foreground">
                  Try "trends", "patterns", "correlations", "summaries"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}