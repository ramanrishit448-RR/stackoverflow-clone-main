import Notification from "../models/notification.js";

const PAGE_SIZE = 20;

export const getNotifications = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const filter = { recipientId: req.userid };
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, read: false }),
    ]);

    res.status(200).json({
      data: notifications,
      unreadCount,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.userid },
      { read: true }
    );
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.userid, read: false },
      { read: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.userid,
      read: false,
    });
    res.status(200).json({ data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({ message: "Failed to get unread count" });
  }
};
