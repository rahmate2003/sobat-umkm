"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Search, Plus, ChevronLeft, ChevronRightIcon, Store } from "lucide-react"
import Link from "next/link"

// Sample data for stores
const storesData = [
  {
    id: 1,
    name: "Toko A",
    owner: "@OwnerNande",
    location: "Jln. Projakal Rt 55 No.118...",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Toko A",
    owner: "@OwnerNande",
    location: "Jln. Projakal Rt 55 No.118...",
    status: "Tidak Aktif",
  },
  {
    id: 3,
    name: "Toko A",
    owner: "@OwnerAuliaa",
    location: "Jln. Projakal Rt 55 No.118...",
    status: "Aktif",
  },
  {
    id: 4,
    name: "Toko A",
    owner: "@OwnerAuliaa",
    location: "Jln. Projakal Rt 55 No.118...",
    status: "Aktif",
  },
  {
    id: 5,
    name: "Toko A",
    owner: "@OwnerNande",
    location: "Jln. Projakal Rt 155 No.118...",
    status: "Aktif",
  },
  {
    id: 6,
    name: "Toko A",
    owner: "@OwnerNande",
    location: "Jln. Projakal Rt 255 No.118...",
    status: "Tidak Aktif",
  },
  {
    id: 7,
    name: "Toko A",
    owner: "@OwnerAuliaa",
    location: "Jln. Projakal Rt 355 No.118...",
    status: "Aktif",
  },
  {
    id: 8,
    name: "Toko A",
    owner: "@OwnerAuliaa",
    location: "Jln. Projakal Rt 455 No.118...",
    status: "Aktif",
  },
]

export default function ManajemenTokoPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Filter stores based on search term
  const filteredStores = storesData.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStores = filteredStores.slice(startIndex, startIndex + itemsPerPage)

  return (
    <DashboardLayout title="Manajemen Toko">
      <div className="mb-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary">
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">&gt;</span>
                <span className="text-sm font-medium text-gray-700">Manajemen Toko</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 w-full sm:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tambahkan
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-b">
                <th className="text-left py-3 px-4 font-medium">Nama Toko</th>
                <th className="text-left py-3 px-4 font-medium">Owner</th>
                <th className="text-left py-3 px-4 font-medium">Lokasi Toko</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedStores.map((store) => (
                <tr key={store.id} className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      {store.name}
                    </div>
                  </td>
                  <td className="py-3 px-4">{store.owner}</td>
                  <td className="py-3 px-4">{store.location}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        store.status === "Aktif" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {store.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={`w-8 h-8 p-0 ${currentPage === page ? "bg-primary" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Selanjutnya
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
