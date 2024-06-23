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

export const checkUserIdSchema = z.object({
  userId: z.string().uuid(),
})

export const addMealBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  dateTime: z.string().datetime(),
  isWithinDiet: z.boolean(),
})

export const editMealBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  dateTime: z.string().datetime().optional(),
  isWithinDiet: z.boolean().optional(),
})

export const mealIdParamsSchema = z.object({
  mealId: z.string().uuid(),
})
