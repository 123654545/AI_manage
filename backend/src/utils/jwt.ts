// E:\HTML_learning\AI_manage3\backend\src\utils\jwt.ts
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'ai-contract-system-secret-key-2024'
const JWT_EXPIRES_IN = '7d'

export interface JwtPayload {
  userId: string
  email: string
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}