import fastify from 'fastify'
import jwtPlugin from './plugins/jwtPlugin'
import cookiePlugin from './plugins/cookiePlugin'
import authRoutes from './routes/authRoutes'

export const app = fastify()

app.register(jwtPlugin)
app.register(cookiePlugin)

app.register(authRoutes)

app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})
