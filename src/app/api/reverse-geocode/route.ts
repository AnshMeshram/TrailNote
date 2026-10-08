import { NextRequest, NextResponse } from 'next/server';
import { reverseGeocodeLocation } from '@/lib/maps/nominatim';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { success: false, error: 'Missing lat or lng parameter' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { success: false, error: 'Invalid numeric coordinates' },
      { status: 400 }
    );
  }

  try {
    const location = await reverseGeocodeLocation(lat, lng);
    return NextResponse.json({
      success: true,
      location,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Reverse geocode failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
