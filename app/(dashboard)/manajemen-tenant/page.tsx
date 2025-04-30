"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronRight,
  Search,
  Plus,
  ChevronLeft,
  ChevronRightIcon,
  Store,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getAllTenants, type Tenant } from "@/lib/api/tenant-service"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SearchParams {
  limit?: number
  page?: number
  sortBy?: string
  sortType?: "asc" | "desc"
  name?: string
  tenantCode?: string
  status?: string
}

export default function ManajemenTenantPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<"name" | "tenantCode">("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalData, setTotalData] = useState(0)
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const itemsPerPage = 3

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoading(true)
        const page = isNaN(currentPage) ? 1 : currentPage

        const searchParams: SearchParams = {
          limit: itemsPerPage,
          page: page,
          sortBy: "createdAt",
          sortType: "desc",
        }

        if (searchTerm) {
          searchParams[searchType] = searchTerm
        }
        if (statusFilter !== "ALL") {
          searchParams.status = statusFilter
        }

        const response = await getAllTenants(searchParams)

        setTenants(response.tenants)
        setTotalPages(response.totalPages || 1)
        setTotalData(response.totalData || 0)
        if (currentPage > response.totalPages) {
          setCurrentPage(response.totalPages || 1)
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Gagal memuat data tenant",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenants()
  }, [searchTerm, searchType, currentPage, statusFilter, toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const getPaginationButtons = () => {
    const buttons = []
    const maxButtons = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    let endPage = Math.min(totalPages, startPage + maxButtons - 1)

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    if (startPage > 1) {
      buttons.push(1)
      if (startPage > 2) buttons.push('...')
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttons.push('...')
      buttons.push(totalPages)
    }

    return buttons
  }

  return (
    <DashboardLayout title="Manajemen Tenant">
      <div className="mb-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-0">
            <li className="inline-flex items-center">
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary">
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">&gt;</span>
                <span className="text-sm font-medium text-gray-700">Manajemen Tenant</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* <Select value={searchType} onValueChange={(value: "name" | "tenantCode") => setSearchType(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Pilih" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nama Tenant</SelectItem>
                <SelectItem value="tenantCode">Kode Tenant</SelectItem>
              </SelectContent>
            </Select> */}
          </form>

          {user?.role === "SUPERADMIN" && (
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tambahkan
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-b">
                <th className="text-left py-3 px-4 font-medium">Nama Tenant</th>
                <th className="text-left py-3 px-4 font-medium">Owner</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Alamat</th>
                <th className="text-left py-3 px-4 font-medium">
                  <div className="flex items-center">
                    Status
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                          Semua
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("ACTIVE")}>
                          Aktif
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("INACTIVE")}>
                          Tidak Aktif
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-md mr-3" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Tidak ada data tenant yang ditemukan
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                          <Store className="h-5 w-5 text-primary" />
                        </div>
                        {tenant.tenantName}
                      </div>
                    </td>
                    <td className="py-3 px-4">{tenant.owner?.name || "N/A"}</td>
                    <td className="py-3 px-4">{tenant.owner?.email || "N/A"}</td>
                    <td className="py-3 px-4">
                      {tenant.address} {tenant.cityName ? `, ${tenant.cityName}` : ""}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tenant.status === "ACTIVE" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tenant.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/manajemen-tenant/${tenant.id}`}>
                        <Button variant="ghost" size="icon" className="text-primary">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalData)} dari {totalData} tenant
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Sebelumnya
            </Button>

            {getPaginationButtons().map((page, index) => (
              <Button
                key={index}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={`w-8 h-8 p-0 ${currentPage === page ? "bg-primary" : ""} ${page === '...' ? "pointer-events-none" : ""}`}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                disabled={isLoading || page === '...'}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
            >
              Selanjutnya
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}