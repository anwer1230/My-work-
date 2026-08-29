#!/usr/bin/env bash
set -e

# Target directory and file path
KEYSTORE_DIR="TMessagesProj/config"
KEYSTORE_FILE="${KEYSTORE_DIR}/release.keystore"
ALIAS_NAME="Telegram_anwer"
KEY_PASSWORD="772997043aa"
VALIDITY_DAYS=10000
DNAME="CN=Telegram Anwer, OU=Mobile, O=Telegram, L=City, S=State, C=US"

echo "=========================================="
echo "🔑 Generating Release Keystore"
echo "=========================================="

# Create target directory if it doesn't exist
mkdir -p "${KEYSTORE_DIR}"

# Check if keytool is available
if ! command -v keytool &> /dev/null; then
  echo "⚠️ Warning: 'keytool' command not found in PATH."
  echo "Please run this script on a machine with JDK/JRE or Android Studio installed."
  exit 1
fi

# Remove existing keystore if needed to prevent overwrite prompt issues
if [ -f "${KEYSTORE_FILE}" ]; then
  echo "ℹ️ Existing keystore found at ${KEYSTORE_FILE}, backing up to ${KEYSTORE_FILE}.bak..."
  cp "${KEYSTORE_FILE}" "${KEYSTORE_FILE}.bak"
  rm -f "${KEYSTORE_FILE}"
fi

# Generate the keystore using keytool
keytool -genkeypair -v \
  -keystore "${KEYSTORE_FILE}" \
  -alias "${ALIAS_NAME}" \
  -keyalg RSA \
  -keysize 2048 \
  -validity "${VALIDITY_DAYS}" \
  -storepass "${KEY_PASSWORD}" \
  -keypass "${KEY_PASSWORD}" \
  -dname "${DNAME}"

echo ""
echo "✅ Keystore created successfully!"
echo "📁 Location: ${KEYSTORE_FILE}"
echo "🏷️  Alias: ${ALIAS_NAME}"
echo "🔒 Password: ${KEY_PASSWORD}"
echo "=========================================="
