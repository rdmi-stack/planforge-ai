export type ApiResponse<T> = {
  data: T
  meta?: PaginationMeta
}

export type PaginationMeta = {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export type ApiError = {
  detail: string
  errorCode: string
  statusCode: number
}

export type User = {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  plan: "free" | "pro" | "team" | "enterprise"
  orgId: string
}

export type Organization = {
  id: string
  name: string
  slug: string
  plan: string
  memberCount: number
}

export type Template = {
  id: string
  name: string
  category: string
  description: string
  specTemplate: Record<string, unknown>
  architecture: Record<string, unknown> | null
  isPublic: boolean
  createdBy: string
}
