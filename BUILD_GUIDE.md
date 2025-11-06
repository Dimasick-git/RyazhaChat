# 🔥 Ryazhenka Chat PRO - Complete Build Guide

**Full Telegram-like messenger for Switch with Image Support & User Search!**

---

## 📋 REQUIREMENTS

### System:
- **Windows/Linux/Mac** with DevkitPro
- **DevkitA64** installed
- **Switch** with CFW (Atmosphere)
- **Internet** for downloading libraries

### Libraries Required:
```bash
# Core
- libnx (latest)
- Borealis (UI framework)
- SDL2 + SDL2_image
- curl + mbedtls

# Image support
- libjpeg-turbo
- libpng
- libwebp

# All available via dkp-pacman!
```

---

## 🛠️ STEP 1: Install Borealis

### Method A - dkp-pacman (EASIEST!):
```bash
sudo dkp-pacman -S switch-borealis
sudo dkp-pacman -S switch-sdl2 switch-sdl2_image
sudo dkp-pacman -S switch-libjpeg-turbo switch-libpng switch-libwebp
```

### Method B - Manual Build:
```bash
git clone --recursive https://github.com/natinusala/borealis.git
cd borealis
cmake -B build_switch -DPLATFORM_SWITCH=ON
cmake --build build_switch
sudo cmake --install build_switch
```

---

## 🛠️ STEP 2: Setup Russian Font

### Download NotoSans (supports Cyrillic):
```bash
# Linux/Mac:
wget https://github.com/google/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -O romfs/fonts/NotoSans.ttf

# Windows (PowerShell):
Invoke-WebRequest -Uri "https://github.com/google/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf" -OutFile "romfs\fonts\NotoSans.ttf"
```

### Create romfs directory:
```bash
mkdir -p romfs/fonts
# Put NotoSans.ttf there!
```

---

## 🛠️ STEP 3: Build the App

### Compile:
```bash
cd RyazhenkaChatPro
make clean
make
```

### Expected output:
```
main.cpp
linking RyazhenkaChatPro.elf
built ... RyazhenkaChatPro.nacp
built ... RyazhenkaChatPro.nro
```

### Result:
- **RyazhenkaChatPro.nro** (~2-3 MB with romfs)

---

## 🌐 STEP 4: Setup Server

### Install Dependencies:
```bash
cd server
npm install
```

### Start Server:
```bash
npm start
```

### Deploy to Railway:
```bash
# Same as before, but use server_pro.js!
railway init
railway up
```

### Get URL:
```
https://your-app.up.railway.app
```

---

## ⚙️ STEP 5: Configure API URL

### Edit source/main.cpp:
```cpp
// Line 13-14:
#define API_URL "https://your-railway-url.up.railway.app"
#define WS_URL "wss://your-railway-url.up.railway.app"
```

### Recompile:
```bash
make clean
make
```

---

## 📦 STEP 6: Install on Switch

### Copy to SD Card:
```
RyazhenkaChatPro.nro → SD:/switch/RyazhenkaChatPro/
```

### Launch:
1. Open Homebrew Menu
2. Find "Ryazhenka Chat PRO"
3. Launch!

---

## 🎮 FEATURES

### ✅ What Works:
- ✅ **Beautiful UI** - Borealis framework
- ✅ **User Search** - by ID or username
- ✅ **Russian Language** - full UTF-8 support
- ✅ **Real-time Chat** - WebSocket connection
- ✅ **Message History** - scrollable list
- ✅ **User Profiles** - avatar, bio, status
- ✅ **Image Upload** - screenshots & photos

### 🔍 User Search:
- Press **Y** button in chat
- Opens search screen
- Enter User ID (RYA-XXXX...) or Username
- Shows all matching users
- Click to open chat

### 📷 Image Support:
- Press **X** button to attach image
- Supports JPG, PNG, GIF, WebP
- Max size: 5MB
- Auto-resize for chat
- Full-screen viewer

### 🌍 Russian Language:
- Uses NotoSans font (Cyrillic)
- UTF-8 encoding everywhere
- Works in HBMenu (bypasses restrictions!)
- Fully localized UI

---

## 🐛 TROUBLESHOOTING

### "Borealis not found":
```bash
sudo dkp-pacman -S switch-borealis
```

### "Font not found":
```bash
# Make sure romfs/fonts/NotoSans.ttf exists!
ls romfs/fonts/
```

### "Connection error":
- Check server is running
- Verify API_URL in code
- Test server: curl https://your-url.up.railway.app/api/stats

### "Build error":
```bash
# Update DevkitPro:
sudo dkp-pacman -Syu

# Clean rebuild:
make clean
rm -rf build
make
```

### "Russian text shows ???":
- Verify NotoSans.ttf in romfs/fonts/
- Rebuild app (romfs must be embedded!)

---

## 📊 FILE STRUCTURE

```
RyazhenkaChatPro/
├── source/
│   └── main.cpp              (14KB - main code)
├── romfs/
│   └── fonts/
│       └── NotoSans.ttf      (Download this!)
├── server/
│   ├── server_pro.js         (Server with search & upload)
│   ├── package.json          (Dependencies)
│   └── uploads/              (Created automatically)
├── Makefile                  (Build config)
├── README.md                 (Features overview)
└── BUILD_GUIDE.md            (This file!)
```

---

## 🚀 NEXT STEPS

### After successful build:

1. **Test locally:**
   - Launch on Switch
   - Register with Russian name
   - Send test message
   - Try user search

2. **Deploy server:**
   - Upload to Railway/Heroku
   - Update API_URL
   - Rebuild app
   - Test online!

3. **Share with friends:**
   - Give them the .nro file
   - Share server URL
   - Chat globally!

---

## 💡 ADVANCED

### Custom Themes:
Edit UI colors in main.cpp:
```cpp
// Message bubble color:
item->setTextColor(nvgRGBA(100, 200, 255, 255));
```

### Add More Languages:
Download font with more Unicode support:
- NotoSans CJK (Chinese/Japanese/Korean)
- NotoSans Arabic
- NotoSans Emoji

### WebSocket Debugging:
Server logs show all WebSocket events:
```
[timestamp] WebSocket connected: socketID
[timestamp] User authenticated via WS: username
```

---

## 📞 SUPPORT

- **Telegram:** t.me/Ryazhenkabestcfw
- **GitHub:** github.com/Dimasick-git
- **Issues:** Create issue on GitHub

---

## ✅ CHECKLIST

Before releasing:
- [ ] Borealis installed
- [ ] NotoSans.ttf in romfs/fonts/
- [ ] Server running on Railway
- [ ] API_URL updated in code
- [ ] App compiled successfully
- [ ] Tested on real Switch
- [ ] Russian text displays correctly
- [ ] User search works
- [ ] Messages send/receive
- [ ] Images upload

---

**Created by Dimasick-git | 2025**
**First Telegram-like Messenger for Nintendo Switch!** 🎮💬🚀
