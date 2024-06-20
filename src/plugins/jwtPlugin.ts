import fastifyJwt from '@fastify/jwt'
import { FastifyInstance } from 'fastify'
import { env } from '../env'

export default async function jwtPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.ACCESS_TOKEN_EXPIRY },
  })
}
