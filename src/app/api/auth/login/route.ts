import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isAdminEmail } from '@/lib/auth-config';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in database
    let user = await prisma.userProfile.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    let isNewUser = false;

    // If user doesn't exist, create a new user profile
    if (!user) {
      const crypto = require('crypto');
      const userId = crypto.randomUUID();

      user = await prisma.userProfile.create({
        data: {
          userId,
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0], // Default name from email
          team: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      isNewUser = true;
    }

    // Check if user is admin (server-side validation)
    const isAdmin = isAdminEmail(normalizedEmail);

    // Return session data
    return NextResponse.json({
      email: user.email,
      name: user.name,
      isAdmin,
      isNewUser,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
