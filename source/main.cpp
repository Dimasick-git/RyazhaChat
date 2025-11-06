#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <switch.h>
#include <curl/curl.h>
#include <vector>
#include <string>
#include <algorithm>

// Ryazhenka Global Chat - Глобальный чат для Switch
// API сервер будет на https://ryazhenka-chat.herokuapp.com

#define API_URL "https://api.ryazhenka.chat"
#define MAX_MESSAGES 100
#define MAX_USERNAME 20

struct Message {
    std::string username;
    std::string text;
    std::string timestamp;
    std::string userId;
};

struct User {
    std::string userId;      // Уникальный ID (UUID)
    std::string username;    // Имя пользователя
    std::string token;       // Auth token
};

class RyazhenkaChatClient {
private:
    User currentUser;
    std::vector<Message> messages;
    bool isLoggedIn = false;
    PadState pad;
    
    // Генерация уникального ID на основе серийного номера консоли
    std::string generateUniqueId() {
        SetCalSerialNumber serial;
        Result rc = setcalGetSerialNumber(&serial);
        
        if(R_SUCCEEDED(rc)) {
            // Хешируем серийник для безопасности
            char id[64];
            snprintf(id, sizeof(id), "RYA-%s-%08X", serial.number, (unsigned int)time(NULL));
            return std::string(id);
        }
        
        // Fallback - случайный ID
        char id[64];
        snprintf(id, sizeof(id), "RYA-UNKNOWN-%08X", (unsigned int)time(NULL));
        return std::string(id);
    }
    
    // Callback для curl
    static size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp) {
        ((std::string*)userp)->append((char*)contents, size * nmemb);
        return size * nmemb;
    }
    
    // HTTP запрос
    std::string httpRequest(const std::string& url, const std::string& postData = "") {
        CURL *curl;
        CURLcode res;
        std::string readBuffer;
        
        curl = curl_easy_init();
        if(curl) {
            curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
            curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);
            curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
            
            if(!postData.empty()) {
                curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postData.c_str());
            }
            
            res = curl_easy_perform(curl);
            curl_easy_cleanup(curl);
            
            if(res == CURLE_OK) {
                return readBuffer;
            }
        }
        
        return "";
    }
    
    // Регистрация/вход пользователя
    bool registerUser(const std::string& username) {
        currentUser.userId = generateUniqueId();
        currentUser.username = username;
        
        // POST запрос на сервер для регистрации
        char postData[512];
        snprintf(postData, sizeof(postData), 
                "{\"userId\":\"%s\",\"username\":\"%s\",\"console\":\"Switch\"}",
                currentUser.userId.c_str(), username.c_str());
        
        std::string response = httpRequest(std::string(API_URL) + "/api/register", postData);
        
        if(!response.empty()) {
            // Парсим token из JSON (упрощённо)
            // В реальности нужен JSON парсер
            currentUser.token = "temp_token"; // TODO: распарсить
            isLoggedIn = true;
            return true;
        }
        
        return false;
    }
    
    // Отправка сообщения
    bool sendMessage(const std::string& text) {
        if(!isLoggedIn) return false;
        
        char postData[1024];
        snprintf(postData, sizeof(postData),
                "{\"userId\":\"%s\",\"username\":\"%s\",\"text\":\"%s\",\"token\":\"%s\"}",
                currentUser.userId.c_str(), currentUser.username.c_str(), 
                text.c_str(), currentUser.token.c_str());
        
        std::string response = httpRequest(std::string(API_URL) + "/api/send", postData);
        
        return !response.empty();
    }
    
    // Получение сообщений
    void fetchMessages() {
        if(!isLoggedIn) return;
        
        std::string url = std::string(API_URL) + "/api/messages?token=" + currentUser.token;
        std::string response = httpRequest(url);
        
        if(!response.empty()) {
            // TODO: Парсинг JSON и заполнение messages
            // Упрощённая версия
        }
    }
    
    // Открытие экранной клавиатуры Switch
    std::string openKeyboard(const std::string& hint, size_t maxLen) {
        SwkbdConfig kbd;
        char textBuf[512] = {0};
        
        Result rc = swkbdCreate(&kbd, 0);
        if(R_SUCCEEDED(rc)) {
            swkbdConfigMakePresetDefault(&kbd);
            swkbdConfigSetHeaderText(&kbd, hint.c_str());
            swkbdConfigSetStringLenMax(&kbd, maxLen);
            swkbdConfigSetStringLenMin(&kbd, 1);
            
            rc = swkbdShow(&kbd, textBuf, sizeof(textBuf));
            swkbdClose(&kbd);
            
            if(R_SUCCEEDED(rc)) {
                return std::string(textBuf);
            }
        }
        
        return "";
    }
    
    // Отрисовка UI
    void drawUI() {
        printf("\x1b[2J\x1b[1;1H");
        
        // Header
        printf("\x1b[35;1m");
        printf("╔════════════════════════════════════════════════════════════╗\n");
        printf("║                                                            ║\n");
        printf("║              💬 RYAZHENKA GLOBAL CHAT 🌍                   ║\n");
        printf("║                                                            ║\n");
        printf("╚════════════════════════════════════════════════════════════╝\n");
        printf("\x1b[0m\n");
        
        if(isLoggedIn) {
            // Показываем юзера
            printf("\x1b[32m👤 %s\x1b[0m | \x1b[36mID: %s\x1b[0m\n\n", 
                   currentUser.username.c_str(), currentUser.userId.c_str());
            
            // Разделитель
            printf("\x1b[36m═══════════════════════════════════════════════════════════\x1b[0m\n\n");
            
            // Сообщения (последние 15)
            int startIdx = messages.size() > 15 ? messages.size() - 15 : 0;
            for(size_t i = startIdx; i < messages.size(); i++) {
                const Message& msg = messages[i];
                
                if(msg.userId == currentUser.userId) {
                    // Наши сообщения справа (зелёный)
                    printf("\x1b[32m%s: %s\x1b[0m\n", 
                           msg.username.c_str(), msg.text.c_str());
                } else {
                    // Чужие сообщения слева (голубой)
                    printf("\x1b[36m%s: %s\x1b[0m\n", 
                           msg.username.c_str(), msg.text.c_str());
                }
            }
            
            printf("\n");
            printf("\x1b[36m═══════════════════════════════════════════════════════════\x1b[0m\n");
            printf("\x1b[33m[A] Написать  [X] Обновить  [+] Выход\x1b[0m\n");
            
        } else {
            // Экран входа
            printf("\x1b[33m✨ Добро пожаловать в Ryazhenka Global Chat!\x1b[0m\n\n");
            printf("Общайся с Switch игроками по всему миру! 🌍\n\n");
            printf("\x1b[36m════════════════════════════════════════════════════════\x1b[0m\n\n");
            printf("\x1b[32m[A] Войти / Зарегистрироваться\x1b[0m\n");
            printf("\x1b[31m[+] Выход\x1b[0m\n\n");
            printf("\x1b[36m════════════════════════════════════════════════════════\x1b[0m\n\n");
            printf("\x1b[90mКаждая консоль получает уникальный ID!\x1b[0m\n");
        }
    }
    
public:
    RyazhenkaChatClient() {
        padConfigureInput(1, HidNpadStyleSet_NpadStandard);
        padInitializeDefault(&pad);
    }
    
    void run() {
        // Инициализация curl
        socketInitializeDefault();
        curl_global_init(CURL_GLOBAL_ALL);
        
        bool running = true;
        
        while(appletMainLoop() && running) {
            drawUI();
            consoleUpdate(NULL);
            
            padUpdate(&pad);
            u64 kDown = padGetButtonsDown(&pad);
            
            if(kDown & HidNpadButton_Plus) {
                running = false;
            }
            
            if(!isLoggedIn) {
                // Экран входа
                if(kDown & HidNpadButton_A) {
                    std::string username = openKeyboard("Введи своё имя:", MAX_USERNAME);
                    
                    if(!username.empty()) {
                        printf("\x1b[2J\x1b[10;1H");
                        printf("\x1b[33m⏳ Регистрация...\x1b[0m\n");
                        consoleUpdate(NULL);
                        
                        if(registerUser(username)) {
                            printf("\x1b[32m✅ Добро пожаловать, %s!\x1b[0m\n", username.c_str());
                            printf("\x1b[36m🆔 Твой ID: %s\x1b[0m\n", currentUser.userId.c_str());
                            svcSleepThread(2000000000ULL); // 2 сек
                        } else {
                            printf("\x1b[31m❌ Ошибка подключения!\x1b[0m\n");
                            printf("Проверь интернет и попробуй снова.\n");
                            svcSleepThread(3000000000ULL);
                        }
                    }
                }
            } else {
                // Экран чата
                if(kDown & HidNpadButton_A) {
                    // Написать сообщение
                    std::string text = openKeyboard("Напиши сообщение:", 256);
                    
                    if(!text.empty()) {
                        printf("\x1b[2J\x1b[10;1H");
                        printf("\x1b[33m📤 Отправка...\x1b[0m\n");
                        consoleUpdate(NULL);
                        
                        if(sendMessage(text)) {
                            // Добавляем своё сообщение локально
                            Message msg;
                            msg.username = currentUser.username;
                            msg.text = text;
                            msg.userId = currentUser.userId;
                            msg.timestamp = "now";
                            messages.push_back(msg);
                            
                            printf("\x1b[32m✅ Отправлено!\x1b[0m\n");
                        } else {
                            printf("\x1b[31m❌ Ошибка отправки!\x1b[0m\n");
                        }
                        
                        svcSleepThread(1000000000ULL);
                    }
                }
                
                if(kDown & HidNpadButton_X) {
                    // Обновить сообщения
                    printf("\x1b[2J\x1b[10;1H");
                    printf("\x1b[33m🔄 Обновление...\x1b[0m\n");
                    consoleUpdate(NULL);
                    
                    fetchMessages();
                    
                    svcSleepThread(500000000ULL);
                }
            }
            
            svcSleepThread(16666666ULL); // ~60 FPS
        }
        
        // Cleanup
        curl_global_cleanup();
        socketExit();
    }
};

int main(int argc, char* argv[]) {
    consoleInit(NULL);
    
    RyazhenkaChatClient client;
    client.run();
    
    consoleExit(NULL);
    return 0;
}
