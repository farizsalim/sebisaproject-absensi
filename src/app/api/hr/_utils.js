import { NextResponse } from 'next/server'

export function forbidden() { return NextResponse.json({ message: 'Forbidden.' }, { status: 403 }) }
export function unauthorized() { return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 }) }
export function canManage(user) { return ['hr', 'leader'].includes(user?.role) }
export function safe(value) { return JSON.parse(JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item)) }