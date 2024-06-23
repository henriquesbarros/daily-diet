import { FastifyInstance } from 'fastify'

import {
  addMeal,
  deleteMeal,
  editMeal,
  getMeals,
  getMeal,
} from '../controllers/mealController'
import { authenticate } from '../middlewares/authMiddleware'

export default async function mealRoutes(fastify: FastifyInstance) {
  fastify.post('/api/meals', { preValidation: [authenticate] }, addMeal)
  fastify.put('/api/meals/:mealId', { preValidation: [authenticate] }, editMeal)
  fastify.delete(
    '/api/meals/:mealId',
    { preValidation: [authenticate] },
    deleteMeal,
  )
  fastify.get('/api/meals', { preValidation: [authenticate] }, getMeals)
  fastify.get('/api/meals/:mealId', { preValidation: [authenticate] }, getMeal)
}
