import { randomUUID } from 'node:crypto'
import bcrypt from 'bcrypt'
import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { knex } from '../database'
import { generateTokens } from '../utils/generateTokens'
import { createUserBodySchema, loginBodySchema } from '../utils/schemas'
import { env } from '../env'

export async function registerUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
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
}

export async function loginUser(request: FastifyRequest, reply: FastifyReply) {
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
}

export async function refreshToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { refreshToken } = request.body as { refreshToken: string }

  if (!refreshToken) {
    return reply.status(401).send({ error: 'Refresh token is required' })
  }

  try {
    const session = await knex('sessions')
      .where({ refresh_token: refreshToken })
      .first()

    if (!session) {
      return reply.status(403).send({ error: 'Invalid refresh token' })
    }

    if (new Date(session.refresh_expires_at) < new Date()) {
      return reply.status(403).send({ error: 'Refresh token expired' })
    }

    jwt.verify(refreshToken, env.REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return reply.status(403).send({ error: 'Invalid refresh token' })
      }

      if (
        typeof decoded === 'object' &&
        decoded !== null &&
        'userId' in decoded
      ) {
        const userId = (decoded as { userId: string }).userId
        const { accessToken, refreshToken: newRefreshToken } =
          generateTokens(userId)

        const now = new Date()
        const accessExpiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 min
        const refreshExpiresAt = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000,
        ) // 7 days

        await knex('sessions').where({ id: session.id }).update({
          token: accessToken,
          refresh_token: newRefreshToken,
          expires_at: accessExpiresAt,
          refresh_expires_at: refreshExpiresAt,
        })

        reply.status(200).send({ accessToken, refreshToken: newRefreshToken })
      } else {
        reply.status(403).send({ error: 'Invalid token payload' })
      }
    })
  } catch (error) {
    reply.status(500).send({ error: 'Error refreshing token' })
  }
}
