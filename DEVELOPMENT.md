# LibreTranslate Mobile App (iOS)

A feature-rich iOS mobile application for LibreTranslate that rivals Google Translate. Connect to your self-hosted LibreTranslate instance and enjoy offline-capable translation with text and speech support.

## Features

- 🌐 **Connect to Self-Hosted Server**: Configure your own LibreTranslate instance
- 📱 **Native iOS App**: Built with React Native for optimal iOS experience
- 🎙️ **Speech-to-Text**: Voice input for hands-free translation
- 🔊 **Text-to-Speech**: Hear translated content pronounced
- 📜 **Translation History**: Access your past translations
- ⭐ **Favorites**: Save frequently used translations
- 🌙 **Dark Mode**: Easy on the eyes in low-light environments
- ⚙️ **Customizable Settings**: Adjust language defaults and preferences
- 🔌 **Offline Support**: Cache translations for offline access

## Architecture

The app is built with:

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe code
- **Redux Toolkit** - State management
- **React Navigation** - Bottom tab navigation
- **Axios** - HTTP client
- **AsyncStorage** - Local data persistence
- **Jest & Testing Library** - Testing framework

### Project Structure

```
src/
├── screens/          # Screen components (Translate, History, Favorites, Settings)
├── components/       # Reusable UI components
├── navigation/       # Navigation configuration
├── store/           # Redux store and slices
├── services/        # API client and utilities
├── types/           # TypeScript type definitions
├── constants/       # App constants
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── styles/          # Shared styles
└── __tests__/       # Test files
```

## Installation

### Prerequisites

- Node.js (v22.11.0+)
- npm or yarn
- Xcode (for iOS development)
- React Native CLI

### Setup Instructions

1. **Clone and install dependencies**

```bash
cd LibreMobile/LibreTranslateApp
npm install
```

2. **Configure your LibreTranslate server**

Edit the default server URL in `ServerSetupScreen.tsx` or add it through the app UI.

3. **Run on iOS simulator**

```bash
npm run ios
```

4. **Run on Android (if adapting)**

```bash
npm run android
```

## Development

### Scripts

```bash
# Start Metro bundler
npm start

# Run iOS app
npm run ios

# Run Android app
npm run android

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format

# Testing
npm test
npm run test:watch
npm run test:coverage
```

### TypeScript Configuration

The project uses strict TypeScript settings. All code should be properly typed.

### Code Style

- ESLint for code quality
- Prettier for formatting
- Follow React Native best practices

## Configuration

### Adding a LibreTranslate Server

1. Launch the app
2. Enter your LibreTranslate server URL (e.g., `http://192.168.1.100:5000`)
3. Provide a friendly name for the server
4. Tap "Connect to Server"

The app will validate the connection before saving.

## API Integration

The app communicates with LibreTranslate via REST API:

- `GET /languages` - Get available languages
- `POST /translate` - Translate text
- `POST /detect` - Detect language

See `src/services/LibreTranslateClient.ts` for implementation.

## State Management

Redux Toolkit manages:

- **Translation State**: History, favorites, loading state
- **Server State**: Server configurations, active server
- **Settings State**: User preferences (language defaults, UI preferences)

## Local Storage

- Translation history (up to 100 items)
- Favorite translations
- User settings
- Server configurations

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Test files are located in `src/__tests__/` with the same structure as source code.

## Building for Release

### iOS Build

```bash
# Using Xcode
open ios/LibreTranslateApp.xcworkspace

# Or via CLI
react-native run-ios --configuration Release
```

### App Store Submission

1. Generate signing certificate in Xcode
2. Create App Store listing
3. Build and archive the app
4. Upload to App Store Connect
5. Submit for review

See [React Native docs](https://reactnative.dev/docs/publishing) for details.

## Troubleshooting

### Connection Issues
- Verify LibreTranslate server is running
- Check firewall settings
- Ensure correct URL format (include scheme: http/https)

### Build Issues
- Clear cache: `npm start -- --reset-cache`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clear Metro bundler cache

## Roadmap

### Phase 1 ✅ (Current)
- Project setup and infrastructure
- API client and server configuration
- Basic translation UI

### Phase 2-3 (Upcoming)
- Advanced features (speech, audio)
- History and persistence
- Settings and customization

### Phase 4-5 (Future)
- UI polish and testing
- App Store deployment

## Contributing

1. Create a feature branch
2. Follow code style guidelines (ESLint + Prettier)
3. Write tests for new features
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check LibreTranslate documentation: https://github.com/LibreTranslate/LibreTranslate
- Report bugs via GitHub Issues

## Performance Tips

- Keep translation history pruned (max 100 items)
- Use language detection sparingly
- Cache translations locally
- Minimize API calls

## Security Considerations

- Never hardcode server URLs
- Use HTTPS for production servers
- Validate all user inputs
- Don't log sensitive data

---

**Version**: 1.0.0
**React Native**: 0.85.2
**iOS Target**: 15.0+
