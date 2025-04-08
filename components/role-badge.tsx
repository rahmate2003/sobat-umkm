import { cn } from "@/lib/utils"

interface RoleBadgeProps {
  role: string
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  // Map roles to colors
  const roleColors: Record<string, string> = {
    OWNER: "bg-blue-100 text-blue-800",
    ADMIN_TOKO: "bg-purple-100 text-purple-800",
    KASIR_TOKO: "bg-green-100 text-green-800",
    SUPERADMIN: "bg-red-100 text-red-800",
    // Default color for unknown roles
    DEFAULT: "bg-gray-100 text-gray-800",
  }

  // Get color based on role, or use default if not found
  const colorClass = roleColors[role] || roleColors.DEFAULT

  // Format role for display (e.g., SUPER_ADMIN -> Super Admin)
  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", colorClass, className)}>{formatRole(role)}</span>
  )
}
