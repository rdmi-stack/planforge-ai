const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public errorCode?: string
  ) {
    super(detail)
    this.name = "ApiError"
  }
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options || {}
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new ApiError(
      res.status,
      error.detail || "Request failed",
      error.error_code
    )
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export function apiGet<T>(path: string, token?: string) {
  return apiClient<T>(path, { method: "GET", token })
}

export function apiPost<T>(path: string, body: unknown, token?: string) {
  return apiClient<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    token,
  })
}

export function apiPatch<T>(path: string, body: unknown, token?: string) {
  return apiClient<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    token,
  })
}

export function apiDelete(path: string, token?: string) {
  return apiClient(path, { method: "DELETE", token })
}
