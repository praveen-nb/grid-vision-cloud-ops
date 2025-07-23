import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react"

interface ErrorStateProps {
  title?: string
  message?: string
  variant?: 'error' | 'network' | 'empty' | 'unauthorized'
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorState({ 
  title, 
  message, 
  variant = 'error', 
  onRetry, 
  showRetry = true 
}: ErrorStateProps) {
  const getVariantConfig = () => {
    switch (variant) {
      case 'network':
        return {
          icon: WifiOff,
          defaultTitle: 'Connection Problem',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
          iconColor: 'text-orange-500'
        }
      case 'empty':
        return {
          icon: AlertTriangle,
          defaultTitle: 'No Data Available',
          defaultMessage: 'There is no data to display at the moment. Try refreshing or check back later.',
          iconColor: 'text-muted-foreground'
        }
      case 'unauthorized':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Access Denied',
          defaultMessage: 'You do not have permission to view this content. Please contact your administrator.',
          iconColor: 'text-red-500'
        }
      default:
        return {
          icon: AlertTriangle,
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
          iconColor: 'text-red-500'
        }
    }
  }

  const config = getVariantConfig()
  const Icon = config.icon
  const displayTitle = title || config.defaultTitle
  const displayMessage = message || config.defaultMessage

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Icon className={`h-12 w-12 ${config.iconColor}`} />
          
          <div className="space-y-2">
            <CardTitle className="text-lg">{displayTitle}</CardTitle>
            <p className="text-muted-foreground max-w-md">{displayMessage}</p>
          </div>

          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Specific error components for common use cases
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorState variant="network" onRetry={onRetry} />
}

export function EmptyState({ title, message }: { title?: string; message?: string }) {
  return <ErrorState variant="empty" title={title} message={message} showRetry={false} />
}

export function UnauthorizedError() {
  return <ErrorState variant="unauthorized" showRetry={false} />
}