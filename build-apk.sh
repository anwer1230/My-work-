#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🚀 Building Telegram Anwer APK"
echo "=========================================="

# 1. Ensure config and keystore exist
mkdir -p TMessagesProj/config

if [ -f debug.keystore.base64 ]; then
  echo "🔑 Extracting Keystore from Base64..."
  base64 -d debug.keystore.base64 > TMessagesProj/config/debug.keystore
  cp TMessagesProj/config/debug.keystore TMessagesProj/config/release.keystore
elif [ ! -f TMessagesProj/config/release.keystore ]; then
  echo "🔑 Generating new Keystore for Telegram_anwer..."
  keytool -genkey -v -keystore TMessagesProj/config/release.keystore \
    -alias Telegram_anwer -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass 772997043aa -keypass 772997043aa \
    -dname "CN=Telegram Anwer, OU=Mobile, O=Telegram, L=City, S=State, C=US"
  cp TMessagesProj/config/release.keystore TMessagesProj/config/debug.keystore
fi

# 2. Check google-services.json
if [ -f google-services.json ] && [ ! -f TMessagesProj/google-services.json ]; then
  cp google-services.json TMessagesProj/google-services.json
fi

echo "✅ Configuration and keys ready!"
echo "📦 Running Gradle build..."

if [ -f gradlew ]; then
  chmod +x gradlew
  ./gradlew assembleRelease
else
  gradle assembleRelease || gradle assembleDebug
fi

echo "🎉 Build completed!"
