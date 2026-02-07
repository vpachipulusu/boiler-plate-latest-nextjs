/**
 * Logout API Route Handler
 *
 * Handles user logout and session cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { db } from '@/lib/db/client';

/**
 * POST /api/auth/logout
 *
 * Clear user session and revoke tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or header
    const cookieToken = request.cookies.get('auth-token');
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    const idToken = cookieToken?.value || headerToken;

    if (!idToken) {
      // No token to logout, but still clear cookie
      const response = NextResponse.json(
        { success: true, message: 'Logged out successfully' },
        { status: 200 }
      );

      response.cookies.delete('auth-token');
      return response;
    }

    // Verify and decode token to get user info
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed during logout:', error);
      // Token invalid/expired, but still clear cookie
      const response = NextResponse.json(
        { success: true, message: 'Logged out successfully' },
        { status: 200 }
      );

      response.cookies.delete('auth-token');
      return response;
    }

    const { uid: firebaseUid } = decodedToken;

    // Revoke all refresh tokens for this user
    try {
      await adminAuth.revokeRefreshTokens(firebaseUid);
      console.log(`Revoked tokens for user: ${firebaseUid}`);
    } catch (error) {
      console.error('Error revoking tokens:', error);
      // Continue with logout even if revocation fails
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { firebaseUid },
    });

    if (user) {
      // Create audit log
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : request.ip;

      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'user.logout',
          resource: 'User',
          resourceId: user.id,
          ipAddress,
          userAgent: request.headers.get('user-agent'),
        },
      });
    }

    // Create response and clear cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    // Even on error, clear the cookie
    const response = NextResponse.json(
      { error: 'Logout failed, but session cleared' },
      { status: 500 }
    );

    response.cookies.delete('auth-token');

    return response;
  }
}

/**
 * OPTIONS /api/auth/logout
 *
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
