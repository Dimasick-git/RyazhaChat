// Ryazhenka Chat Server
// Простой сервер для глобального чата Switch

const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Хранилище (в продакшене используй MongoDB/PostgreSQL)
const users = new Map();
const messages = [];
const onlineUsers = new Set();

// Генерация токена
function generateToken() {
    return 'RYA_TOKEN_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Логирование
function log(msg) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

// 1. Регистрация/Вход
app.post('/api/register', (req, res) => {
    const { userId, username, console: consoleType } = req.body;
    
    if(!userId || !username) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing userId or username' 
        });
    }
    
    // Проверяем существование
    if(users.has(userId)) {
        const user = users.get(userId);
        log(`User login: ${username} (${userId})`);
        return res.json({ 
            success: true, 
            token: user.token,
            message: 'Welcome back!'
        });
    }
    
    // Регистрация нового
    const token = generateToken();
    users.set(userId, {
        userId,
        username,
        token,
        console: consoleType || 'Switch',
        registeredAt: new Date().toISOString()
    });
    
    // Системное сообщение
    messages.push({
        userId: 'SYSTEM',
        username: 'System',
        text: `${username} присоединился к чату! 👋`,
        timestamp: new Date().toISOString(),
        isSystem: true
    });
    
    log(`New user registered: ${username} (${userId})`);
    
    res.json({ 
        success: true, 
        token,
        message: 'Registration successful!'
    });
});

// 2. Отправка сообщения
app.post('/api/send', (req, res) => {
    const { userId, username, text, token } = req.body;
    
    if(!userId || !text || !token) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields' 
        });
    }
    
    // Проверка токена
    const user = users.get(userId);
    if(!user || user.token !== token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized' 
        });
    }
    
    // Анти-спам: не более 10 сообщений в минуту
    const recentMessages = messages.filter(m => 
        m.userId === userId && 
        Date.now() - new Date(m.timestamp).getTime() < 60000
    );
    
    if(recentMessages.length >= 10) {
        return res.status(429).json({ 
            success: false, 
            error: 'Too many messages, slow down!' 
        });
    }
    
    // Фильтр длины
    if(text.length > 256) {
        return res.status(400).json({ 
            success: false, 
            error: 'Message too long (max 256 chars)' 
        });
    }
    
    // Сохраняем
    const message = {
        userId,
        username: user.username, // Используем имя из базы (защита от подделки)
        text,
        timestamp: new Date().toISOString(),
        isSystem: false
    };
    
    messages.push(message);
    
    // Ограничение истории
    if(messages.length > 1000) {
        messages.shift();
    }
    
    onlineUsers.add(userId);
    
    log(`Message from ${username}: ${text}`);
    
    res.json({ 
        success: true,
        message: 'Message sent!'
    });
});

// 3. Получение сообщений
app.get('/api/messages', (req, res) => {
    const token = req.query.token;
    const since = req.query.since; // timestamp для обновлений
    const limit = parseInt(req.query.limit) || 100;
    
    if(!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Token required' 
        });
    }
    
    // Проверка токена
    let authorized = false;
    let currentUserId = null;
    for(let [userId, user] of users) {
        if(user.token === token) {
            authorized = true;
            currentUserId = userId;
            onlineUsers.add(userId);
            break;
        }
    }
    
    if(!authorized) {
        return res.status(401).json({ 
            success: false, 
            error: 'Invalid token' 
        });
    }
    
    // Фильтруем сообщения
    let filteredMessages = messages;
    
    if(since) {
        filteredMessages = messages.filter(m => 
            new Date(m.timestamp) > new Date(since)
        );
    }
    
    // Последние N
    const recentMessages = filteredMessages.slice(-limit);
    
    res.json({ 
        success: true,
        messages: recentMessages,
        onlineCount: onlineUsers.size,
        totalUsers: users.size
    });
});

// 4. Список онлайн пользователей
app.get('/api/online', (req, res) => {
    const token = req.query.token;
    
    if(!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    // Проверка токена
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
    
    const onlineList = [];
    for(let userId of onlineUsers) {
        const user = users.get(userId);
        if(user) {
            onlineList.push({
                userId: user.userId,
                username: user.username
            });
        }
    }
    
    res.json({ 
        success: true,
        online: onlineList,
        count: onlineList.length
    });
});

// 5. Статистика
app.get('/api/stats', (req, res) => {
    res.json({
        totalUsers: users.size,
        onlineUsers: onlineUsers.size,
        totalMessages: messages.length,
        serverUptime: process.uptime()
    });
});

// Очистка неактивных пользователей (каждые 5 минут)
setInterval(() => {
    onlineUsers.clear();
    log('Cleared online users list');
}, 5 * 60 * 1000);

// Главная страница
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Ryazhenka Chat Server</title>
            <style>
                body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
                h1 { color: #8a2be2; }
                .stat { background: #f0f0f0; padding: 15px; margin: 10px 0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>💬 Ryazhenka Global Chat Server 🌍</h1>
            <div class="stat">
                <strong>Status:</strong> ✅ Running<br>
                <strong>Total Users:</strong> ${users.size}<br>
                <strong>Online Users:</strong> ${onlineUsers.size}<br>
                <strong>Total Messages:</strong> ${messages.length}<br>
                <strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds
            </div>
            <h2>API Endpoints:</h2>
            <ul>
                <li>POST /api/register - Register user</li>
                <li>POST /api/send - Send message</li>
                <li>GET /api/messages?token=... - Get messages</li>
                <li>GET /api/online?token=... - Get online users</li>
                <li>GET /api/stats - Server statistics</li>
            </ul>
            <p><a href="https://github.com/Dimasick-git/Ryazhenka">GitHub</a></p>
        </body>
        </html>
    `);
});

// Запуск
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    log(`Ryazhenka Chat Server running on port ${PORT}`);
    log(`http://localhost:${PORT}`);
});
