

import { NextRequest, NextResponse } from 'next/server';
import { analyzeTradeNowPairs } from '@/lib/pairs-engine';
import { SECTORS } from '@/lib/constants';

export const runtime = 'nodejs';
export const maxDuration = 60; 

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    
    const lookbackWindow = parseInt(searchParams.get('lookbackWindow') || '60', 10);
    const zScoreWindow = parseInt(searchParams.get('zScoreWindow') || '20', 10);
    const timePeriod = parseInt(searchParams.get('timePeriod') || '252', 10);
    const sector = searchParams.get('sector') || undefined;
    
    
    if (sector && !SECTORS.includes(sector as typeof SECTORS[number])) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid sector. Valid sectors are: ${SECTORS.join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    
    const result = await analyzeTradeNowPairs({
      lookbackWindow,
      zScoreWindow,
      timePeriod,
      sector,
    });
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
    
  } catch (error) {
    console.error('Error in /api/pairs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
