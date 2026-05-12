# Socket.IO Implementation Examples

## Frontend Examples

### 1. Basic Notification Hook (React)

```javascript
// hooks/useNotifications.js
import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useNotifications = (token) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io(process.env.REACT_APP_API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected');
      fetchNotifications();
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Notification events
    newSocket.on('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('notification:unread-count-updated', (data) => {
      setUnreadCount(data.count);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [token]);

  // Fetch notifications
  const fetchNotifications = useCallback(() => {
    if (!socket) return;

    setLoading(true);
    socket.emit('notification:get-list', {
      limit: 20,
      skip: 0,
    }, (response) => {
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.notifications.filter(n => !n.isRead).length);
      }
      setLoading(false);
    });
  }, [socket]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    if (!socket) return;

    socket.emit('notification:get-unread-count', (response) => {
      if (response.success) {
        setUnreadCount(response.count);
      }
    });
  }, [socket]);

  // Mark as read
  const markAsRead = useCallback((notificationId) => {
    if (!socket) return;

    socket.emit('notification:mark-read', notificationId, (response) => {
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    });
  }, [socket]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    if (!socket) return;

    socket.emit('notification:mark-all-read', (response) => {
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    });
  }, [socket]);

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    if (!socket) return;

    socket.emit('notification:delete', notificationId, (response) => {
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
      }
    });
  }, [socket]);

  // Clear old notifications
  const clearOldNotifications = useCallback((daysOld = 30) => {
    if (!socket) return;

    socket.emit('notification:clear-old', daysOld, (response) => {
      if (response.success) {
        fetchNotifications();
      }
    });
  }, [socket]);

  return {
    socket,
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearOldNotifications,
  };
};
```

### 2. Notification Center Component

```javascript
// components/NotificationCenter.jsx
import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationCenter.css';

export const NotificationCenter = ({ token }) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(token);

  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type) => {
    const icons = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ',
    };
    return icons[type] || 'ℹ';
  };

  const getNotificationColor = (type) => {
    const colors = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    };
    return colors[type] || '#3b82f6';
  };

  return (
    <div className="notification-center">
      {/* Bell Icon */}
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="empty">No notifications</div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                  style={{
                    borderLeftColor: getNotificationColor(notif.type),
                  }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="notification-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <small>{new Date(notif.createdAt).toLocaleString()}</small>
                  </div>

                  <div className="notification-actions">
                    {!notif.isRead && (
                      <button
                        className="action-btn"
                        onClick={() => markAsRead(notif._id)}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={() => deleteNotification(notif._id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. Admin Notification Sender

```javascript
// components/AdminNotificationSender.jsx
import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const AdminNotificationSender = ({ token }) => {
  const { socket } = useNotifications(token);
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'info',
    category: 'other',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSend = () => {
    if (!socket) {
      setMessage('Socket not connected');
      return;
    }

    setLoading(true);
    socket.emit('admin:send-notification', formData, (response) => {
      if (response.success) {
        setMessage('Notification sent successfully');
        setFormData({
          userId: '',
          title: '',
          message: '',
          type: 'info',
          category: 'other',
        });
      } else {
        setMessage(`Error: ${response.error}`);
      }
      setLoading(false);
    });
  };

  const handleBroadcast = () => {
    if (!socket) {
      setMessage('Socket not connected');
      return;
    }

    setLoading(true);
    socket.emit('admin:broadcast-notification', {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      category: formData.category,
    }, (response) => {
      if (response.success) {
        setMessage(`Broadcast sent to ${response.sentCount} users`);
        setFormData({
          userId: '',
          title: '',
          message: '',
          type: 'info',
          category: 'other',
        });
      } else {
        setMessage(`Error: ${response.error}`);
      }
      setLoading(false);
    });
  };

  return (
    <div className="admin-notification-sender">
      <h2>Send Notification</h2>

      <div className="form-group">
        <label>User ID (leave empty for broadcast)</label>
        <input
          type="text"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          placeholder="507f1f77bcf86cd799439011"
        />
      </div>

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Notification title"
        />
      </div>

      <div className="form-group">
        <label>Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Notification message"
          rows="4"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="vocabulary">Vocabulary</option>
            <option value="kanji">Kanji</option>
            <option value="quiz">Quiz</option>
            <option value="system">System</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="button-group">
        <button
          onClick={handleSend}
          disabled={loading || !formData.title || !formData.message}
          className="btn btn-primary"
        >
          {loading ? 'Sending...' : 'Send to User'}
        </button>

        <button
          onClick={handleBroadcast}
          disabled={loading || !formData.title || !formData.message}
          className="btn btn-secondary"
        >
          {loading ? 'Broadcasting...' : 'Broadcast to All'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};
```

## Backend Examples

### 1. Send Notification from Service

```javascript
// In vocabularyService.js or similar
import { notificationQueue } from '../utils/queue.js';
import * as notificationService from './notificationService.js';

export const createVocabulary = async (deckId, vocabularyData) => {
  // Create vocabulary
  const vocabulary = await Vocabulary.create({
    deckId,
    ...vocabularyData,
  });

  // Get deck info
  const deck = await VocabularyDeck.findById(deckId);

  // Get all users in this deck (if tracking user progress)
  const users = await User.find({ isActive: true });

  // Send notification to all users
  for (const user of users) {
    notificationQueue.enqueue({
      userId: user._id,
      title: 'New Vocabulary Added',
      message: `"${vocabulary.word}" has been added to "${deck.titleVi}"`,
      type: 'success',
      category: 'vocabulary',
      priority: 'normal',
      actionType: 'view_item',
      actionData: {
        itemId: vocabulary._id,
        itemType: 'vocabulary',
        deckId: deck._id,
      },
    });
  }

  return vocabulary;
};
```

### 2. Send Notification from Controller

```javascript
// In notificationController.js
export const sendNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type = 'info', category = 'other' } = req.body;
  const io = req.app.get('io');

  const notification = await notificationService.createNotification({
    userId,
    title,
    message,
    type,
    category,
    source: 'admin',
  });

  // Send via Socket.IO
  const { sendNotificationToUser } = await import('../config/socket.js');
  sendNotificationToUser(io, userId, notification);

  return apiSuccess(res, { notification }, MESSAGES.MSG_001, 201);
});
```

### 3. Scheduled Notifications

```javascript
// In server.js or separate scheduler file
import cron from 'node-cron';
import * as notificationService from './src/services/notificationService.js';

// Send daily reminder at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    const users = await User.find({ isActive: true });

    for (const user of users) {
      await notificationService.createNotification({
        userId: user._id,
        title: 'Daily Learning Reminder',
        message: 'Time to practice your Japanese!',
        type: 'info',
        category: 'system',
        priority: 'normal',
      });
    }

    console.log('[Scheduler] Daily reminders sent');
  } catch (error) {
    console.error('[Scheduler] Error sending reminders:', error);
  }
});

// Clean up old notifications every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await notificationService.cleanupExpiredNotifications();
    console.log('[Scheduler] Old notifications cleaned up');
  } catch (error) {
    console.error('[Scheduler] Error cleaning up:', error);
  }
});
```

### 4. Webhook Notifications

```javascript
// In webhookController.js
export const handleWebhook = asyncHandler(async (req, res) => {
  const { event, data } = req.body;
  const io = req.app.get('io');

  switch (event) {
    case 'vocabulary.created':
      await notificationService.createNotification({
        userId: data.userId,
        title: 'New Vocabulary',
        message: `"${data.word}" has been added`,
        type: 'success',
        category: 'vocabulary',
        source: 'webhook',
      });
      break;

    case 'quiz.completed':
      await notificationService.createNotification({
        userId: data.userId,
        title: 'Quiz Completed',
        message: `You scored ${data.score}/${data.total}`,
        type: data.score >= 80 ? 'success' : 'info',
        category: 'quiz',
        source: 'webhook',
      });
      break;

    case 'achievement.unlocked':
      const notification = await notificationService.createNotification({
        userId: data.userId,
        title: 'Achievement Unlocked!',
        message: data.achievementName,
        type: 'success',
        category: 'achievement',
        priority: 'high',
        source: 'webhook',
      });

      // Broadcast to admin
      const { sendToAdminRoom } = await import('../config/socket.js');
      sendToAdminRoom(io, {
        type: 'achievement_unlocked',
        user: data.userName,
        achievement: data.achievementName,
      });
      break;
  }

  return apiSuccess(res, { success: true }, MESSAGES.MSG_001, 200);
});
```

## Testing

### Socket.IO Testing with Jest

```javascript
// __tests__/socket.test.js
import { io as ioClient } from 'socket.io-client';
import { Server } from 'socket.io';
import { createServer } from 'http';

describe('Socket.IO Notifications', () => {
  let server, io, socket;

  beforeAll((done) => {
    server = createServer();
    io = new Server(server);
    server.listen(() => {
      const port = server.address().port;
      socket = ioClient(`http://localhost:${port}`, {
        auth: { token: 'test-token' },
      });
      socket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    socket.close();
    server.close();
  });

  test('should receive new notification', (done) => {
    socket.on('notification:new', (notification) => {
      expect(notification.title).toBe('Test Notification');
      done();
    });

    io.emit('notification:new', {
      title: 'Test Notification',
      message: 'Test message',
    });
  });

  test('should mark notification as read', (done) => {
    socket.emit('notification:mark-read', 'notif-123', (response) => {
      expect(response.success).toBe(true);
      done();
    });
  });
});
```

## Performance Tips

1. **Batch Notifications**: Send multiple notifications in one operation
2. **Pagination**: Load notifications in pages, not all at once
3. **Cleanup**: Regularly delete old notifications
4. **Indexing**: Ensure database indexes on userId, createdAt, isRead
5. **Caching**: Cache unread count in Redis
6. **Compression**: Enable Socket.IO compression for large payloads
