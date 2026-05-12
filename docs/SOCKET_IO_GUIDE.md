# Socket.IO Real-Time Notifications Guide

## Overview

Socket.IO implementation cho hệ thống thông báo real-time trong Kotonote Nihongo. Hỗ trợ:
- Thông báo real-time từ admin
- Queue-based notification processing
- User-specific và broadcast notifications
- Admin dashboard monitoring

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Frontend)                         │
│  - Socket.IO Client                                          │
│  - Listen to notification events                             │
│  - Send user actions (mark read, delete, etc.)              │
└────────────────────┬────────────────────────────────────────┘
                     │ WebSocket
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Socket.IO Server (Backend)                      │
│  - Authentication middleware                                │
│  - Event handlers                                            │
│  - Room management (user:userId, admin)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │ Queue  │  │ Service│  │ Database │
    │ System │  │ Layer  │  │ (MongoDB)│
    └────────┘  └────────┘  └──────────┘
```

## Installation

### 1. Install Dependencies

```bash
npm install socket.io
```

### 2. Update package.json

```json
{
  "dependencies": {
    "socket.io": "^4.7.0"
  }
}
```

## Models

### Notification Model

```javascript
{
  userId: ObjectId,              // Recipient
  title: String,                 // Notification title
  message: String,               // Notification message
  type: String,                  // info, success, warning, error, task_update, system, admin_action
  category: String,              // vocabulary, kanji, quiz, streak, achievement, system, admin, other
  priority: String,              // low, normal, high, urgent
  isRead: Boolean,               // Read status
  readAt: Date,                  // When marked as read
  actionType: String,            // none, view_item, open_page, download, confirm, dismiss
  actionData: Mixed,             // Additional action data
  source: String,                // system, admin, queue, webhook
  deliveredAt: Date,             // When delivered
  expiresAt: Date,               // Auto-delete after this date
  batchId: String,               // For batch notifications
  createdAt: Date,
  updatedAt: Date
}
```

## Socket Events

### Client → Server Events

#### Notification Management

```javascript
// Get unread count
socket.emit('notification:get-unread-count', (response) => {
  console.log(response); // { success: true, count: 5 }
});

// Get notifications list
socket.emit('notification:get-list', {
  limit: 20,
  skip: 0,
  isRead: false,
  type: 'info',
  category: 'vocabulary'
}, (response) => {
  console.log(response); // { success: true, notifications: [...], total: 10 }
});

// Mark as read
socket.emit('notification:mark-read', notificationId, (response) => {
  console.log(response); // { success: true }
});

// Mark all as read
socket.emit('notification:mark-all-read', (response) => {
  console.log(response); // { success: true }
});

// Delete notification
socket.emit('notification:delete', notificationId, (response) => {
  console.log(response); // { success: true }
});

// Clear old notifications
socket.emit('notification:clear-old', 30, (response) => {
  console.log(response); // { success: true, deletedCount: 5 }
});
```

#### Admin Events

```javascript
// Send notification to specific user
socket.emit('admin:send-notification', {
  userId: '507f1f77bcf86cd799439011',
  title: 'New Vocabulary',
  message: 'A new vocabulary has been added',
  type: 'success',
  category: 'vocabulary'
}, (response) => {
  console.log(response); // { success: true, notificationId: '...' }
});

// Broadcast to all users
socket.emit('admin:broadcast-notification', {
  title: 'System Maintenance',
  message: 'Server will be down for maintenance',
  type: 'warning',
  category: 'system',
  userIds: ['user1', 'user2'] // Optional, if not provided sends to all
}, (response) => {
  console.log(response); // { success: true, sentCount: 1250, batchId: '...' }
});

// Get connected users
socket.emit('admin:get-connected-users', (response) => {
  console.log(response); // { success: true, users: [...], count: 150 }
});
```

### Server → Client Events

```javascript
// New notification received
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
  // {
  //   _id: '...',
  //   title: 'New Vocabulary',
  //   message: 'A new vocabulary has been added',
  //   type: 'success',
  //   category: 'vocabulary',
  //   createdAt: '2024-05-12T10:30:00Z'
  // }
});

// Unread count updated
socket.on('notification:unread-count-updated', (data) => {
  console.log('Unread count:', data.count);
});

// Admin notification
socket.on('admin:notification', (data) => {
  console.log('Admin notification:', data);
});
```

## REST API Endpoints

### User Endpoints

```
GET    /api/notifications                    # Get notifications
GET    /api/notifications/unread-count       # Get unread count
GET    /api/notifications/stats              # Get statistics
GET    /api/notifications/:id                # Get by ID
PUT    /api/notifications/:id/read           # Mark as read
PUT    /api/notifications/mark-all-read      # Mark all as read
DELETE /api/notifications/:id                # Delete
DELETE /api/notifications/clear-old          # Clear old notifications
```

### Admin Endpoints

```
GET    /api/admin/notifications              # Get all notifications
GET    /api/admin/notifications/stats        # Get statistics
POST   /api/admin/notifications/send         # Send to user
POST   /api/admin/notifications/send-batch   # Send to multiple users
POST   /api/admin/notifications/broadcast    # Broadcast to all
DELETE /api/admin/notifications/:id          # Delete notification
```

## Usage Examples

### Frontend (React)

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Listen for new notifications
    newSocket.on('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Listen for unread count updates
    newSocket.on('notification:unread-count-updated', (data) => {
      setUnreadCount(data.count);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const getNotifications = () => {
    socket?.emit('notification:get-list', {
      limit: 20,
      skip: 0
    }, (response) => {
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.notifications.filter(n => !n.isRead).length);
      }
    });
  };

  const markAsRead = (notificationId) => {
    socket?.emit('notification:mark-read', notificationId, (response) => {
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    });
  };

  const deleteNotification = (notificationId) => {
    socket?.emit('notification:delete', notificationId, (response) => {
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
      }
    });
  };

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      <button onClick={getNotifications}>Refresh</button>
      
      <ul>
        {notifications.map(notif => (
          <li key={notif._id} className={notif.isRead ? 'read' : 'unread'}>
            <h3>{notif.title}</h3>
            <p>{notif.message}</p>
            <button onClick={() => markAsRead(notif._id)}>Mark as read</button>
            <button onClick={() => deleteNotification(notif._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationCenter;
```

### Backend - Send Notification from Service

```javascript
import { notificationQueue } from './src/utils/queue.js';
import * as notificationService from './src/services/notificationService.js';

// Add to queue
notificationQueue.enqueue({
  userId: '507f1f77bcf86cd799439011',
  title: 'New Vocabulary Added',
  message: 'A new vocabulary has been added to your deck',
  type: 'success',
  category: 'vocabulary',
  actionType: 'view_item',
  actionData: { itemId: 'vocab123', itemType: 'vocabulary' }
});

// Or create directly
const notification = await notificationService.createNotification({
  userId: '507f1f77bcf86cd799439011',
  title: 'New Vocabulary Added',
  message: 'A new vocabulary has been added to your deck',
  type: 'success',
  category: 'vocabulary'
});
```

### Backend - Send from Admin Controller

```javascript
// In admin controller or service
const io = req.app.get('io'); // Get Socket.IO instance from app

const { sendNotificationToUser } = await import('./src/config/socket.js');

sendNotificationToUser(io, userId, {
  _id: notification._id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  category: notification.category,
  createdAt: notification.createdAt
});
```

## Queue System

### How It Works

1. **Enqueue**: Add notification to queue
2. **Process**: Queue processor picks up notifications in batches
3. **Retry**: Failed notifications are retried up to 3 times
4. **Deliver**: Successfully processed notifications are sent to users

### Configuration

```javascript
// In queue.js
const queue = new NotificationQueue();

queue.maxRetries = 3;           // Max retry attempts
queue.retryDelay = 5000;        // 5 seconds between retries
queue.batchSize = 10;           // Process 10 at a time
queue.processInterval = 1000;   // Check queue every 1 second

// Start processing
queue.startProcessing(async (notification) => {
  // Process notification
  const created = await notificationService.createNotification(notification);
  // Send via Socket.IO
  sendNotificationToUser(io, notification.userId, created);
});
```

## Best Practices

### 1. Authentication
- Always verify JWT token in Socket.IO middleware
- Attach user info to socket object
- Validate user ownership before operations

### 2. Performance
- Use rooms for targeted messaging
- Batch notifications when possible
- Implement pagination for notification lists
- Clean up old notifications regularly

### 3. Error Handling
- Implement retry logic for failed deliveries
- Log errors for debugging
- Provide meaningful error messages to clients

### 4. Security
- Validate all input data
- Check user permissions
- Rate limit notification sending
- Sanitize notification content

### 5. Scalability
- Use Redis for production queue (Bull, RabbitMQ)
- Implement horizontal scaling with Socket.IO adapter
- Monitor queue size and processing time
- Archive old notifications

## Monitoring

### Queue Stats

```javascript
const stats = notificationQueue.getStats();
console.log(stats);
// {
//   queueSize: 150,
//   isProcessing: true,
//   totalProcessed: 5000,
//   totalFailed: 2
// }
```

### Notification Stats

```javascript
const stats = await notificationService.getNotificationStats(userId);
console.log(stats);
// {
//   totalCount: 100,
//   unreadCount: 5,
//   readCount: 95,
//   byType: { success: 50, info: 30, warning: 20 },
//   byCategory: { vocabulary: 40, kanji: 30, system: 30 },
//   byPriority: { normal: 80, high: 15, urgent: 5 }
// }
```

## Troubleshooting

### Connection Issues

```javascript
// Check if socket is connected
if (socket.connected) {
  console.log('Connected');
} else {
  console.log('Disconnected');
}

// Listen for connection events
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
socket.on('error', (error) => console.error('Error:', error));
```

### Notification Not Received

1. Check if user is connected: `admin:get-connected-users`
2. Verify notification was created in database
3. Check browser console for errors
4. Check server logs for Socket.IO errors

### Queue Not Processing

1. Check if queue is started: `notificationQueue.processing`
2. Check queue size: `notificationQueue.size()`
3. Check for errors in server logs
4. Verify database connection

## Production Deployment

### Recommended Setup

1. **Use Redis for Queue**
   ```bash
   npm install bull redis
   ```

2. **Use Socket.IO Adapter**
   ```bash
   npm install @socket.io/redis-adapter
   ```

3. **Enable Clustering**
   - Use PM2 or similar process manager
   - Configure Socket.IO adapter for multi-server setup

4. **Monitoring**
   - Set up logging (Winston, Bunyan)
   - Monitor queue size and processing time
   - Alert on high error rates

## References

- [Socket.IO Documentation](https://socket.io/docs/)
- [Socket.IO Best Practices](https://socket.io/docs/v4/best-practices/)
- [Bull Queue Documentation](https://docs.bullmq.io/)
