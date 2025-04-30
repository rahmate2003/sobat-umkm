import axiosInstance from "./axios"

// Interface for store type
export interface StoreType {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

// Interface for store data
export interface Store {
  id: number
  name: string
  address: string
  storeCode: string
  storeTypeId: number
  provinceId: number
  cityId: number
  districtId: number
  villageId: number
  postalCode: string
  phoneNumber: string
  email: string
  image?: string
  description?: string
  status: string
  tenantId: number
  createdAt?: string
  updatedAt?: string
  tenant?: {
    id: number
    name: string
    status: string
  }
  storeType?: {
    id: number
    name: string
  }
}

// Interface for API response
interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

// Get all stores (for superadmin)
export const getAllStores = async (params?: {
  name?: string
  tenantId?: number
  storeCode?: string
  status?: string
  sortBy?: string
  sortType?: "asc" | "desc"
  limit?: number
  page?: number
}): Promise<{
  stores: Store[]
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
      validParams.limit = 3
    }

    const response = await axiosInstance.get<
      ApiResponse<{
        stores: Store[]
        totalData: number
        currentPage: number
        totalPages: number
        currentData: number
      }>
    >("/stores", { params: validParams })

    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || "Failed to get stores")
  } catch (error: any) {
    console.error("Get stores error:", error)
    throw error.response?.data || error
  }
}

// Get store by ID
export const getStoreById = async (storeId: number): Promise<Store> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ store: Store }>>(`/stores/${storeId}`)

    if (response.data.success) {
      return response.data.data.store
    }
    throw new Error(response.data.message || "Failed to get store")
  } catch (error: any) {
    console.error("Get store error:", error)
    throw error.response?.data || error
  }
}

// Get stores for a specific tenant (for superadmin)
export const getTenantStores = async (
  tenantId: number,
  params?: {
    name?: string
    storeCode?: string
    status?: string
    sortBy?: string
    sortType?: "asc" | "desc"
    limit?: number
    page?: number
  },
): Promise<{ stores: Store[]; total: number; page: number; limit: number }> => {
  try {
    const response = await axiosInstance.get<
      ApiResponse<{ stores: Store[]; total: number; page: number; limit: number }>
    >(`/tenants/${tenantId}/stores`, { params })

    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || "Failed to get tenant stores")
  } catch (error: any) {
    console.error("Get tenant stores error:", error)
    throw error.response?.data || error
  }
}

// Get own stores (for owner)
export const getOwnStores = async (params?: {
  name?: string
  storeCode?: string
  status?: string
  sortBy?: string
  sortType?: "asc" | "desc"
  limit?: number
  page?: number
}): Promise<{ stores: Store[]; total: number; page: number; limit: number }> => {
  try {
    const response = await axiosInstance.get<
      ApiResponse<{ stores: Store[]; total: number; page: number; limit: number }>
    >("/tenant/stores", { params })

    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || "Failed to get own stores")
  } catch (error: any) {
    console.error("Get own stores error:", error)
    throw error.response?.data || error
  }
}

// Create store for a specific tenant (for superadmin)
export const createStoreForTenant = async (tenantId: number, storeData: Partial<Store>): Promise<Store> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ store: Store }>>(`/stores/${tenantId}`, storeData)

    if (response.data.success) {
      return response.data.data.store
    }
    throw new Error(response.data.message || "Failed to create store")
  } catch (error: any) {
    console.error("Create store error:", error)
    throw error.response?.data || error
  }
}

// Create own store (for owner)
export const createOwnStore = async (storeData: Partial<Store>): Promise<Store> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ store: Store }>>("/tenant/stores", storeData)

    if (response.data.success) {
      return response.data.data.store
    }
    throw new Error(response.data.message || "Failed to create store")
  } catch (error: any) {
    console.error("Create own store error:", error)
    throw error.response?.data || error
  }
}

// Update store
export const updateStore = async (storeId: number, storeData: Partial<Store>): Promise<Store> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<{ store: Store }>>(`/stores/${storeId}`, storeData)

    if (response.data.success) {
      return response.data.data.store
    }
    throw new Error(response.data.message || "Failed to update store")
  } catch (error: any) {
    console.error("Update store error:", error)
    throw error.response?.data || error
  }
}

// Delete store
export const deleteStore = async (storeId: number): Promise<void> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<{}>>(`/stores/${storeId}`)

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete store")
    }
  } catch (error: any) {
    console.error("Delete store error:", error)
    throw error.response?.data || error
  }
}

// Get store types
export const getStoreTypes = async (): Promise<StoreType[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ storeTypes: StoreType[] }>>("/stores/types")

    if (response.data.success) {
      return response.data.data.storeTypes
    }
    throw new Error(response.data.message || "Failed to get store types")
  } catch (error: any) {
    console.error("Get store types error:", error)
    throw error.response?.data || error
  }
}
