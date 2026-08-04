import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, storedPassword) {
  const [salt, storedHash] = storedPassword.split(':')

  if (!salt || !storedHash) return false

  const calculatedHash = scryptSync(password, salt, 64)
  const expectedHash = Buffer.from(storedHash, 'hex')

  return calculatedHash.length === expectedHash.length
    && timingSafeEqual(calculatedHash, expectedHash)
}