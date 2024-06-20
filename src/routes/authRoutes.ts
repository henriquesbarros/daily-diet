import { FastifyInstance } from 'fastify'
import {
  registerUser,
  loginUser,
  refreshToken,
} from '../controllers/authController'

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', registerUser)
  fastify.post('/login', loginUser)
  fastify.post('/token', refreshToken)
}
