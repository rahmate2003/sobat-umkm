//components/dashboard-layout.tsx
import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { SidebarProvider, useSidebar } from "@/lib/context/sidebar-context"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

function DashboardContent({ children, title }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className={cn("flex-1 transition-all duration-300 ease-in-out", isCollapsed ? "ml-16" : "ml-60")}>
        <Header title={title} />
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardContent title={title}>{children}</DashboardContent>
    </SidebarProvider>
  )
}
