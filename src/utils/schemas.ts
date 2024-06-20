import { z } from 'zod'

export const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})
