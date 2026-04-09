import { Response } from 'express';
import { db, Timestamp } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.user!.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    res.json({ notifications: snapshot.docs.map(d => d.data()) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection('notifications')
      .where('id', '==', id)
      .where('userId', '==', req.user!.uid)
      .get();

    if (snapshot.empty) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    await snapshot.docs[0].ref.update({ isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch {
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.user!.uid)
      .where('isRead', '==', false)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.update(doc.ref, { isRead: true }));
    await batch.commit();

    res.json({ message: 'All notifications marked as read' });
  } catch {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};
