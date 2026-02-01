

import { NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/cache';

export const runtime = 'nodejs';

export async function GET() {
  const cacheStats = getCacheStats();
  
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      cache: cacheStats,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
