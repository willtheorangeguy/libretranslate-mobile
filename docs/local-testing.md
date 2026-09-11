# Testing locally on this Mac

Run the actual Android app in an emulator:

```bash
npm run local:android
```

This starts the `LibreTranslate_Local` Android emulator, Metro, and a local LibreTranslate server, then builds and installs the debug app. The first server start downloads English and Spanish models. Subsequent launches reuse the SDK, build cache, and models.

In the app, choose **Custom server** and enter **http://127.0.0.1:5001** with no API key. The launcher forwards the emulator’s ports to this Mac. Try translating “Hello, how are you?” from Auto Detect to Spanish.

The server’s own web interface is available at [localhost:5001](http://localhost:5001). It uses real LibreTranslate models, with a 5,000-character limit and 60 requests per minute. It listens only on this Mac’s loopback interface.

To start just the server:

```bash
npm run local:server
```

Logs are in `.local/emulator.log`, `.local/metro.log`, and `.local/server.log`. The `.local` directory contains machine-specific files and is excluded from git, Metro, linting, and tests.

To stop the local server, Metro, and this project’s emulator:

```bash
npm run local:stop
```

## Installed development tools

- Java 21: `.local/jdk/Contents/Home`
- Python 3.11 and LibreTranslate 1.9.6: `.local/server-venv`
- Android SDK: `~/Library/Android/sdk`
- Emulator: `LibreTranslate_Local`, Android 15 (API 35), ARM64

The launcher configures Java and Android paths for its own process. It does not require changing your shell profile or the selected Xcode.

To recreate the Android SDK after installing the command-line tools and Java 21:

```bash
source scripts/local-env.sh
yes | sdkmanager --licenses
sdkmanager 'platform-tools' 'platforms;android-36' 'build-tools;36.0.0' \
  'ndk;27.1.12297006' 'cmake;3.22.1' 'emulator' \
  'system-images;android-35;default;arm64-v8a'
```

`npm install` applies the checked-in patches that make the older voice, filesystem, SQLite, and speech libraries compatible with the current Android build tooling.

The AOSP emulator may not have a speech-recognition service or text-to-speech voices installed. Text and file translation can be tested independently of these platform services.

## iOS

This Mac currently has Xcode 16.0. The project requires Xcode 16.1 or newer. After upgrading Xcode, run `pod install` in `ios/`, then `npm run ios`. The same local server can be used from the iOS simulator.
