import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'virtualstaging-api',
      version: '0.1.0'
    },
    { status: 200 }
  )
}