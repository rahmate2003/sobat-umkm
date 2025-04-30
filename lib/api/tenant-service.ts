import axiosInstance from "./axios"

// Interface for tenant data
export interface Tenant {
  id: number
  tenantName: string
  address: string
  provinceName?: string
  cityName?: string
  districtName?: string
  villageName?: string
  postalCode: string
  npwp?: string
  npwpImage?: string
  status: string
  createdAt: string
  updatedAt: string
  owner?: {
    id: number
    name: string
    email: string
    imageUrl?: string
    phoneNumber?: string
    role: string
  }
}

// Interface for API response
interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

// Get all tenants (for superadmin)
export const getAllTenants = async (params?: {
  name?: string
  status?: string
  sortBy?: string
  sortType?: "asc" | "desc"
  limit?: number
  page?: number
}): Promise<{ 
  tenants: Tenant[];
  totalData: number
  currentPage: number
  totalPages: number
  currentData: number
 }> => {
  try {
    // Ensure params is an object
    const validParams = params || {}

    // Ensure page and limit are valid numbers
    if (validParams.page !== undefined && (isNaN(validParams.page) || validParams.page < 1)) {
      validParams.page = 1
    }

    if (validParams.limit !== undefined && (isNaN(validParams.limit) || validParams.limit < 1)) {
      validParams.limit = 10
    }

    const response = await axiosInstance.get<
      ApiResponse<{ 
    tenants: Tenant[];
    totalData: number
    currentPage: number
    totalPages: number
    currentData: number
 }>
    >("/tenants", { params: validParams })

    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || "Failed to get tenants")
  } catch (error: any) {
    console.error("Get tenants error:", error)
    throw error.response?.data || error
  }
}

// Get tenant by ID (for superadmin)
export const getTenantById = async (tenantId: number): Promise<Tenant> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ tenant: Tenant }>>(`/tenants/${tenantId}`)

    if (response.data.success) {
      return response.data.data.tenant
    }
    throw new Error(response.data.message || "Failed to get tenant")
  } catch (error: any) {
    console.error("Get tenant error:", error)
    throw error.response?.data || error
  }
}

// Get own tenant (for owner)
export const getOwnTenant = async (): Promise<Tenant> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ tenant: Tenant }>>("/tenant")

    if (response.data.success) {
      return response.data.data.tenant
    }
    throw new Error(response.data.message || "Failed to get tenant")
  } catch (error: any) {
    console.error("Get own tenant error:", error)
    throw error.response?.data || error
  }
}

// Update tenant (for superadmin)
export const updateTenant = async (tenantId: number, data: Partial<Tenant>): Promise<Tenant> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<{ tenant: Tenant }>>(`/tenants/${tenantId}`, data)

    if (response.data.success) {
      return response.data.data.tenant
    }
    throw new Error(response.data.message || "Failed to update tenant")
  } catch (error: any) {
    console.error("Update tenant error:", error)
    throw error.response?.data || error
  }
}

// Update own tenant (for owner)
export const updateOwnTenant = async (data: Partial<Tenant>): Promise<Tenant> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<{ tenant: Tenant }>>("/tenant", data)

    if (response.data.success) {
      return response.data.data.tenant
    }
    throw new Error(response.data.message || "Failed to update tenant")
  } catch (error: any) {
    console.error("Update own tenant error:", error)
    throw error.response?.data || error
  }
}

// Create tenant with owner (for superadmin)
export const createTenantWithOwner = async (data: {
  name: string
  email: string
  password: string
  phoneNumber: string
  tenantName: string
  address: string
  provinceId: number
  cityId: number
  districtId: number
  villageId: number
  postalCode: string
}): Promise<{ tenant: Tenant }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ tenant: Tenant }>>("/tenants", data)

    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || "Failed to create tenant")
  } catch (error: any) {
    console.error("Create tenant error:", error)
    throw error.response?.data || error
  }
}
