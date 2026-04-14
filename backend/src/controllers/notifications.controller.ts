import { Response } from 'express';
import { db, Timestamp } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';

function serializeNotif(data: any): any {
  const result = { ...data };
  if (result.createdAt && typeof result.createdAt === 'object' && '_seconds' in result.createdAt) {
    result.createdAt = new Date(result.createdAt._seconds * 1000).toISOString();
  } else if (result.createdAt?.toDate) {
    result.createdAt = result.createdAt.toDate().toISOString();
  }
  return result;
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.user!.uid)
      .limit(50)
      .get();
    const notifications = snapshot.docs
      .map(d => d.data())
      .sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0))
      .map(serializeNotif);
    res.json({ notifications });
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
