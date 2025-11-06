# 💬 Ryazhenka Chat PRO - Telegram for Switch! 🎮

**Full-featured messenger like Telegram for Nintendo Switch!**

---

## 🔥 FEATURES

### 💬 Messaging:
- ✅ **Real-time chat** - instant messaging
- ✅ **Beautiful UI** - like Telegram mobile
- ✅ **Message history** - scroll through conversations
- ✅ **Typing indicators** - see when others type
- ✅ **Read receipts** - double checkmarks
- ✅ **Time stamps** - for each message

### 🖼️ Media:
- ✅ **Send images** - screenshots from Switch
- ✅ **View images** - in-chat preview
- ✅ **Stickers** - custom Switch stickers
- ✅ **Emojis** - full emoji support
- ✅ **File sharing** - send save files, mods

### 👥 Users:
- ✅ **User profiles** - avatar, bio, status
- ✅ **Online status** - green dot when online
- ✅ **User list** - see all online users
- ✅ **Private messages** - 1-on-1 chat
- ✅ **Group chats** - multiple users

### ⚡ Advanced:
- ✅ **Search** - find messages and users
- ✅ **Notifications** - rumble on new message
- ✅ **Themes** - dark/light mode
- ✅ **Settings** - customize everything
- ✅ **Cloud sync** - messages saved on server

---

## 📱 UI DESIGN

```
┌──────────────────────────────────────────────────────────┐
│  💬 Ryazhenka Chat                          [👤] [⚙️]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🟢 Player1                              12:30 PM  │ │
│  │    Hey! Anyone online?                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🟢 Player2                              12:31 PM  │ │
│  │    Yeah! Playing Zelda                            │ │
│  │    [🖼️ Screenshot.jpg]                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🟢 You                                  12:32 PM  │ │
│  │    Nice! Want to co-op?                   ✓✓     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [📷] [😊] │ Type a message...              │ [➤]     │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 NEW ARCHITECTURE

### Technology Stack:
- **UI Framework**: Borealis (Modern Switch UI)
- **Graphics**: deko3d / SDL2
- **Networking**: WebSocket (real-time)
- **Image**: libjpeg-turbo, libpng
- **Storage**: SQLite (local cache)

### Components:
```
RyazhenkaChatPro/
├── source/
│   ├── main.cpp              - Entry point
│   ├── ui/
│   │   ├── ChatView.cpp      - Main chat screen
│   │   ├── UserList.cpp      - User list
│   │   ├── Profile.cpp       - User profile
│   │   ├── Settings.cpp      - Settings screen
│   │   └── ImageViewer.cpp   - Image viewer
│   ├── network/
│   │   ├── WebSocket.cpp     - WebSocket client
│   │   ├── FileUpload.cpp    - Upload images
│   │   └── API.cpp           - REST API
│   ├── database/
│   │   └── MessageDB.cpp     - SQLite storage
│   └── utils/
│       ├── ImageLoader.cpp   - Load/decode images
│       └── Screenshot.cpp    - Capture screenshots
├── server/
│   ├── server.js             - Main server
│   ├── websocket.js          - WebSocket handler
│   └── storage.js            - File storage
└── assets/
    ├── icons/                - UI icons
    ├── stickers/             - Sticker packs
    └── themes/               - UI themes
```

---

## 🎨 FEATURES DETAILS

### 1. Beautiful Chat UI
- Modern Telegram-like interface
- Smooth scrolling with touch support
- Message bubbles (yours = blue, others = gray)
- Avatar circles for each user
- Timestamp on every message
- Double checkmark for read messages

### 2. Image Support
- Take screenshots (Capture button)
- Send screenshots to chat
- View images full-screen
- Zoom and pan images
- Download images from chat
- Image compression for upload

### 3. User Profiles
- Set your avatar (from screenshots)
- Write bio/status
- View other users' profiles
- See mutual games
- Add to favorites

### 4. Real-time Updates
- WebSocket for instant messages
- No need to refresh
- Typing indicators
- Online/offline status
- New message notifications

### 5. Search & Filter
- Search messages by text
- Filter by user
- Search users
- Jump to message

### 6. Themes
- Dark mode (default)
- Light mode
- Switch theme
- Custom colors

---

## 🛠️ INSTALLATION

### Requirements:
- Nintendo Switch with CFW
- DevkitPro with libnx
- Borealis library
- SDL2, libjpeg, libpng
- Internet connection

### Build:
```bash
cd RyazhenkaChatPro
make
```

### Install:
```
RyazhenkaChatPro.nro → /switch/RyazhenkaChatPro/
```

---

## 🌐 SERVER SETUP

### New Features:
- WebSocket server (Socket.io)
- File upload/download
- Image storage
- Message persistence (MongoDB)
- User profiles storage

### Deploy:
```bash
cd server
npm install
npm start
```

---

## 🎮 CONTROLS

### Chat Screen:
- **A** - Send message / Select
- **B** - Back / Cancel
- **X** - Attach image
- **Y** - User profile
- **L/R** - Switch chat/users
- **ZL** - Take screenshot
- **ZR** - Send screenshot
- **Left Stick** - Scroll messages
- **Right Stick** - Navigate UI
- **+** - Settings
- **-** - Search

### Image Viewer:
- **Left Stick** - Pan image
- **Right Stick** - Zoom
- **A** - Download
- **B** - Close
- **X** - Share
- **Y** - Info

---

## 📸 SCREENSHOT SHARING

1. Press **Capture** button on Switch
2. Open RyazhenkaChat Pro
3. Press **ZR** to send last screenshot
4. Or press **X** → Select from gallery
5. Add caption (optional)
6. Send!

---

## 💡 ADVANCED FEATURES

### Message Types:
- Text messages
- Images (JPG, PNG)
- Stickers
- Location (game + location)
- Game invites
- Save file sharing

### Notifications:
- Rumble on new message
- On-screen notification
- Sound (optional)
- LED (if supported)

### Cloud Features:
- Messages synced across devices
- Image backup
- Profile cloud save
- Settings sync

---

## 🔒 PRIVACY & SECURITY

- End-to-end encryption (planned)
- Block users
- Report spam
- Delete messages
- Clear history
- Anonymous mode

---

## 🎨 CUSTOMIZATION

### Themes:
- Dark (default)
- Light
- OLED Black
- Switch Red
- Zelda Green
- Pokemon Yellow
- Custom colors

### Message Bubbles:
- Rounded
- Square
- iOS style
- Material Design
- Telegram style

### Fonts:
- System default
- Roboto
- San Francisco
- Custom fonts

---

## 📊 PLANNED FEATURES

- [ ] Voice messages (audio recording)
- [ ] Video sharing
- [ ] Animated stickers/GIFs
- [ ] Reactions to messages
- [ ] Message forwarding
- [ ] Channels (broadcast)
- [ ] Bots integration
- [ ] Game sessions (join friends)
- [ ] Save file exchange
- [ ] Mod sharing

---

## 🚀 ROADMAP

### Version 1.0 (Current):
- Basic chat
- Text messages
- User list
- Simple UI

### Version 2.0:
- **Telegram-like UI** ← WE ARE HERE!
- Image support
- Better performance
- WebSocket

### Version 3.0:
- Voice messages
- Video support
- Advanced search
- Encryption

---

Created by Dimasick-git | 2025
The First Full-Featured Messenger for Nintendo Switch! 🎮💬
