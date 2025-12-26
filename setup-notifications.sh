#!/bin/bash

# Tether Notification Setup Script
# This script sets up the notification system for the Tether mobile app

echo "📬 Setting up Tether Notification System..."
echo ""

# Navigate to mobile app directory
cd /Users/sakshi/Desktop/tether/mobile-app

echo "1️⃣ Installing required dependencies..."
npx expo install expo-device
echo "✅ expo-device installed"
echo ""

echo "2️⃣ Checking existing packages..."
packages=("expo-notifications" "@react-native-async-storage/async-storage" "expo-constants")
for package in "${packages[@]}"; do
    if grep -q "\"$package\"" package.json; then
        echo "✅ $package is already installed"
    else
        echo "❌ $package is missing - installing..."
        npx expo install $package
    fi
done
echo ""

echo "3️⃣ Setting up Firebase for backend..."
echo "⚠️  Manual steps required:"
echo ""
echo "  a) Go to Firebase Console: https://console.firebase.google.com/"
echo "  b) Create/Select your project"
echo "  c) Go to Project Settings > Service Accounts"
echo "  d) Click 'Generate New Private Key'"
echo "  e) Save the JSON file to backend/config/firebase-service-account.json"
echo ""
echo "  f) Add to backend/.env:"
echo "     FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json"
echo ""

echo "4️⃣ Backend package check..."
cd ../backend
if grep -q "\"firebase-admin\"" package.json; then
    echo "✅ firebase-admin is installed"
else
    echo "❌ firebase-admin not found - installing..."
    npm install firebase-admin
fi

if grep -q "\"node-cron\"" package.json; then
    echo "✅ node-cron is installed"
else
    echo "❌ node-cron not found - installing..."
    npm install node-cron
    npm install --save-dev @types/node-cron
fi
echo ""

echo "5️⃣ Starting notification scheduler..."
echo "  Add this to your backend/src/index.ts:"
echo ""
echo "  import notificationScheduler from './services/notification/scheduler';"
echo "  import fcmProvider from './services/notification/providers/fcm.provider';"
echo ""
echo "  // After Express app setup"
echo "  await fcmProvider.initialize({"
echo "    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH"
echo "  });"
echo "  notificationScheduler.start();"
echo ""

echo "6️⃣ App configuration..."
cd ../mobile-app
echo "  Ensure app.json has:"
echo ""
echo "  \"extra\": {"
echo "    \"eas\": {"
echo "      \"projectId\": \"2eb6e92a-7dbc-4bfb-b6fe-eee2f3c2a708\""
echo "    }"
echo "  }"
echo ""

echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Complete Firebase setup (manual steps above)"
echo "   2. Start backend: cd backend && npm run dev"
echo "   3. Start mobile app: cd mobile-app && npm start"
echo "   4. Test notifications with NotificationModal component"
echo ""
echo "📖 Full documentation: /Users/sakshi/Desktop/tether/NOTIFICATION_INTEGRATION_GUIDE.md"
