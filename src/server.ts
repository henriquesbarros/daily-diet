import { randomUUID } from 'node:crypto'
import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import bcrypt from 'bcrypt'
import { z } from 'zod'

import { knex } from './database'
import { env } from './env'

const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: env.ACCESS_TOKEN_EXPIRY },
})

app.register(fastifyCookie)

app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

app.post('/register', async (request, reply) => {
  const createUserBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  })

  const { name, email, password } = createUserBodySchema.parse(request.body)

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
    })

    reply.status(201).send()
  } catch {
    reply.status(500).send({ error: 'Error creating user' })
  }
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running')
  })
