// Ryazhenka Chat PRO Server
// With WebSocket, Image Upload, User Search

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Create uploads directory
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// Data storage
const users = new Map();
const messages = [];
const onlineUsers = new Set();

function generateToken() {
    return 'RYA_TOKEN_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

function log(msg) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

// 1. Register/Login
app.post('/api/register', (req, res) => {
    const { userId, username, console: consoleType } = req.body;
    
    if(!userId || !username) {
        return res.status(400).json({ error: 'Missing userId or username' });
    }
    
    if(users.has(userId)) {
        const user = users.get(userId);
        log(`User login: ${username} (${userId})`);
        return res.json({ 
            success: true, 
            token: user.token,
            user: user
        });
    }
    
    const token = generateToken();
    const user = {
        userId,
        username,
        token,
        console: consoleType || 'Switch',
        avatar: null,
        bio: '',
        status: 'online',
        registeredAt: new Date().toISOString()
    };
    
    users.set(userId, user);
    
    messages.push({
        id: Date.now().toString(),
        userId: 'SYSTEM',
        username: 'System',
        text: `${username} joined the chat! 👋`,
        timestamp: new Date().toISOString(),
        isSystem: true
    });
    
    // Broadcast new user
    io.emit('userJoined', user);
    
    log(`New user: ${username} (${userId})`);
    
    res.json({ 
        success: true, 
        token,
        user
    });
});

// 2. Send Message
app.post('/api/send', (req, res) => {
    const { userId, username, text, imageUrl, token } = req.body;
    
    if(!userId || (!text && !imageUrl) || !token) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const user = users.get(userId);
    if(!user || user.token !== token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Anti-spam
    const recentMessages = messages.filter(m => 
        m.userId === userId && 
        Date.now() - new Date(m.timestamp).getTime() < 60000
    );
    
    if(recentMessages.length >= 10) {
        return res.status(429).json({ error: 'Too many messages!' });
    }
    
    const message = {
        id: Date.now().toString(),
        userId,
        username: user.username,
        text: text || '',
        imageUrl: imageUrl || null,
        timestamp: new Date().toISOString(),
        isSystem: false,
        isRead: false
    };
    
    messages.push(message);
    
    if(messages.length > 1000) {
        messages.shift();
    }
    
    // Broadcast to all clients via WebSocket
    io.emit('newMessage', message);
    
    log(`Message from ${username}: ${text || '[image]'}`);
    
    res.json({ success: true, message });
});

// 3. Get Messages
app.get('/api/messages', (req, res) => {
    const token = req.query.token;
    const since = req.query.since;
    const limit = parseInt(req.query.limit) || 100;
    
    if(!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    let authorized = false;
    for(let [userId, user] of users) {
        if(user.token === token) {
            authorized = true;
            onlineUsers.add(userId);
            break;
        }
    }
    
    if(!authorized) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    let filteredMessages = messages;
    
    if(since) {
        filteredMessages = messages.filter(m => 
            new Date(m.timestamp) > new Date(since)
        );
    }
    
    const recentMessages = filteredMessages.slice(-limit);
    
    res.json({ 
        success: true,
        messages: recentMessages,
        onlineCount: onlineUsers.size
    });
});

// 4. Upload Image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    
    log(`Image uploaded: ${req.file.filename}`);
    
    res.json({
        success: true,
        imageUrl: imageUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
    });
});

// 5. Search Users (BY ID OR USERNAME!)
app.get('/api/users/search', (req, res) => {
    const token = req.query.token;
    const query = req.query.q;
    
    if(!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    let authorized = false;
    for(let [userId, user] of users) {
        if(user.token === token) {
            authorized = true;
            break;
        }
    }
    
    if(!authorized) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    if(!query || query.length < 2) {
        return res.status(400).json({ error: 'Query too short (min 2 chars)' });
    }
    
    const results = [];
    const queryLower = query.toLowerCase();
    
    for(let [userId, user] of users) {
        // Search by ID or username (case-insensitive)
        if(user.userId.toLowerCase().includes(queryLower) ||
           user.username.toLowerCase().includes(queryLower)) {
            results.push({
                userId: user.userId,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio,
                status: user.status
            });
        }
    }
    
    log(`User search "${query}": ${results.length} results`);
    
    res.json({
        success: true,
        query: query,
        results: results,
        count: results.length
    });
});

// 6. Get All Online Users
app.get('/api/users/online', (req, res) => {
    const token = req.query.token;
    
    if(!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    let authorized = false;
    for(let [userId, user] of users) {
        if(user.token === token) {
            authorized = true;
            break;
        }
    }
    
    if(!authorized) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    const online = [];
    for(let userId of onlineUsers) {
        const user = users.get(userId);
        if(user) {
            online.push({
                userId: user.userId,
                username: user.username,
                avatar: user.avatar,
                status: 'online'
            });
        }
    }
    
    res.json({
        success: true,
        online: online,
        count: online.length
    });
});

// 7. Update User Profile
app.post('/api/profile/update', (req, res) => {
    const { userId, token, avatar, bio } = req.body;
    
    if(!userId || !token) {
        return res.status(400).json({ error: 'Missing userId or token' });
    }
    
    const user = users.get(userId);
    if(!user || user.token !== token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if(avatar) user.avatar = avatar;
    if(bio) user.bio = bio;
    
    users.set(userId, user);
    
    log(`Profile updated: ${user.username}`);
    
    res.json({
        success: true,
        user: user
    });
});

// 8. Stats
app.get('/api/stats', (req, res) => {
    res.json({
        totalUsers: users.size,
        onlineUsers: onlineUsers.size,
        totalMessages: messages.length,
        serverUptime: process.uptime()
    });
});

// WebSocket Connection
io.on('connection', (socket) => {
    log(`WebSocket connected: ${socket.id}`);
    
    socket.on('authenticate', (data) => {
        const { userId, token } = data;
        const user = users.get(userId);
        
        if(user && user.token === token) {
            socket.userId = userId;
            onlineUsers.add(userId);
            
            io.emit('userOnline', { userId, username: user.username });
            log(`User authenticated via WS: ${user.username}`);
        }
    });
    
    socket.on('typing', (data) => {
        if(socket.userId) {
            socket.broadcast.emit('userTyping', {
                userId: socket.userId,
                username: users.get(socket.userId).username
            });
        }
    });
    
    socket.on('disconnect', () => {
        if(socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('userOffline', { userId: socket.userId });
            log(`User disconnected: ${socket.userId}`);
        }
    });
});

// Clear online users every 5 minutes
setInterval(() => {
    onlineUsers.clear();
    log('Cleared online users list');
}, 5 * 60 * 1000);

// Main page
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Ryazhenka Chat PRO Server</title>
            <style>
                body { font-family: Arial; max-width: 900px; margin: 50px auto; padding: 20px; }
                h1 { color: #8a2be2; }
                .stat { background: #f0f0f0; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .feature { color: green; }
            </style>
        </head>
        <body>
            <h1>💬 Ryazhenka Chat PRO Server 🚀</h1>
            <div class="stat">
                <strong>Status:</strong> ✅ Running<br>
                <strong>Total Users:</strong> ${users.size}<br>
                <strong>Online Users:</strong> ${onlineUsers.size}<br>
                <strong>Total Messages:</strong> ${messages.length}<br>
                <strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds
            </div>
            <h2>✨ PRO Features:</h2>
            <ul>
                <li class="feature">🔍 User Search by ID/Username</li>
                <li class="feature">📷 Image Upload</li>
                <li class="feature">⚡ WebSocket Real-time</li>
                <li class="feature">🌍 Russian Language Support</li>
                <li class="feature">👥 User Profiles</li>
            </ul>
            <h2>API Endpoints:</h2>
            <ul>
                <li>POST /api/register</li>
                <li>POST /api/send</li>
                <li>GET /api/messages?token=...</li>
                <li>POST /api/upload (multipart/form-data)</li>
                <li>GET /api/users/search?q=...&token=...</li>
                <li>GET /api/users/online?token=...</li>
                <li>POST /api/profile/update</li>
                <li>GET /api/stats</li>
            </ul>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    log(`Ryazhenka Chat PRO Server running on port ${PORT}`);
    log(`http://localhost:${PORT}`);
});
