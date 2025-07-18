import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"

interface NavigationProps {
  className?: string
}

const navigationItems = [
  { href: "/", label: "Overview" },
  { href: "/architecture", label: "Architecture" },
  { href: "/dashboard", label: "Real-time Dashboard" },
  { href: "/documentation", label: "Documentation" },
  { href: "/deliverables", label: "Project Deliverables" },
  { href: "/compliance", label: "Compliance" }
]

export function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn("flex space-x-6", className)}>
      {navigationItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}