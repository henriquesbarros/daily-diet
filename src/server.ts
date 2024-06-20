import { randomUUID } from 'node:crypto'
import fastify from 'fastify'
import jwt from 'jsonwebtoken'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import bcrypt from 'bcrypt'
import { z } from 'zod'

import { knex } from './database'
import { env } from './env'

const app = fastify()

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  })

  const refreshToken = jwt.sign({ userId }, env.REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  })

  return { accessToken, refreshToken }
}

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

app.post('/login', async (request, reply) => {
  const loginBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
  })

  const { email, password } = loginBodySchema.parse(request.body)

  try {
    const user = await knex('users').where({ email }).first()

    const isMatchingPassword = await bcrypt.compare(password, user.password)

    if (user && isMatchingPassword) {
      const { accessToken, refreshToken } = generateTokens(user.id)

      const now = new Date()
      const accessExpiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 min
      const refreshExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await knex('sessions').insert({
        id: randomUUID(),
        user_id: user.id,
        token: accessToken,
        refresh_token: refreshToken,
        expires_at: accessExpiresAt,
        refresh_expires_at: refreshExpiresAt,
      })

      reply.status(200).send({ accessToken, refreshToken })
    } else {
      reply.status(401).send({ error: 'Invalid email or password!' })
    }
  } catch (error) {
    reply.status(500).send({ error: 'Error logging in!' })
  }
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running')
  })
