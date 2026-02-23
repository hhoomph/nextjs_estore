/**
 * Module for resend-verification route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { randomBytes } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return NextResponse.json({
        message:
          "If a user with this email exists, a new verification email has been sent.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 },
      );
    }

    // Generate a new verification token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save the verification token
    await prisma.verificationToken.create({
      data: {
        id: randomBytes(16).toString("hex"),
        identifier: email,
        token,
        expires,
        email,
      },
    });

    // Create verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Send verification email
    if (process.env.NODE_ENV === "production") {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address - E-Store",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Verify Your Email Address</h2>
            <p>Hello ${user.name || "there"},</p>
            <p>Thank you for registering with E-Store. Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}"
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              E-Store - Your Premier Online Shopping Destination
            </p>
          </div>
        `,
      });
    } else {
      // Development mode - log the verification URL
      console.log(`--- RESEND VERIFICATION EMAIL ---`);
      console.log(`Email: ${email}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log(`Token: ${token}`);
      console.log(`Expires: ${expires}`);
      console.log(`--- END RESEND VERIFICATION ---`);
    }

    return NextResponse.json({
      message:
        "If a user with this email exists, a new verification email has been sent.",
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 },
    );
  }
}
