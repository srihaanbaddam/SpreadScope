

import { NextRequest, NextResponse } from 'next/server';
import { validateTicker } from '@/lib/data-fetcher';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ticker = searchParams.get('ticker');
    
    if (!ticker) {
      return NextResponse.json(
        {
          valid: false,
          ticker: '',
          isIndex: false,
          error: 'Ticker parameter is required',
        },
        { status: 400 }
      );
    }
    
    const result = validateTicker(ticker);
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
    
  } catch (error) {
    console.error('Error in /api/validate:', error);
    return NextResponse.json(
      {
        valid: false,
        ticker: '',
        isIndex: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
