import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"

interface NavigationProps {
  className?: string
}

const navigationItems = [
  { href: "/", label: "Overview", shortLabel: "Home" },
  { href: "/architecture", label: "Architecture", shortLabel: "Arch" },
  { href: "/dashboard", label: "Real-time Dashboard", shortLabel: "Dash" },
  { href: "/live-monitoring", label: "Live Monitoring", shortLabel: "Live" },
  { href: "/aws-infrastructure", label: "AWS Infrastructure", shortLabel: "AWS" },
  { href: "/phase3-advanced", label: "Phase 3: Advanced ML", shortLabel: "ML" },
  { href: "/phase4-enterprise", label: "Phase 4: Enterprise", shortLabel: "ENT" },
  { href: "/sagemaker", label: "SageMaker", shortLabel: "SM" },
  { href: "/documentation", label: "Documentation", shortLabel: "Docs" },
  { href: "/deliverables", label: "Project Deliverables", shortLabel: "Files" },
  { href: "/compliance", label: "Compliance", shortLabel: "Comp" }
]

export function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn("flex flex-wrap gap-2 sm:gap-4", className)}>
      {navigationItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )
          }
        >
          <span className="hidden sm:inline">{item.label}</span>
          <span className="sm:hidden">{item.shortLabel}</span>
        </NavLink>
      ))}
    </nav>
  )
}