import axiosInstance from "./axios"

// Interfaces for location data
export interface Province {
  id: number
  name: string
}

export interface City {
  id: number
  name: string
  provinceId: number
}

export interface District {
  id: number
  name: string
  cityId: number
}

export interface Village {
  id: number
  name: string
  districtId: number
}

// Interface for API response
interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

// Get all provinces
export const getProvinces = async (params?: {
  name?: string
  limit?: number
  page?: number
  sortBy?: string
  sortType?: "asc" | "desc"
}): Promise<Province[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Province[]>>("/location/provinces", { params })

    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || "Failed to get provinces")
  } catch (error: any) {
    console.error("Get provinces error:", error)
    throw error.response?.data || error
  }
}

// Get cities by province ID
export const getCitiesByProvinceId = async (
  provinceId: number,
  params?: {
    name?: string
    limit?: number
    page?: number
    sortBy?: string
    sortType?: "asc" | "desc"
  },
): Promise<City[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<City[]>>(`/location/cities/${provinceId}`, { params })

    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || "Failed to get cities")
  } catch (error: any) {
    console.error("Get cities error:", error)
    throw error.response?.data || error
  }
}

// Get districts by city ID
export const getDistrictsByCityId = async (
  cityId: number,
  params?: {
    name?: string
    limit?: number
    page?: number
    sortBy?: string
    sortType?: "asc" | "desc"
  },
): Promise<District[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<District[]>>(`/location/districts/${cityId}`, { params })

    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || "Failed to get districts")
  } catch (error: any) {
    console.error("Get districts error:", error)
    throw error.response?.data || error
  }
}

// Get villages by district ID
export const getVillagesByDistrictId = async (
  districtId: number,
  params?: {
    name?: string
    limit?: number
    page?: number
    sortBy?: string
    sortType?: "asc" | "desc"
  },
): Promise<Village[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Village[]>>(`/location/villages/${districtId}`, { params })

    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || "Failed to get villages")
  } catch (error: any) {
    console.error("Get villages error:", error)
    throw error.response?.data || error
  }
}
