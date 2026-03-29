import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/lib/auth-provider"
import "../../app.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "PlanForge AI — From Idea to Production-Ready Code, Autonomously",
  description:
    "AI-powered product planning that generates specs, decomposes features into atomic tasks, and dispatches them to coding agents. Stop prompting blind. Start planning smart.",
  openGraph: {
    title: "PlanForge AI — From Idea to Production-Ready Code",
    description:
      "AI product planning that turns ideas into specs, tasks, and shipped code.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
