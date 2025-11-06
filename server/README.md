# 🌐 Ryazhenka Chat Server

Серверная часть для **Ryazhenka Global Chat** - глобального чата Nintendo Switch!

---

## 🚀 БЫСТРЫЙ СТАРТ

### 1. Установка зависимостей:
```bash
npm install
```

### 2. Запуск:
```bash
npm start
```

### 3. Сервер запущен!
```
http://localhost:3000
```

---

## 📡 API ENDPOINTS

### POST /api/register
**Регистрация пользователя**

Request:
```json
{
  "userId": "RYA-XAW10012345678-AB12CD34",
  "username": "Dimasick",
  "console": "Switch"
}
```

Response:
```json
{
  "success": true,
  "token": "RYA_TOKEN_abc123...",
  "message": "Registration successful!"
}
```

---

### POST /api/send
**Отправка сообщения**

Request:
```json
{
  "userId": "RYA-...",
  "username": "Dimasick",
  "text": "Привет всем!",
  "token": "RYA_TOKEN_..."
}
```

Response:
```json
{
  "success": true,
  "message": "Message sent!"
}
```

---

### GET /api/messages?token=...&limit=100
**Получение сообщений**

Response:
```json
{
  "success": true,
  "messages": [
    {
      "userId": "RYA-...",
      "username": "Player1",
      "text": "Привет!",
      "timestamp": "2024-11-06T20:00:00.000Z",
      "isSystem": false
    }
  ],
  "onlineCount": 5,
  "totalUsers": 42
}
```

---

### GET /api/online?token=...
**Список онлайн пользователей**

Response:
```json
{
  "success": true,
  "online": [
    {
      "userId": "RYA-...",
      "username": "Player1"
    }
  ],
  "count": 5
}
```

---

### GET /api/stats
**Статистика сервера**

Response:
```json
{
  "totalUsers": 42,
  "onlineUsers": 5,
  "totalMessages": 1234,
  "serverUptime": 86400
}
```

---

## 🔒 БЕЗОПАСНОСТЬ

### Реализовано:
- ✅ Token авторизация
- ✅ Анти-спам (10 сообщений/минуту)
- ✅ Проверка длины сообщений (max 256)
- ✅ CORS для защиты
- ✅ Валидация данных

### Нужно добавить (для продакшена):
- ⚠️ Rate limiting (глобальный)
- ⚠️ База данных (MongoDB/PostgreSQL)
- ⚠️ Логирование (Winston/Morgan)
- ⚠️ HTTPS/SSL сертификаты
- ⚠️ Шифрование сообщений
- ⚠️ Модерация контента
- ⚠️ Бан система
- ⚠️ Капча при регистрации

---

## 📊 РАЗВЕРТЫВАНИЕ

### Heroku:
```bash
heroku create ryazhenka-chat
heroku config:set NODE_ENV=production
git push heroku main
heroku open
```

### Railway:
```bash
railway init
railway up
```

### DigitalOcean:
```bash
# Создай Droplet
# Установи Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Клонируй и запусти
git clone ...
cd server
npm install
npm start
```

### Docker:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🛡️ PRODUCTION READY

### Добавь .env файл:
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=mongodb://...
SECRET_KEY=your-secret-key
```

### Используй PM2:
```bash
npm install -g pm2
pm2 start server.js --name "ryazhenka-chat"
pm2 save
pm2 startup
```

### Настрой Nginx (reverse proxy):
```nginx
server {
    listen 80;
    server_name chat.ryazhenka.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📈 МОНИТОРИНГ

### Логи:
```bash
# Консоль
npm start

# Файл
npm start > logs.txt 2>&1

# PM2
pm2 logs ryazhenka-chat
```

### Статистика:
Открой в браузере:
```
http://your-server.com/api/stats
```

---

## 🧪 ТЕСТИРОВАНИЕ

### Тест регистрации:
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"TEST-123","username":"TestUser","console":"Switch"}'
```

### Тест отправки:
```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"userId":"TEST-123","username":"TestUser","text":"Hello!","token":"..."}'
```

### Тест получения:
```bash
curl "http://localhost:3000/api/messages?token=..."
```

---

## 💾 БАЗА ДАННЫХ (опционально)

### MongoDB:
```javascript
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userId: String,
  username: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// Сохранение
await Message.create({ userId, username, text });

// Получение
const messages = await Message.find().sort('-timestamp').limit(100);
```

### PostgreSQL:
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  username VARCHAR(50),
  text VARCHAR(256),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timestamp ON messages(timestamp);
```

---

## 🔥 РАСШИРЕНИЯ

### WebSocket (real-time):
```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('message', (msg) => {
    io.emit('message', msg); // Broadcast всем
  });
});
```

### Redis (кэш):
```javascript
const redis = require('redis');
const client = redis.createClient();

// Кэш сообщений
await client.setex('messages:latest', 60, JSON.stringify(messages));
```

---

## 📞 ПОДДЕРЖКА

- Telegram: t.me/Ryazhenkabestcfw
- GitHub: github.com/Dimasick-git

---

**Created by Dimasick-git | 2024**
