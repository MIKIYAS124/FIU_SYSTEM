"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building2, Users, CreditCard, AlertTriangle, MapPin, FileText, Upload, Menu, X, LogOut } from "lucide-react"

interface SidebarProps {
  userRole: "super_admin" | "intermediate_admin" | "data_encoder"
}

export function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const superAdminItems = [
    { href: "/super-admin", label: "Dashboard", icon: Building2 },
    { href: "/super-admin/reporting-entities", label: "Reporting Entities", icon: Building2 },
    { href: "/super-admin/transaction-manner", label: "Transaction Manner", icon: CreditCard },
    { href: "/super-admin/crime-types", label: "Crime Types", icon: AlertTriangle },
    { href: "/super-admin/users", label: "User Management", icon: Users },
  ]

  const intermediateAdminItems = [
    { href: "/intermediate-admin", label: "Dashboard", icon: Building2 },
    { href: "/intermediate-admin/branches", label: "Branch Management", icon: MapPin },
    { href: "/intermediate-admin/users", label: "User Management", icon: Users },
  ]

  const dataEncoderItems = [
    { href: "/data-encoder", label: "Dashboard", icon: Building2 },
    { href: "/data-encoder/reports", label: "STR & CTR Reports", icon: FileText },
    { href: "/data-encoder/upload", label: "Upload Reports", icon: Upload },
  ]

  const getMenuItems = () => {
    switch (userRole) {
      case "super_admin":
        return superAdminItems
      case "intermediate_admin":
        return intermediateAdminItems
      case "data_encoder":
        return dataEncoderItems
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && <h2 className="text-lg font-semibold text-gray-800">FIU System</h2>}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", isCollapsed && "px-2")}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-2">{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50", isCollapsed && "px-2")}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  )
}
