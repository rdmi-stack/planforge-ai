import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
    newUser: "/signup",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        try {
          const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) {
            const error = await res.json().catch(() => ({}))
            throw new Error(error.detail || "Invalid email or password")
          }

          const data = await res.json()

          // The backend should return user info + a JWT token
          return {
            id: data.user?.id || data.id,
            name: data.user?.name || data.name,
            email: data.user?.email || data.email,
            image: data.user?.avatar_url || data.avatar_url || null,
            backendToken: data.access_token || data.token,
          }
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message)
          }
          throw new Error("Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, persist backend token and user data into the JWT
      if (user) {
        token.backendToken = (user as { backendToken?: string }).backendToken
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Expose backend token and user id in the client session
      if (session.user) {
        session.user.id = token.userId as string
        ;(session as { backendToken?: string }).backendToken =
          token.backendToken as string
      }
      return session
    },
  },
})
