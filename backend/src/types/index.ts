export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthUser {
  id: string
  username: string
  email: string
  firstName: string
  middleName?: string
  lastName: string
  role: "SUPER_ADMIN" | "INTERMEDIATE_ADMIN" | "DATA_ENCODER"
  isActive: boolean
}

export interface JwtPayload {
  userId: string
  username: string
  role: string
  sessionId: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName: string
  middleName?: string
  lastName: string
  role: "INTERMEDIATE_ADMIN" | "DATA_ENCODER"
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  middleName?: string
  lastName?: string
  isActive?: boolean
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
}

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  status?: string
  role?: string
  startDate?: string
  endDate?: string
}
