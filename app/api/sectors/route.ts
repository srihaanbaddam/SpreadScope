

import { NextResponse } from 'next/server';
import { SECTORS } from '@/lib/constants';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      sectors: SECTORS,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
