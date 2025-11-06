# 💬 Ryazhenka Global Chat 🌍

**Глобальный чат для Nintendo Switch!**  
Общайся с игроками по всему миру прямо с консоли! 🎮

---

## ✨ ВОЗМОЖНОСТИ

- 🌍 **Глобальный чат** - общайся со всеми Switch игроками мира
- 🆔 **Уникальный ID** - каждой консоли присваивается уникальный ID
- 👤 **Регистрация** - введи имя и начинай общаться
- 📱 **Экранная клавиатура** - удобный ввод текста на Switch
- 📤 **Отправка сообщений** - пиши что хочешь!
- 🔄 **Обновление** - получай новые сообщения в реальном времени
- 💬 **История** - последние 100 сообщений

---

## 🎯 КАК РАБОТАЕТ

### 1. Уникальный ID:
```
Каждая консоль получает ID на основе серийного номера:
RYA-XAW10012345678-AB12CD34
```

### 2. Регистрация:
```
Первый запуск → введи имя → получи ID → готов!
```

### 3. Чат:
```
[A] Написать сообщение
[X] Обновить чат
[+] Выход
```

---

## 🛠️ УСТАНОВКА

### 1. Скомпилируй (DevkitPro):
```bash
cd switch/RyazhenkaChat
make
```

### 2. Скопируй на Switch:
```
RyazhenkaChat.nro → /switch/RyazhenkaChat/
```

### 3. Запусти через Homebrew Menu!

---

## 📡 СЕРВЕРНАЯ ЧАСТЬ

Для работы нужен сервер с API:

### API Endpoints:

#### POST /api/register
Регистрация пользователя
```json
{
  "userId": "RYA-XAW10012345678-AB12CD34",
  "username": "Dimasick",
  "console": "Switch"
}
```
**Response:**
```json
{
  "success": true,
  "token": "auth_token_here"
}
```

#### POST /api/send
Отправка сообщения
```json
{
  "userId": "RYA-XAW10012345678-AB12CD34",
  "username": "Dimasick",
  "text": "Привет всем!",
  "token": "auth_token_here"
}
```

#### GET /api/messages?token=...
Получение последних сообщений
```json
{
  "messages": [
    {
      "userId": "RYA-...",
      "username": "Player1",
      "text": "Привет!",
      "timestamp": "2024-11-06T20:00:00Z"
    }
  ]
}
```

---

## 🚀 РАЗВЕРТЫВАНИЕ СЕРВЕРА

### Node.js + Express (простой пример):

```javascript
const express = require('express');
const app = express();
app.use(express.json());

let users = new Map();
let messages = [];

// Регистрация
app.post('/api/register', (req, res) => {
  const { userId, username } = req.body;
  const token = generateToken();
  
  users.set(userId, { username, token });
  
  res.json({ success: true, token });
});

// Отправка
app.post('/api/send', (req, res) => {
  const { userId, username, text, token } = req.body;
  
  if(users.get(userId)?.token !== token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  messages.push({
    userId,
    username,
    text,
    timestamp: new Date().toISOString()
  });
  
  // Храним последние 1000
  if(messages.length > 1000) {
    messages.shift();
  }
  
  res.json({ success: true });
});

// Получение
app.get('/api/messages', (req, res) => {
  const token = req.query.token;
  
  // Проверка токена
  let authorized = false;
  for(let [id, user] of users) {
    if(user.token === token) {
      authorized = true;
      break;
    }
  }
  
  if(!authorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Последние 100
  const recent = messages.slice(-100);
  res.json({ messages: recent });
});

app.listen(3000, () => {
  console.log('Ryazhenka Chat Server running on port 3000');
});
```

### Deploy на Heroku:
```bash
heroku create ryazhenka-chat
git push heroku main
```

---

## ⚙️ КОНФИГУРАЦИЯ

Измени в `main.cpp`:

```cpp
#define API_URL "https://твой-сервер.com"
```

---

## 🔒 БЕЗОПАСНОСТЬ

### Что реализовано:
- ✅ Уникальный ID на основе серийника
- ✅ Token авторизация
- ✅ HTTPS

### Что нужно добавить:
- ⚠️ JSON парсер (сейчас упрощённо)
- ⚠️ Шифрование сообщений
- ⚠️ Модерация
- ⚠️ Бан система

---

## 📱 СКРИНШОТЫ UI

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              💬 RYAZHENKA GLOBAL CHAT 🌍                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

👤 Dimasick | ID: RYA-XAW10012345678-AB12CD34

═══════════════════════════════════════════════════════════

Player1: Привет всем!
Player2: Кто играет в Zelda?
Dimasick: Я! Давай в кооп!
Player3: Добавьте меня!

═══════════════════════════════════════════════════════════
[A] Написать  [X] Обновить  [+] Выход
```

---

## 🎮 ИСПОЛЬЗОВАНИЕ

### Первый запуск:
1. Открой RyazhenkaChat
2. Нажми [A] для входа
3. Введи имя (до 20 символов)
4. Готово! Ты в чате!

### Отправка сообщения:
1. Нажми [A]
2. Введи текст (до 256 символов)
3. Подтверди
4. Сообщение отправлено!

### Обновление чата:
1. Нажми [X]
2. Получишь новые сообщения
3. Автообновление каждые 10 сек (можно настроить)

---

## 🔧 ТРЕБОВАНИЯ

- **DevkitPro** - для компиляции
- **libnx** - Switch библиотека
- **curl** - HTTP запросы
- **mbedtls** - HTTPS
- **Интернет** - на Switch

---

## 📊 ТЕХНИЧЕСКИЕ ДЕТАЛИ

### Архитектура:
```
Switch (Client) ←→ HTTPS ←→ Server (Node.js/Express) ←→ Database
```

### Формат ID:
```
RYA-[СЕРИЙНИК]-[TIMESTAMP]
Пример: RYA-XAW10012345678-AB12CD34
```

### Ограничения:
- **Имя пользователя:** 20 символов
- **Сообщение:** 256 символов
- **История:** 100 сообщений (локально)
- **Сервер:** 1000 сообщений (можно больше)

---

## 🐛 ИЗВЕСТНЫЕ ПРОБЛЕМЫ

1. **JSON парсинг упрощённый** - нужен полноценный парсер
2. **Нет автообновления** - нужно нажимать [X]
3. **Нет уведомлений** - когда приходят сообщения
4. **Нет эмодзи** - только текст

### TODO:
- [ ] Добавить JSON парсер (nlohmann/json)
- [ ] Авто-обновление каждые 5 сек
- [ ] Звук при новом сообщении
- [ ] Поддержка эмодзи
- [ ] Приватные чаты
- [ ] Список онлайн пользователей

---

## 📞 ПОДДЕРЖКА

- **Telegram:** t.me/Ryazhenkabestcfw
- **GitHub:** github.com/Dimasick-git

---

## 📜 ЛИЦЕНЗИЯ

MIT License - используй как хочешь!

---

**Created by Dimasick-git | 2024**  
**Первый глобальный чат для Nintendo Switch!** 🎮💬🌍
