import fp from 'fastify-plugin'
import fastifyCookie from '@fastify/cookie'
import { FastifyInstance } from 'fastify'

async function cookiePlugin(fastify: FastifyInstance) {
  fastify.register(fastifyCookie)
}

export default fp(cookiePlugin)
