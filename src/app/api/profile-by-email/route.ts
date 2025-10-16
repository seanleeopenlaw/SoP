import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { transformProfileToBigFiveData } from '@/lib/big-five-config';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get auth session email from request (set by login)
    // For now, users can only access their own profile
    // This will be validated when we add proper session management
    const requestEmail = email; // In production, this should come from validated session

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Try to find existing profile by email
    let profile = await prisma.userProfile.findFirst({
      where: { email: normalizedEmail },
      include: {
        coreValues: true,
        characterStrengths: true,
        chronotype: true,
        bigFiveProfile: true,
        goals: true,
      },
    });

    // If no profile exists, create a new one
    if (!profile) {
      // Generate a UUID for user_id (since we're not using real auth)
      const crypto = require('crypto');
      const userId = crypto.randomUUID();

      profile = await prisma.userProfile.create({
        data: {
          userId,
          email: normalizedEmail,
          name: normalizedEmail, // Default to email, will be updated by user
          team: '',
        },
        include: {
          coreValues: true,
          characterStrengths: true,
          chronotype: true,
          bigFiveProfile: true,
          goals: true,
        },
      });
    }

    // Transform bigFiveProfile to bigFiveData array format using centralized utility
    const transformedProfile = {
      ...profile,
      bigFiveData: profile.bigFiveProfile ? transformProfileToBigFiveData(profile.bigFiveProfile) : []
    };

    return NextResponse.json(transformedProfile);
  } catch (error) {
    console.error('Error finding/creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
