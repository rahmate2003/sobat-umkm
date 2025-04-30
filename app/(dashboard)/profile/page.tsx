"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/hooks/use-user"
import { UserAvatar } from "@/components/user-avatar"
import { RoleBadge } from "@/components/role-badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Mail, Phone, Calendar, Settings } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return (
      <DashboardLayout title="Profil">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Informasi Profil</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout title="Profil">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p>Tidak dapat memuat data profil. Silakan coba lagi nanti.</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                  Muat Ulang
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Profil">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Informasi Profil</CardTitle>
            <Link href="/profile/settings">
              <Button variant="outline" size="sm" className="gap-1">
                <Settings className="h-4 w-4" />
                Edit Profil
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center space-y-4">
                <UserAvatar user={user} size={128} />
                <RoleBadge role={user.role} className="px-4 py-2 text-sm" />
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{user.phoneNumber || "Belum diatur"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>
                      Bergabung sejak{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
