"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Store, Users, Activity, Settings, LogOut, Menu, ChevronLeft } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useSidebar } from "@/lib/context/sidebar-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      const newIsMobile = window.innerWidth < 768
      setIsMobile(newIsMobile)
      // Hanya panggil toggleSidebar jika belum collapsed dan sedang dalam mode mobile
      if (newIsMobile && !isCollapsed) {
        toggleSidebar()
      }
    }

    // Panggil sekali saat mount
    checkIfMobile()

    // Tambahkan event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [isCollapsed]) // Hanya bergantung pada isCollapsed, bukan toggleSidebar

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Store, label: "Manajemen Toko", href: "/manajemen-toko" },
    { icon: Users, label: "Owner", href: "/owner" },
    { icon: Activity, label: "Aktivitas Pengguna", href: "/aktivitas" },
    { icon: Settings, label: "Pengaturan", href: "/pengaturan" },
  ]

  return (
    <div
      className={cn(
        "sidebar h-screen flex flex-col fixed z-30 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className={cn("p-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        {isCollapsed ? (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white hover:bg-white/10">
            <Menu size={24} />
          </Button>
        ) : (
          <>
            <div className="flex items-center space-x-1">
              <Image src="/logo.png" alt="NukaPOS Logo" width={180} height={180} />
            </div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white hover:bg-white/10">
              <ChevronLeft size={24} />
            </Button>
          </>
        )}
      </div>

      <nav className="flex-1 mt-6">
        <TooltipProvider delayDuration={0}>
          <ul className={cn("space-y-1", isCollapsed ? "px-0" : "px-2")}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-center h-10 w-10 rounded-md transition-colors mx-auto",
                            isActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
                          )}
                        >
                          <item.icon size={20} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
                        isActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              )
            })}

            <li>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={logout}
                      className="flex items-center justify-center h-10 w-10 rounded-md transition-colors mx-auto text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      <LogOut size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Keluar</TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <LogOut size={20} />
                  <span>Keluar</span>
                </button>
              )}
            </li>
          </ul>
        </TooltipProvider>
      </nav>
    </div>
  )
}
