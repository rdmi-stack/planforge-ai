import { z } from "zod/v4"

export const projectCreateSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  description: z.string().max(2000).optional(),
  githubRepoUrl: z.url("Invalid GitHub URL").optional().or(z.literal("")),
  techStack: z.array(z.string()).optional(),
})

export const specCreateSchema = z.object({
  title: z.string().min(1, "Spec title is required").max(300),
})

export const featureCreateSchema = z.object({
  title: z.string().min(1, "Feature title is required").max(300),
  description: z.string().max(5000).optional(),
  mvpClassification: z.enum(["mvp", "v1", "v2", "nice_to_have"]).optional(),
})

export const taskCreateSchema = z.object({
  title: z.string().min(1, "Task title is required").max(300),
  description: z.string().max(5000).optional(),
  featureId: z.string().min(1, "Feature is required"),
  agentType: z
    .enum(["claude_code", "cursor", "codex", "windsurf", "manual"])
    .optional(),
})

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/\d/, "Must contain a number"),
})

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
