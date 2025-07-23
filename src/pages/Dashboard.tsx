import { EnhancedDashboardMenu } from "@/components/enhanced-dashboard-menu"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function Dashboard() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div></div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
      
      <EnhancedDashboardMenu />
    </div>
  )
}