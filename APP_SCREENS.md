# Krishi-Rakshak App Screens

## 📱 App Flow

### Screen 1: Splash Screen
**Duration:** 2 seconds  
**Background:** Green (#2D8B4F)

```
┌─────────────────────────┐
│                         │
│                         │
│                         │
│      Krishi-Rakshak®    │
│   Seeds to Market       │
│                         │
│           ⟳             │
│                         │
│                         │
│                         │
└─────────────────────────┘
```

**Features:**
- Full-screen green background matching DeHaat branding
- Large "Krishi-Rakshak" text with registered trademark symbol
- "Seeds to Market" tagline
- Loading spinner animation
- Auto-navigates to language selection (first time) or home screen

---

### Screen 2: Language Selection (First Time Only)
**Background:** White

```
┌─────────────────────────────────┐
│  Select your language           │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │  हिंदी   │  │ English │      │
│  │  Hindi  │  │ अंग्रेज़ी│      │
│  └─────────┘  └─────────┘      │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │  বাংলা   │  │ मराठी    │      │
│  │ Bangla  │  │ Marathi │      │
│  └─────────┘  └─────────┘      │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │  ଓଡିଆ    │  │ ગુજરાતી  │      │
│  │  Odia   │  │Gujarati │      │
│  └─────────┘  └─────────┘      │
│                                 │
└─────────────────────────────────┘
```

**Features:**
- 6 language options in a 2-column grid
- Each card shows:
  - Native script (larger)
  - English name (smaller)
- Color-coded cards:
  - Hindi: Light green (#D4E7C5)
  - English: Light gray (#E8E8E8)
  - Bangla: Light yellow (#FFF4C2)
  - Marathi: Peach (#FFE4C4)
  - Odia: Light pink (#FFD4D4)
  - Gujarati: Light blue (#CCE7FF)
- Selected card gets green border (#2D8B4F)
- Selection saved to device storage
- Only shown once (first time app opens)

---

### Screen 3: Home Screen
**Status:** Ready for feature implementation

```
┌─────────────────────────────────┐
│     Krishi-Rakshak               │
│     Language: [selected]         │
├─────────────────────────────────┤
│                                  │
│                                  │
│    Welcome to Krishi-Rakshak     │
│            🌾                     │
│                                  │
│  Your farming companion from     │
│      Seeds to Market             │
│                                  │
│                                  │
│    [Features to be added]        │
│                                  │
│                                  │
└─────────────────────────────────┘
```

**Features:**
- Green header (#2D8B4F) with app name
- Shows selected language
- Welcome message
- Placeholder for upcoming features

---

## 🔧 Technical Implementation

### State Management
- Uses AsyncStorage for persistence
- Stores:
  - `hasSeenLanguageSelection`: Boolean (first-time flag)
  - `selectedLanguage`: String (language code)

### Navigation Flow
```
App Launch
    ↓
Splash Screen (2s)
    ↓
Check First Time?
    ├─ Yes → Language Selection → Home Screen
    └─ No  → Home Screen (with saved language)
```

### File Structure
```
src/screens/
├── SplashScreen.js         (✅ Complete)
├── LanguageSelectionScreen.js  (✅ Complete)  
└── HomeScreen.js           (✅ Base ready)
```

---

## 📋 Next Steps

Once Android Studio finishes installing:

1. **Open Android Studio**
2. **Install SDK & Create Emulator:**
   - Open SDK Manager
   - Install Android SDK Platform 33+
   - Create a virtual device (Pixel 5 recommended)

3. **Run the app:**
   ```bash
   cd /Users/admin/Hackathon/Agro-Support/KrishiRakshak
   npm run android
   ```

4. **Test the flow:**
   - See splash screen
   - Select language (first time)
   - Reach home screen
   - Close and reopen → should skip language selection

---

## 🎨 Design Notes

**Color Palette:**
- Primary: #2D8B4F (Green)
- Background: #FFFFFF (White)
- Secondary: #F5F5F5 (Light Gray)
- Text: #000000, #333333, #666666

**Typography:**
- Headers: Bold, 24-28px
- Body: Regular, 16-18px
- Captions: 14px

**Spacing:**
- Consistent 16-20px padding
- Card margin: 16px
- Border radius: 12px

---

## ✅ Completed Features
- [x] Splash screen with branding
- [x] First-time detection
- [x] Multi-language support (6 languages)
- [x] Language persistence
- [x] Home screen foundation

## 🚀 Ready for Next Phase
The foundation is complete and ready for adding:
- Product catalog
- Mandi prices
- Weather information
- Expert advice
- Order tracking
- Profile management
