import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    backendToken?: string
    user: {
      id: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    backendToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    backendToken?: string
    userId?: string
  }
}
