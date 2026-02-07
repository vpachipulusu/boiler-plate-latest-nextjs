'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { adminAuth } from '@/lib/firebase/admin';
import { db } from '@/lib/db/client';
import { profileUpdateSchema, userSettingsSchema } from '@/lib/utils/validation';

/**
 * Response type for user actions
 */
type UserActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Get authenticated user ID from session
 */
async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const user = await db.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
      select: { id: true },
    });

    return user?.id || null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Get user profile
 */
export async function getUserProfileAction(): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          location: user.location,
          website: user.website,
          phoneNumber: user.phoneNumber,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          createdAt: user.createdAt,
          settings: user.settings,
        },
      },
    };
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get user profile',
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfileAction(
  data: z.infer<typeof profileUpdateSchema>
): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Validate input
    const validation = profileUpdateSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        location: data.location,
        website: data.website || null,
        phoneNumber: data.phoneNumber,
      },
    });

    return {
      success: true,
      data: { user: updatedUser },
    };
  } catch (error: any) {
    console.error('Update user profile error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    };
  }
}

/**
 * Update user avatar
 */
export async function updateUserAvatarAction(avatarUrl: string): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Validate URL
    const urlSchema = z.string().url();
    const validation = urlSchema.safeParse(avatarUrl);
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid avatar URL',
      };
    }

    // Update avatar
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return {
      success: true,
      data: { avatarUrl: updatedUser.avatarUrl },
    };
  } catch (error: any) {
    console.error('Update avatar error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update avatar',
    };
  }
}

/**
 * Get user settings
 */
export async function getUserSettingsAction(): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    let settings = await db.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await db.userSettings.create({
        data: { userId },
      });
    }

    return {
      success: true,
      data: { settings },
    };
  } catch (error: any) {
    console.error('Get user settings error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get settings',
    };
  }
}

/**
 * Update user settings
 */
export async function updateUserSettingsAction(
  data: z.infer<typeof userSettingsSchema>
): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Validate input
    const validation = userSettingsSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    // Update settings
    const settings = await db.userSettings.upsert({
      where: { userId },
      update: {
        theme: data.theme,
        emailNotifications: data.emailNotifications,
        language: data.language,
        timezone: data.timezone,
      },
      create: {
        userId,
        theme: data.theme,
        emailNotifications: data.emailNotifications,
        language: data.language,
        timezone: data.timezone,
      },
    });

    return {
      success: true,
      data: { settings },
    };
  } catch (error: any) {
    console.error('Update user settings error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update settings',
    };
  }
}

/**
 * Get user notifications
 */
export async function getUserNotificationsAction(
  limit = 10,
  offset = 0
): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const totalCount = await db.notification.count({
      where: { userId },
    });

    const unreadCount = await db.notification.count({
      where: { userId, read: false },
    });

    return {
      success: true,
      data: {
        notifications,
        totalCount,
        unreadCount,
      },
    };
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get notifications',
    };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationReadAction(notificationId: string): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Verify notification belongs to user
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return {
        success: false,
        error: 'Notification not found',
      };
    }

    // Mark as read
    await db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return {
      success: true,
      data: { message: 'Notification marked as read' },
    };
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return {
      success: false,
      error: error.message || 'Failed to mark notification as read',
    };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsReadAction(): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    await db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return {
      success: true,
      data: { message: 'All notifications marked as read' },
    };
  } catch (error: any) {
    console.error('Mark all notifications read error:', error);
    return {
      success: false,
      error: error.message || 'Failed to mark all notifications as read',
    };
  }
}

/**
 * Delete notification
 */
export async function deleteNotificationAction(notificationId: string): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Verify notification belongs to user
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return {
        success: false,
        error: 'Notification not found',
      };
    }

    // Delete notification
    await db.notification.delete({
      where: { id: notificationId },
    });

    return {
      success: true,
      data: { message: 'Notification deleted' },
    };
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete notification',
    };
  }
}

/**
 * Get user login history
 */
export async function getUserLoginHistoryAction(
  limit = 10,
  offset = 0
): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const loginHistory = await db.loginHistory.findMany({
      where: { userId },
      orderBy: { loginAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const totalCount = await db.loginHistory.count({
      where: { userId },
    });

    return {
      success: true,
      data: {
        loginHistory,
        totalCount,
      },
    };
  } catch (error: any) {
    console.error('Get login history error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get login history',
    };
  }
}

/**
 * Delete user account
 */
export async function deleteUserAccountAction(): Promise<UserActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Delete from Firebase Auth
    await adminAuth.deleteUser(user.firebaseUid);

    // Delete from database (cascade will handle related records)
    await db.user.delete({
      where: { id: userId },
    });

    // Clear session
    const cookieStore = await cookies();
    cookieStore.delete('session');

    return {
      success: true,
      data: { message: 'Account deleted successfully' },
    };
  } catch (error: any) {
    console.error('Delete account error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete account',
    };
  }
}
