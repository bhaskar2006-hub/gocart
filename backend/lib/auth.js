import { SignJWT, jwtVerify } from 'jose'
import { prisma } from './prisma.js'

const JWT_SECRET = process.env.JWT_SECRET || 'gocart-development-secret-key-123456789-super-secure'
const KEY = new TextEncoder().encode(JWT_SECRET)

export async function signJWT(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(KEY)
}

export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, KEY, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    return null
  }
}

export async function getAuthUser(req) {
  try {
    const token = req.cookies?.session
    if (!token) return null

    const decoded = await verifyJWT(token)
    if (!decoded || !decoded.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        Address: true,
        store: true
      }
    })

    return user
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}
