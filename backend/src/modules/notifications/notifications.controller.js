import * as notificationService from './notifications.service.js';

export async function listNotifications(req, res, next) {
  try {
    const readStatus =
      req.query.readStatus !== undefined ? req.query.readStatus === 'true' : undefined;
    const notifications = await notificationService.listNotifications(req.user.id, readStatus);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
