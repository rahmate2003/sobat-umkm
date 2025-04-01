import axiosInstance from "./axios"

// Interface untuk role dalam response API
interface Role {
  roleName: string
}

// Interface untuk user dalam response API
interface ApiUser {
  id: number
  email: string
  role: Role
  name?: string
  phoneNumber?: string
  imageUrl?: string | null
}

// Interface untuk data user yang digunakan di aplikasi
export interface User {
  id: number
  name: string
  email: string
  phoneNumber: string
  imageUrl: string | null
  role: string
}

// Interface untuk response API
interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

// Interface untuk response user profile
interface UserProfileResponseData {
  user: ApiUser
}

// Fungsi untuk mendapatkan profil user
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get<ApiResponse<UserProfileResponseData>>("/user/")

    if (response.data.success) {
      const apiUser = response.data.data.user

      // Konversi dari format API ke format aplikasi
      const user: User = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name || apiUser.email.split("@")[0], // Gunakan bagian depan email jika name tidak ada
        role: apiUser.role.roleName,
        phoneNumber: apiUser.phoneNumber || "",
        imageUrl: apiUser.imageUrl || null,
      }

      return user
    } else {
      throw new Error(response.data.message || "Failed to get user profile")
    }
  } catch (error: any) {
    console.error("Get user profile error:", error)
    throw error.response?.data || error
  }
}

// Fungsi untuk update profil user
export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    // Konversi dari format aplikasi ke format API
    const apiUserData: Partial<ApiUser> = {
      ...userData,
      role: userData.role ? { roleName: userData.role } : undefined,
    }

    const response = await axiosInstance.put<ApiResponse<UserProfileResponseData>>("/user/", apiUserData)

    if (response.data.success) {
      const apiUser = response.data.data.user

      // Konversi dari format API ke format aplikasi
      const user: User = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name || apiUser.email.split("@")[0],
        role: apiUser.role.roleName,
        phoneNumber: apiUser.phoneNumber || "",
        imageUrl: apiUser.imageUrl || null,
      }

      return user
    } else {
      throw new Error(response.data.message || "Failed to update user profile")
    }
  } catch (error: any) {
    console.error("Update user profile error:", error)
    throw error.response?.data || error
  }
}

// Fungsi untuk upload foto profil
export const uploadProfilePhoto = async (file: File): Promise<User> => {
  try {
    const formData = new FormData()
    formData.append("image", file)

    const response = await axiosInstance.post<ApiResponse<UserProfileResponseData>>(
      "/user/upload-photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    )

    if (response.data.success) {
      const apiUser = response.data.data.user

      // Konversi dari format API ke format aplikasi
      const user: User = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name || apiUser.email.split("@")[0],
        role: apiUser.role.roleName,
        phoneNumber: apiUser.phoneNumber || "",
        imageUrl: apiUser.imageUrl || null,
      }

      return user
    } else {
      throw new Error(response.data.message || "Failed to upload profile photo")
    }
  } catch (error: any) {
    console.error("Upload profile photo error:", error)
    throw error.response?.data || error
  }
}

