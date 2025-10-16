import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { profileCreateSchema } from '@/validators/profile';
import { logger } from '@/lib/logger';
import { getDefaultAdminEmail } from '@/lib/auth-config';

// Enable caching for this route - revalidate every 60 seconds
export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Get total count and profiles in parallel
    // Optimize: Only select necessary fields for Team Directory (exclude large JSONB data)
    // Filter out admin users
    const [total, profiles] = await Promise.all([
      prisma.userProfile.count({
        where: {
          email: {
            not: getDefaultAdminEmail(),
          },
        },
      }),
      prisma.userProfile.findMany({
        where: {
          email: {
            not: getDefaultAdminEmail(),
          },
        },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          email: true,
          name: true,
          team: true,
          birthday: true,
          createdAt: true,
          updatedAt: true,
          // Include only minimal related data
          coreValues: {
            select: {
              values: true,
            },
          },
          characterStrengths: {
            select: {
              strengths: true,
            },
          },
          chronotype: {
            select: {
              types: true,
              primaryType: true,
            },
          },
          // Include only Big Five ID to check existence (for completeness calculation)
          // Don't include the large JSONB fields
          bigFiveProfile: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return NextResponse.json({
      data: profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error('Error fetching profiles', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = profileCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { userId, email, name, team, birthday } = validationResult.data;

    // Check if profile with email already exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { email: email || undefined },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile with this email already exists' },
        { status: 409 }
      );
    }

    const profile = await prisma.userProfile.create({
      data: {
        userId,
        email,
        name,
        team,
        birthday: birthday ? new Date(birthday) : null,
      },
      include: {
        coreValues: true,
        characterStrengths: true,
        chronotype: true,
        bigFiveProfile: true,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    logger.error('Error creating profile', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
