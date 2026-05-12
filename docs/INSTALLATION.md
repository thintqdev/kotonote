# Socket.IO Installation Guide

## Prerequisites

- Node.js v16+ 
- npm or yarn
- MongoDB running
- Existing Kotonote Nihongo backend setup

## Installation Steps

### 1. Install Socket.IO Package

```bash
npm install socket.io
```

Or with yarn:

```bash
yarn add socket.io
```

### 2. Verify Installation

```bash
npm list socket.io
```

Expected output:
```
kotonote-nihongo-backend@1.0.0
└── socket.io@4.7.0
```

### 3. Update package.json

The package.json should now include:

```json
{
  "dependencies": {
    "socket.io": "^4.7.0"
  }
}
```

### 4. Verify Server Starts

```bash
npm run dev
```

Expected output:
```
Server running on port 5000
Environment: development
API Docs: http://localhost:5000/api/docs
WebSocket: ws://localhost:5000
```

## Troubleshooting

### Issue: "Cannot find package 'socket.io'"

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use

**Solution:**
```bash
# Change PORT in .env
PORT=5001
```

### Issue: CORS errors

**Solution:**
Verify CLIENT_URL in .env matches your frontend URL:
```env
CLIENT_URL=http://localhost:5173
```

### Issue: Socket connection fails

**Solution:**
1. Check if server is running
2. Verify JWT token is valid
3. Check browser console for errors
4. Check server logs for Socket.IO errors

## Verification Checklist

- [ ] Socket.IO installed (`npm list socket.io`)
- [ ] Server starts without errors (`npm run dev`)
- [ ] WebSocket endpoint available (`ws://localhost:5000`)
- [ ] API docs accessible (`http://localhost:5000/api/docs`)
- [ ] Notification model loads
- [ ] Socket.IO config loads
- [ ] Queue system initializes

## Next Steps

1. **Frontend Setup**
   - Install Socket.IO client: `npm install socket.io-client`
   - Implement notification components
   - Connect to Socket.IO server

2. **Testing**
   - Test Socket.IO connection
   - Test notification sending
   - Test admin broadcast

3. **Deployment**
   - Configure for production
   - Set up Redis for queue (optional)
   - Configure Socket.IO adapter for scaling

## Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- See SOCKET_IO_GUIDE.md for detailed documentation
- See SOCKET_IO_EXAMPLES.md for code examples

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for errors
3. Verify all dependencies are installed
4. Check MongoDB connection
5. Verify JWT configuration

---

**Installation Status**: Ready to proceed with frontend integration
