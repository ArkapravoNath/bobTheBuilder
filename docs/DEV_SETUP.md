# Build Buddy — Developer Environment Setup

## Current status (as of 2026-04-27)

| Tool | Status | Fix needed |
|------|--------|-----------|
| Node 20 (via nvm) | ✅ | None |
| pnpm 9 | ✅ | None |
| Xcode.app | ✅ installed | Run fix command below |
| xcode-select | ❌ pointing at CLT | Run fix command below |
| Android Studio | ✅ installed | SDK not yet downloaded |
| Android SDK | ❌ not downloaded | Run SDK Manager (below) |
| Java (bundled JDK) | ✅ (inside Android Studio) | .zshrc already updated |
| Shell env (ANDROID_HOME) | ✅ added to .zshrc | Reload shell |

---

## Step 1 — Reload your shell (do this first)

```bash
source ~/.zshrc
```

---

## Step 2 — Fix iOS (`simctl` error)

Run this once (needs your Mac password):

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Then accept the Xcode license:
```bash
sudo xcodebuild -license accept
```

Verify it worked:
```bash
xcrun simctl list devices | head -10
```
You should see a list of iPhone simulators.

---

## Step 3 — Install Android SDK via Android Studio

1. Open **Android Studio** (`/Applications/Android Studio.app`)
2. Click **More Actions → SDK Manager** (or go to **Settings → Languages & Frameworks → Android SDK**)
3. In the **SDK Platforms** tab, tick:
   - ✅ Android 14.0 (API 34)
   - ✅ Android 13.0 (API 33) *(optional but recommended)*
4. In the **SDK Tools** tab, tick:
   - ✅ Android SDK Build-Tools 34
   - ✅ Android SDK Platform-Tools ← **this installs `adb`**
   - ✅ Android Emulator
   - ✅ Intel x86 Emulator Accelerator (HAXM) *or* Android Emulator Hypervisor Driver
5. Click **Apply** → **OK** → wait for download (~2–4 GB)
6. SDK installs to `~/Library/Android/sdk` (already set in .zshrc)
7. Reload shell: `source ~/.zshrc`
8. Verify: `adb --version`

---

## Step 4 — Create an Android Emulator (AVD)

1. In Android Studio: **More Actions → Virtual Device Manager**
2. Click **+ Create Device**
3. Choose: **Pixel 6a** → Next
4. System image: **API 34 (Android 14, Google Play)** → Download if needed → Next
5. Finish. The AVD appears in the list.
6. Click ▶ to start it.

---

## Running the app

### Option A — Expo Go on your physical device (WORKS NOW, no SDK needed) ⭐

**This is the fastest way to test right now.**

1. Install **Expo Go** on your phone:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. Start the mock API (separate terminal):
   ```bash
   pnpm mock-api:dev
   ```

3. Start the Expo Metro server:
   ```bash
   pnpm start
   ```
   or if your phone is on a different network:
   ```bash
   pnpm start:tunnel
   ```

4. **Android**: Open Expo Go → scan the QR code shown in terminal  
   **iOS**: Open Camera app → point at QR code → tap the Expo Go link

> ⚠️ Phone and laptop must be on the **same WiFi** for LAN mode.  
> Use `--tunnel` if they're on different networks (slower but works anywhere).

---

### Option B — Android Emulator (after SDK installed)

```bash
# Start the mock API
pnpm mock-api:dev

# Start Metro + launch on emulator
pnpm android
```

---

### Option C — iOS Simulator (after iOS fix in Step 2)

```bash
pnpm mock-api:dev
pnpm ios
```

---

## Building an APK (no local SDK required) ⭐

Use **EAS Build** — Expo's cloud build service. Free tier available.

### One-time setup

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account (create one free at expo.dev if needed)
eas login

# Link this project to your Expo account
cd apps/mobile
eas init
```

### Build a preview APK (installs directly on any Android device)

```bash
cd apps/mobile
pnpm build:apk:cloud
```

This takes ~5–10 minutes in the cloud. When done, EAS gives you a **download link** for the `.apk` file.

Install it on your Android device:
- Download the `.apk` to your phone
- Open it (you may need to allow "Install from unknown sources" in Settings)
- Done — no Play Store needed

### Build locally (after SDK installed)

```bash
pnpm build:apk
```

---

## Quick reference — daily workflow

```bash
# Terminal 1 — mock backend
pnpm mock-api:dev

# Terminal 2 — Expo (choose one)
pnpm start          # Expo Go on phone (scan QR)
pnpm android        # Android emulator (needs SDK)
pnpm ios            # iOS simulator (needs Step 2 fix)
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `adb: command not found` | Install SDK Platform-Tools via Android Studio SDK Manager |
| `ANDROID_HOME not set` | Run `source ~/.zshrc` |
| `xcrun simctl: not a developer tool` | Run `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer` |
| `spawn adb ENOENT` | Same as `adb: command not found` above |
| `Error: xcrun simctl exited with code 72` | Run `sudo xcodebuild -license accept` |
| Expo Go shows "Something went wrong" | Make sure `pnpm mock-api:dev` is running |
| Phone can't reach Metro server | Use `pnpm start:tunnel` instead of `pnpm start` |
