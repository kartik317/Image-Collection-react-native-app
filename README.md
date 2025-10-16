![Image Collection logo](https://i.postimg.cc/k4GXvHjV/20251016-120141-1760597280328.png)
# 📚 Image Collection App

A beautiful, dark-themed React Native mobile application for creating and managing personal image collections. Built with Expo, this app allows users to organize their photos into custom collections with logos and metadata.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🎨 **Modern Dark Theme** - Sleek, eye-friendly interface with purple accents
- 📁 **Create Collections** - Organize images into custom-named collections
- 🖼️ **Logo Support** - Add unique logos to each collection
- 🔍 **Browse & View** - View collections in a beautiful grid layout
- ✏️ **Edit Collections** - Update collection names, logos, and images
- 🗑️ **Delete Collections** - Remove unwanted collections with confirmation
- 💾 **Local Storage** - All data stored locally on device using AsyncStorage
- 📸 **Multiple Image Selection** - Add multiple images at once
- 🔎 **Fullscreen Viewer** - View images in fullscreen mode
- 📱 **Tab Navigation** - Easy navigation between Home and Collections

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android builds) or Xcode (for iOS builds)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kartik317/Image-Collection-react-native-app
   cd Image-Collection-react-native-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - **Android**: Press `a` or scan QR code with Expo Go app
   - **iOS**: Press `i` or scan QR code with Camera app
   - **Web**: Press `w`

## 📱 Building for Production

### Android APK

#### Using EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build APK
eas build -p android --profile preview
```

#### Local Build
```bash
# Prebuild native Android project
npx expo prebuild --clean

# Build release APK
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### iOS Build

```bash
eas build -p ios --profile preview
```

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Storage**: AsyncStorage
- **File System**: Expo File System
- **Image Picker**: Expo Image Picker
- **State Management**: React Hooks (useState, useEffect)

## 📂 Project Structure

```
image-collection/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home screen - Create collection
│   │   ├── collections.tsx    # Collections list view
│   │   └── _layout.tsx        # Tab navigation layout
│   │   ├── edit/
│   │       └── [id].tsx       # Edit collection screen
│   └── _layout.tsx            # Root layout
├── assets/
│   └── images/                # App icons and splash screens
├── constants/
│   └── icons.ts               # Icon imports
├── app.json                   # Expo configuration
├── package.json               # Dependencies
└── tailwind.config.js         # TailwindCSS configuration
```

## 🎨 Key Screens

### Home Screen
- Create new collections
- Add collection name
- Select logo image
- Add multiple images
- Dark-themed input fields and buttons

### Collections Screen
- Grid view of all collections
- Each card shows logo and image count
- Tap to view collection details
- Swipe delete functionality
- Empty state with call-to-action

### Collection Detail Modal
- View all images in a collection
- Fullscreen image viewer
- Edit button to modify collection
- Close button to return

### Edit Collection Screen
- Update collection name
- Change logo
- Add or remove images
- Save changes with validation
- Dark-themed interface

## 🔧 Configuration

### Customize App Name & Theme

Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "android": {
      "package": "com.yourcompany.yourapp",
      "adaptiveIcon": {
        "backgroundColor": "#000000"
      }
    }
  }
}
```

### Change Colors

Edit `tailwind.config.js` or update class names in components:
- Primary: `purple-600`
- Secondary: `blue-600`
- Success: `emerald-600`
- Background: `gray-950`
- Cards: `gray-900`

## 📦 Key Dependencies

```json
{
  "expo": "^52.0.11",
  "expo-router": "~4.0.9",
  "react-native": "0.76.5",
  "nativewind": "^4.0.1",
  "expo-image-picker": "~16.0.3",
  "expo-file-system": "~18.0.4",
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

## 🐛 Troubleshooting

### Build Errors

**Package name error:**
- Ensure package name in `app.json` is lowercase with no underscores
- Format: `com.company.appname`

**Image loading issues:**
- Check file paths in `app.json`
- Ensure icons are valid PNG files (1024x1024)

**Gradle build failures:**
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

### Runtime Issues

**Collections not loading:**
- Check AsyncStorage permissions
- Clear app data and restart

**Images not displaying:**
- Verify file system permissions
- Check image URIs are valid

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👤 Author

**Your Name**
- GitHub: [@kartik317](https://github.com/kartik317)

## 🙏 Acknowledgments

- Expo team for the amazing framework
- React Native community
- NativeWind for TailwindCSS integration

---