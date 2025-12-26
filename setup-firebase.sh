#!/bin/bash

# 🔥 Firebase Setup Guide for Tether Notifications
# Follow these steps to configure Firebase for push notifications

echo "🔥 Firebase Configuration Guide for Tether"
echo "=========================================="
echo ""

# Step 1: Firebase Console Setup
echo "📝 STEP 1: Create Firebase Project"
echo "-----------------------------------"
echo "1. Go to: https://console.firebase.google.com/"
echo "2. Click 'Add Project' or select existing project"
echo "3. Project name: 'Tether' (or your choice)"
echo "4. Enable Google Analytics (optional but recommended)"
echo "5. Click 'Create Project'"
echo ""
echo "✅ Press Enter when project is created..."
read

# Step 2: Service Account Key
echo ""
echo "📝 STEP 2: Generate Service Account Key"
echo "----------------------------------------"
echo "1. In Firebase Console, click ⚙️ (Settings) → Project Settings"
echo "2. Navigate to 'Service Accounts' tab"
echo "3. Click 'Generate New Private Key'"
echo "4. Download JSON file (e.g., 'tether-firebase-adminsdk-xxxxx.json')"
echo "5. Save it to: backend/config/firebase-service-account.json"
echo ""
echo "✅ Press Enter when file is saved..."
read

# Step 3: Verify file exists
if [ -f "./backend/config/firebase-service-account.json" ]; then
    echo "✅ Service account file found!"
else
    echo "❌ Service account file NOT found at: backend/config/firebase-service-account.json"
    echo "Please save the file and run this script again."
    exit 1
fi

# Step 4: Update environment variables
echo ""
echo "📝 STEP 3: Update Environment Variables"
echo "----------------------------------------"

ENV_FILE="./backend/config/env/development.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Creating $ENV_FILE..."
    touch "$ENV_FILE"
fi

# Check if variable already exists
if grep -q "FIREBASE_SERVICE_ACCOUNT_PATH" "$ENV_FILE"; then
    echo "⚠️  FIREBASE_SERVICE_ACCOUNT_PATH already exists in $ENV_FILE"
    echo "Skipping..."
else
    echo "Adding FIREBASE_SERVICE_ACCOUNT_PATH to $ENV_FILE..."
    echo "" >> "$ENV_FILE"
    echo "# Firebase Configuration" >> "$ENV_FILE"
    echo "FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json" >> "$ENV_FILE"
    echo "✅ Environment variable added!"
fi

echo ""
echo "✅ Press Enter to continue to iOS setup..."
read

# Step 5: iOS APNs Key Setup
echo ""
echo "📝 STEP 4: Configure iOS APNs (Apple Push Notifications)"
echo "--------------------------------------------------------"
echo "For iOS production notifications, you need an APNs key:"
echo ""
echo "1. Go to: https://developer.apple.com/account/resources/authkeys/list"
echo "2. Click '+' to create new key"
echo "3. Key Name: 'Tether APNs Key'"
echo "4. Enable: ✅ Apple Push Notifications service (APNs)"
echo "5. Click 'Continue' → 'Register' → Download .p8 file"
echo "6. Note your Key ID (e.g., ABC123XYZ)"
echo "7. Note your Team ID (found in membership section)"
echo ""
echo "📥 Upload APNs Key to Firebase:"
echo "1. Firebase Console → Project Settings → Cloud Messaging"
echo "2. Scroll to 'Apple app configuration'"
echo "3. Upload .p8 file"
echo "4. Enter Key ID: [your key ID]"
echo "5. Enter Team ID: [your team ID]"
echo "6. Click 'Upload'"
echo ""
echo "⚠️  Note: APNs key is needed ONLY for production iOS builds"
echo "   Development/testing works without it using Expo Push Token"
echo ""
echo "✅ Press Enter when APNs is configured (or skip for now)..."
read

# Step 6: Android google-services.json
echo ""
echo "📝 STEP 5: Configure Android google-services.json"
echo "--------------------------------------------------"
echo "For Android production, you need google-services.json:"
echo ""
echo "1. In Firebase Console → Project Settings → General"
echo "2. Scroll to 'Your apps' section"
echo "3. Click 'Add app' → Select Android icon"
echo "4. Android package name: com.yourcompany.tether"
echo "   (Must match 'package' in app.json)"
echo "5. Click 'Register app'"
echo "6. Download 'google-services.json'"
echo "7. Save to: mobile-app/android/app/google-services.json"
echo ""
echo "⚠️  Note: google-services.json is needed ONLY for production Android"
echo "   Development/testing works with Expo Push Token"
echo ""
echo "✅ Press Enter when configured (or skip for now)..."
read

# Step 7: Test Firebase connection
echo ""
echo "📝 STEP 6: Test Firebase Connection"
echo "------------------------------------"
echo "Let's verify Firebase is configured correctly..."
echo ""

cd backend

# Check if firebase-admin is installed
if ! npm list firebase-admin &> /dev/null; then
    echo "⚠️  firebase-admin not found. Installing..."
    pnpm add firebase-admin
fi

# Create test script
cat > test-firebase.js << 'EOF'
const admin = require('firebase-admin');
const serviceAccount = require('./config/firebase-service-account.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase initialized successfully!');
  console.log('Project ID:', serviceAccount.project_id);
  console.log('Client Email:', serviceAccount.client_email);
  console.log('');
  console.log('🎉 Firebase is ready for notifications!');
  process.exit(0);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('');
  console.log('Please check:');
  console.log('1. Service account file exists at: backend/config/firebase-service-account.json');
  console.log('2. JSON file is valid (not corrupted)');
  console.log('3. File has correct permissions');
  process.exit(1);
}
EOF

echo "Running Firebase connection test..."
node test-firebase.js

TEST_RESULT=$?

# Cleanup
rm test-firebase.js

cd ..

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "✅ Firebase configuration complete!"
else
    echo ""
    echo "❌ Firebase test failed. Please review the errors above."
    exit 1
fi

# Step 8: Summary
echo ""
echo "=========================================="
echo "🎉 Firebase Setup Complete!"
echo "=========================================="
echo ""
echo "✅ Completed Steps:"
echo "  1. Firebase project created"
echo "  2. Service account key generated and saved"
echo "  3. Environment variables configured"
echo "  4. iOS APNs configured (or skipped for development)"
echo "  5. Android google-services.json configured (or skipped)"
echo "  6. Firebase connection tested successfully"
echo ""
echo "📋 Next Steps:"
echo "  1. Start backend server: cd backend && pnpm dev"
echo "  2. Start mobile app: cd mobile-app && npx expo start"
echo "  3. Login and allow notification permissions"
echo "  4. Test notifications using checklist: NOTIFICATION_TESTING_CHECKLIST.md"
echo ""
echo "📚 Documentation:"
echo "  - Notification Flow: NOTIFICATION_FLOW_VISUAL.md"
echo "  - Testing Guide: NOTIFICATION_TESTING_CHECKLIST.md"
echo "  - Integration Guide: NOTIFICATION_INTEGRATION_GUIDE.md"
echo ""
echo "🔧 Configuration Summary:"
echo "  - Service Account: backend/config/firebase-service-account.json"
echo "  - Environment: backend/config/env/development.env"
echo "  - Firebase Project: $(grep project_id backend/config/firebase-service-account.json | cut -d'"' -f4 2>/dev/null || echo 'Check firebase-service-account.json')"
echo ""
echo "Happy notifying! 🚀"
