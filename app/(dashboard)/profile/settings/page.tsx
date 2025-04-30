"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/lib/hooks/use-user"
import { UserAvatar } from "@/components/user-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { updateUserProfile } from "@/lib/api/user-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload } from "lucide-react"

export default function ProfileSettingsPage() {
  const { user, isLoading, refetch } = useUser()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useState(() => {
    if (user) {
      setFormData({
        name: user.name,
        phoneNumber: user.phoneNumber || "",
      })
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsSubmitting(true)
      await updateUserProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      })

      // If there's an image file, upload it
      // Note: This would require implementing the uploadProfilePhoto function
      // if (imageFile) {
      //   await uploadProfilePhoto(imageFile)
      // }

      toast({
        title: "Profil berhasil diperbarui",
        description: "Informasi profil Anda telah diperbarui dengan sukses.",
      })

      // Refresh user data
      refetch()
    } catch (error: any) {
      toast({
        title: "Gagal memperbarui profil",
        description: error.message || "Terjadi kesalahan saat memperbarui profil.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Pengaturan Profil">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout title="Pengaturan Profil">
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
    <DashboardLayout title="Pengaturan Profil">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Profil</CardTitle>
            <CardDescription>Perbarui informasi profil Anda di sini.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {previewUrl ? (
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="h-32 w-32 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <UserAvatar user={user} size={128} />
                    )}
                    <Label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Klik ikon untuk mengganti foto profil</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                  <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Nomor Telepon</Label>
                  <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
