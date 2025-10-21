import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { profileUpdateSchema } from '@/validators/profile';
import { ChronotypeAnimal, Prisma } from '@prisma/client';
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

    const profile = await prisma.userProfile.findUnique({
      where: { id },
      include: {
        coreValues: true,
        characterStrengths: true,
        chronotype: true,
        bigFiveProfile: true,
        goals: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Transform bigFiveProfile to bigFiveData array format using centralized utility
    const transformedProfile = {
      ...profile,
      bigFiveData: profile.bigFiveProfile ? transformProfileToBigFiveData(profile.bigFiveProfile) : []
    };

    return NextResponse.json(transformedProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();

    // Validate request body
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, team, jobTitle, birthday, coreValues, characterStrengths, chronotype, bigFiveProfile, goals } = validationResult.data;

    // OPTIMIZED: Execute all updates in parallel WITHOUT transaction
    // Reasoning: Each update is independent and atomic at the row level
    // Database constraints (CASCADE) ensure referential integrity
    // This eliminates transaction overhead and timeout issues with Supabase pooler
    await Promise.all([
      // Update basic profile fields
      prisma.userProfile.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(team && { team }),
          ...(jobTitle !== undefined && { jobTitle }),
          ...(birthday && { birthday: new Date(birthday) }),
        },
      }),

      // Update core values if provided
      coreValues ? prisma.coreValues.upsert({
        where: { profileId: id },
        create: {
          profileId: id,
          values: coreValues,
        },
        update: {
          values: coreValues,
        },
      }) : Promise.resolve(null),

      // Update character strengths if provided
      characterStrengths ? prisma.characterStrengths.upsert({
        where: { profileId: id },
        create: {
          profileId: id,
          strengths: characterStrengths,
        },
        update: {
          strengths: characterStrengths,
        },
      }) : Promise.resolve(null),

      // Update chronotype if provided, or delete if null
      chronotype === null
        ? prisma.chronotype.deleteMany({
            where: { profileId: id },
          })
        : chronotype
        ? prisma.chronotype.upsert({
            where: { profileId: id },
            create: {
              profileId: id,
              types: chronotype.types as ChronotypeAnimal[],
              primaryType: chronotype.primaryType as ChronotypeAnimal,
            },
            update: {
              types: chronotype.types as ChronotypeAnimal[],
              primaryType: chronotype.primaryType as ChronotypeAnimal,
            },
          })
        : Promise.resolve(null),

      // Update Big Five if provided
      bigFiveProfile ? prisma.bigFiveProfile.upsert({
        where: { profileId: id },
        create: {
          profileId: id,
          opennessData: bigFiveProfile.opennessData || {},
          conscientiousnessData: bigFiveProfile.conscientiousnessData || {},
          extraversionData: bigFiveProfile.extraversionData || {},
          agreeablenessData: bigFiveProfile.agreeablenessData || {},
          neuroticismData: bigFiveProfile.neuroticismData || {},
        },
        update: {
          opennessData: bigFiveProfile.opennessData || {},
          conscientiousnessData: bigFiveProfile.conscientiousnessData || {},
          extraversionData: bigFiveProfile.extraversionData || {},
          agreeablenessData: bigFiveProfile.agreeablenessData || {},
          neuroticismData: bigFiveProfile.neuroticismData || {},
        },
      }) : Promise.resolve(null),

      // Update goals if provided
      goals ? prisma.goals.upsert({
        where: { profileId: id },
        create: {
          profileId: id,
          period: goals.period,
          professionalGoals: goals.professionalGoals || null,
          personalGoals: goals.personalGoals || null,
        },
        update: {
          period: goals.period,
          professionalGoals: goals.professionalGoals || null,
          personalGoals: goals.personalGoals || null,
        },
      }) : Promise.resolve(null),
    ]);

    // Fetch and return the complete updated profile with all relations
    // Separate query outside parallel updates for cleaner error handling
    const updatedProfile = await prisma.userProfile.findUnique({
      where: { id },
      include: {
        coreValues: true,
        characterStrengths: true,
        chronotype: true,
        bigFiveProfile: true,
        goals: true,
      },
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Profile not found after update' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
      if (error.code === 'P2028') {
        return NextResponse.json(
          { error: 'Transaction timeout - please try again' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete profile and all related data using transaction
    await prisma.$transaction(async (tx) => {
      // Delete all related data first (Prisma will handle this with cascading deletes if configured)
      await Promise.all([
        tx.coreValues.deleteMany({ where: { profileId: id } }),
        tx.characterStrengths.deleteMany({ where: { profileId: id } }),
        tx.chronotype.deleteMany({ where: { profileId: id } }),
        tx.bigFiveProfile.deleteMany({ where: { profileId: id } }),
        tx.goals.deleteMany({ where: { profileId: id } }),
      ]);

      // Delete the profile itself
      await tx.userProfile.delete({ where: { id } });
    }, {
      maxWait: 15000,
      timeout: 15000,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
      if (error.code === 'P2028') {
        return NextResponse.json(
          { error: 'Transaction timeout - please try again' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}
