import jwt from 'jsonwebtoken'
import { env } from '../env'

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  })

  const refreshToken = jwt.sign({ userId }, env.REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  })

  return { accessToken, refreshToken }
}
