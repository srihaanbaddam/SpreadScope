

import { NextRequest, NextResponse } from 'next/server';
import { analyzeCorrelation } from '@/lib/pairs-engine';
import type { CorrelationRequest } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CorrelationRequest;
    
    
    if (!body.tickerA || !body.tickerB) {
      return NextResponse.json(
        {
          success: false,
          error: 'Both tickerA and tickerB are required',
        },
        { status: 400 }
      );
    }
    
    
    const tickerPattern = /^[\^]?[A-Z]{1,5}$/;
    if (!tickerPattern.test(body.tickerA.toUpperCase().trim())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid ticker format: ${body.tickerA}`,
        },
        { status: 400 }
      );
    }
    
    if (!tickerPattern.test(body.tickerB.toUpperCase().trim())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid ticker format: ${body.tickerB}`,
        },
        { status: 400 }
      );
    }
    
    
    const result = await analyzeCorrelation({
      tickerA: body.tickerA,
      tickerB: body.tickerB,
      lookbackWindow: body.lookbackWindow,
      timePeriod: body.timePeriod,
    });
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
    
  } catch (error) {
    console.error('Error in /api/correlation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const tickerA = searchParams.get('tickerA');
    const tickerB = searchParams.get('tickerB');
    
    if (!tickerA || !tickerB) {
      return NextResponse.json(
        {
          success: false,
          error: 'Both tickerA and tickerB query parameters are required',
        },
        { status: 400 }
      );
    }
    
    const lookbackWindow = parseInt(searchParams.get('lookbackWindow') || '60', 10);
    const timePeriod = parseInt(searchParams.get('timePeriod') || '252', 10);
    
    const result = await analyzeCorrelation({
      tickerA,
      tickerB,
      lookbackWindow,
      timePeriod,
    });
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
    
  } catch (error) {
    console.error('Error in /api/correlation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
