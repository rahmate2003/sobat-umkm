"use client"

import { Bell, Menu, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/lib/context/sidebar-context"
import { useUser } from "@/lib/hooks/use-user"
import { UserAvatar } from "@/components/user-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { RoleBadge } from "@/components/role-badge"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface HeaderProps {
  title: string
}

const HeaderComponent = ({ title }: HeaderProps) => {
  const { toggleSidebar } = useSidebar()
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
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
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <UserAvatar user={user} size={40} />
              <div className="hidden md:block">
                <p className="font-medium">{user.name}</p>
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function Header(props: HeaderProps) {
  return <HeaderComponent {...props} />
}
