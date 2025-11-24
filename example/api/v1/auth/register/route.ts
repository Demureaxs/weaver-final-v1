import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: 'User with this email already exists.' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a default name from the email
    const name = email.split('@')[0];

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name, // Provide the new name field
        profile: {
          create: {
            credits: 50, // Assign 50 credits to the new profile
          },
        },
      },
      include: {
        profile: true, // Include the created Profile object in the response
      },
    });

    // Automatically log the user in by setting the session
    await setSession({ userId: newUser.id });

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ success: true, user: userWithoutPassword, message: 'Registration successful and logged in.' }, { status: 201 });

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
