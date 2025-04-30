"use client"

import { Bell, Menu, RefreshCw, Settings, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/lib/context/sidebar-context"
import { useUser } from "@/lib/hooks/use-user"
import { UserAvatar } from "@/components/user-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { RoleBadge } from "@/components/role-badge"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/hooks/use-auth"
import Link from "next/link"

interface HeaderProps {
  title: string
}

const HeaderComponent = ({ title }: HeaderProps) => {
  const { toggleSidebar } = useSidebar()
  const { user, isLoading } = useUser()
  const { logout } = useAuth()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex justify-between items-center p-4 border-b bg-white">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={handleRefresh}
          aria-label="Refresh page"
        >
          <RefreshCw className={`h-6 w-6 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>

        <button className="relative p-2">
          <Bell className="h-6 w-6 text-gray-500" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {isLoading ? (
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="hidden md:block">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 rounded-lg p-1 transition-colors">
                <UserAvatar user={user} size={40} />
                <div className="hidden md:block">
                  <p className="font-medium">{user.name}</p>
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex w-full items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil Detail</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/settings" className="cursor-pointer flex w-full items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  )
}

export function Header(props: HeaderProps) {
  return <HeaderComponent {...props} />
}
