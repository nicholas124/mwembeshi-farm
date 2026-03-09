import { prisma } from './prisma';

type CreateNotificationParams = {
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  createdById?: string;
};

export async function createNotification(params: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        type: params.type as never,
        title: params.title,
        message: params.message,
        entityType: params.entityType,
        entityId: params.entityId,
        createdById: params.createdById,
      },
    });
  } catch (error) {
    // Don't let notification failures break the main operation
    console.error('Failed to create notification:', error);
  }
}
