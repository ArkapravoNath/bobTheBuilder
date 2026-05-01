#!/bin/bash
# Run this to verify your dev environment is ready for Build Buddy.
# Usage:  bash scripts/check-env.sh

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo ""
echo "══════════════════════════════════════════"
echo "  Build Buddy — Environment Check"
echo "══════════════════════════════════════════"
echo ""

# Node
NODE_VER=$(node -v 2>/dev/null)
if [[ "$NODE_VER" == v20* ]]; then ok "Node $NODE_VER"
elif [[ -n "$NODE_VER" ]]; then warn "Node $NODE_VER (need v20 — run: nvm use 20)"
else fail "Node not found"; fi

# pnpm
PNPM_VER=$(pnpm -v 2>/dev/null)
if [[ -n "$PNPM_VER" ]]; then ok "pnpm $PNPM_VER"
else fail "pnpm not found"; fi

# Java
JAVA_VER=$(java -version 2>&1 | head -1)
if [[ -n "$JAVA_VER" ]]; then ok "Java: $JAVA_VER"
else fail "Java not found — check JAVA_HOME in .zshrc"; fi

# Android SDK
if [[ -d "${ANDROID_HOME}" ]]; then ok "ANDROID_HOME=$ANDROID_HOME"
else fail "ANDROID_HOME not set or SDK not installed — see docs/DEV_SETUP.md Step 3"; fi

# adb
if command -v adb &>/dev/null; then ok "adb $(adb --version | head -1)"
else fail "adb not in PATH — install SDK Platform-Tools via Android Studio SDK Manager"; fi

# Xcode developer tools
XCODE_PATH=$(xcode-select -p 2>/dev/null)
if [[ "$XCODE_PATH" == *"Xcode.app"* ]]; then ok "xcode-select → $XCODE_PATH"
else fail "xcode-select points to CLT, not Xcode.app — run: sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"; fi

# simctl
if xcrun simctl list devices &>/dev/null; then ok "simctl working (iOS simulators available)"
else fail "simctl broken — after fixing xcode-select, run: sudo xcodebuild -license accept"; fi

# Mock API reachable
if curl -s http://localhost:4000/healthz | grep -q '"status":"ok"'; then
  ok "Mock API running at :4000"
else
  warn "Mock API not running — start it with: pnpm mock-api:dev"
fi

# EAS CLI
if command -v eas &>/dev/null; then ok "EAS CLI $(eas --version 2>/dev/null)"
else warn "EAS CLI not installed — for cloud APK builds run: npm install -g eas-cli"; fi

echo ""
echo "══════════════════════════════════════════"
echo "  See docs/DEV_SETUP.md for full guide"
echo "══════════════════════════════════════════"
echo ""
