import { NextResponse } from 'next/server';
import { searchLocations } from '@/lib/maps/nominatim';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    const results = await searchLocations(query.trim(), Math.min(Math.max(limit, 1), 10));

    return NextResponse.json({
      success: true,
      query: query.trim(),
      count: results.length,
      results,
    });
  } catch (err: any) {
    console.error('Error in search-location API route:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to search locations.',
        results: [],
      },
      { status: 500 }
    );
  }
}
