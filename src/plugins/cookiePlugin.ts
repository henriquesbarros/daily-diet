import fastifyCookie from '@fastify/cookie'
import { FastifyInstance } from 'fastify'

export default async function cookiePlugin(fastify: FastifyInstance) {
  fastify.register(fastifyCookie)
}
