# Todo List App

A simple, cozy to-do list app for Android with smart task suggestions.

## Features

- **Task Groups**: Organize tasks into groups
- **Smart Suggestions**: "What should I do?" button suggests tasks based on due date and priority
- **Group Filtering**: Filter which groups to include in suggestions
- **Task Linking**: Link related tasks together
- **Due Dates & Priority**: Set due dates (1-5 priority levels)
- **Cozy Light Theme**: Warm, comfortable design

## Running the App

### Option 1: Development Mode (Expo Go) - Easiest for Testing

1. **On your phone**: Install "Expo Go" from the Google Play Store

2. **On your computer**: Open a terminal in the TodoApp folder and run:
   ```bash
   cd c:\Users\gcostantini\Projects\progetti_spot\to_do_list_app\TodoApp
   npx expo start
   ```

3. **Connect**:
   - Make sure your phone and computer are on the same WiFi network
   - Scan the QR code shown in the terminal with your phone's camera
   - It will open in Expo Go

### Option 2: Build an APK (for Permanent Installation)

This creates a standalone app you can install permanently on your phone.

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo** (create free account at https://expo.dev if needed):
   ```bash
   eas login
   ```

3. **Configure the build** (first time only):
   ```bash
   eas build:configure
   ```

4. **Build the APK**:
   ```bash
   eas build -p android --profile preview
   ```

   This will take several minutes. When done, you'll get a download link.

5. **Install on your phone**:
   - Download the APK from the link provided
   - Transfer it to your phone (or download directly on phone)
   - Open the APK file to install
   - You may need to enable "Install from unknown sources" in your phone settings

### Option 3: Local APK Build (No Expo Account)

1. **Install Android SDK** if you don't have it

2. **Run the local build**:
   ```bash
   npx expo run:android
   ```

## Project Structure

```
TodoApp/
├── App.js                 # Main app with navigation
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # App screens
│   ├── context/           # State management
│   ├── storage/           # AsyncStorage helpers
│   ├── utils/             # Utility functions
│   └── theme/             # Colors, fonts, spacing
```

## How to Use

1. **Home Screen**:
   - Tap "What should I do?" to get a task suggestion
   - Use the quick-add field to add tasks fast
   - Tap "Filter groups" to choose which groups to include in suggestions

2. **Tasks Screen**:
   - View all tasks
   - Filter by group
   - Tap + to add a new task with all details

3. **Groups Screen**:
   - Create and manage groups
   - Tap + to add a new group
   - Tap a group to see its tasks

## Tech Stack

- React Native (Expo)
- React Navigation
- AsyncStorage for local data persistence
