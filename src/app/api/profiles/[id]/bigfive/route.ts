import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transformProfileToBigFiveData } from '@/lib/big-five-config';

// Enable caching for this route - revalidate every 60 seconds
export const revalidate = 60;

// Helper function to validate UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid profile ID format' },
        { status: 400 }
      );
    }

    const bigFiveProfile = await prisma.bigFiveProfile.findUnique({
      where: { profileId: id },
    });

    if (!bigFiveProfile) {
      return NextResponse.json(
        { error: 'Big Five profile not found' },
        { status: 404 }
      );
    }

    // Transform to BigFiveData array format
    const bigFiveData = transformProfileToBigFiveData(bigFiveProfile);

    return NextResponse.json({ bigFiveData });
  } catch (error) {
    console.error('Error fetching Big Five data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Big Five data' },
      { status: 500 }
    );
  }
}
