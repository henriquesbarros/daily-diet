import fastify from 'fastify'
import jwtPlugin from './plugins/jwtPlugin'
import cookiePlugin from './plugins/cookiePlugin'
import authRoutes from './routes/authRoutes'
import mealRoutes from './routes/mealRoutes'

export const app = fastify()

app.register(jwtPlugin)
app.register(cookiePlugin)

app.register(authRoutes)
app.register(mealRoutes)
