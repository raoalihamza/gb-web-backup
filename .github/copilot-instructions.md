# GreenPlay Web Application

GreenPlay is a React 17.0.2 web application for sustainable mobility challenge management, built with Create React App and Firebase. The application supports multiple deployment environments (greenplay, dsa, sherbrooke, greenplaytest) and includes challenge management, user statistics, organization features, and Firebase Functions.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

Bootstrap, build, and test the repository:
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install --legacy-peer-deps` -- takes 3 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
- `npm run build` -- takes 4 minutes to complete. NEVER CANCEL. Set timeout to 15+ minutes.
- Development server: `npm start` -- takes 1 minute to compile. NEVER CANCEL. Set timeout to 5+ minutes.
- Linting: `npx eslint src/ --ext .js,.jsx --max-warnings 400` -- takes 1 minute. NEVER CANCEL. Set timeout to 3+ minutes.
- Format code: `npx prettier --write src/` -- takes 30 seconds. Set timeout to 2+ minutes.
- Environment-specific builds:
  - `npm run build:dsa` -- for DSA environment (4+ minutes)
  - `npm run build:greenplay` -- for GreenPlay environment (4+ minutes)
  - `npm run build:sherbrooke` -- for Sherbrooke environment (4+ minutes)
  - `npm run build:greenplaytest` -- for test environment (4+ minutes)

## Validation

- ALWAYS test by running through at least one complete user scenario after making changes.
- The application compiles successfully but shows many ESLint warnings (~355 warnings) - this is expected.
- Build succeeds despite Sass deprecation warnings - these are non-blocking.
- You can build and run the React development server successfully.
- **CRITICAL**: Tests are currently broken due to Babel version conflicts - do not attempt to run `npm test`.
- Always run linting with `npx eslint src/` before committing changes.
- Run `npx prettier --write src/` to format code before committing.

## Known Issues & Requirements

- **REQUIRED**: Use `--legacy-peer-deps` flag for npm install due to React version conflicts.
- **REQUIRED**: Set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` environment variable to avoid 403 firewall errors during install.
- **DO NOT** run `npm test` - the test suite is broken due to Babel version conflicts.
- **DO NOT** attempt to build Firebase Functions - the functions/src directory does not exist.
- Firebase Functions are configured for Node 12 but will show warnings on newer Node versions.

## Common Tasks

### Development Server
Run the development server for local development:
- `npm start` - starts on http://localhost:3000 (default environment)
- `npm run start:dsa` - starts with DSA environment configuration
- `npm run start:greenplay` - starts with GreenPlay environment configuration
- `npm run start:sherbrooke` - starts with Sherbrooke environment configuration
- `npm run start:greenplaytest` - starts with test environment configuration

### Building for Production
Build the application for production deployment:
- `npm run build` - default production build
- `npm run build:dsa` - build for DSA environment
- `npm run build:greenplay` - build for GreenPlay environment
- `npm run build:sherbrooke` - build for Sherbrooke environment
- `npm run build:greenplaytest` - build for test environment

### Code Quality
Maintain code quality with linting and formatting:
- `npx eslint src/ --ext .js,.jsx --max-warnings 400` - lint code (expects ~355 warnings)
- `npx eslint src/ --ext .js,.jsx --fix` - auto-fix some linting issues
- `npx prettier --write src/` - format all source files
- `npx prettier --check src/` - check if files are formatted

## Key Projects in the Codebase

### Core Application Structure
- `/src/containers/Challenge/` - Challenge management system (create, edit, view challenges)
- `/src/containers/App/` - Main application router and layout components
- `/src/components/` - Reusable React components organized by feature
- `/src/screens/` - Top-level screen components for different app sections
- `/src/services/` - Firebase API services and external integrations
- `/src/redux/` - Redux store, actions, and reducers for state management
- `/src/shared/` - Shared components and utilities
- `/src/translations/` - i18n translation files

### Important Files Frequently Modified
- `/src/containers/Challenge/ChallengeViewModel.js` - Core challenge business logic
- `/src/containers/App/Router.jsx` - Application routing configuration
- `/src/services/users.js` - User management and authentication
- `/src/services/organizations.js` - Organization management
- `/src/redux/store.js` - Redux store configuration
- `/src/translations/resources.js` - Translation resource configuration

### Configuration Files
- `package.json` - Main project dependencies and scripts
- `/functions/package.json` - Firebase Functions dependencies (Note: functions/src missing)
- `firebase.json` - Firebase project configuration with emulator settings
- `.env.*` files - Environment-specific configuration for different deployments
- `firestore.rules` - Firestore security rules
- `storage.rules` - Firebase Storage security rules

## Environment Configuration

The application supports multiple Firebase environments:
- **DSA**: Uses `.env.dsa` configuration
- **GreenPlay**: Uses `.env.greenplay` configuration  
- **Sherbrooke**: Uses `.env.sherbrooke` configuration
- **GreenPlayTest**: Uses `.env.greenplaytest` configuration

Each environment has separate Firebase projects with different API keys, database URLs, and cloud function endpoints.

## Firebase Integration

The application uses Firebase for:
- Authentication (`firebase/auth`)
- Firestore database (`firebase/firestore`)
- Cloud Storage (`firebase/storage`)
- Cloud Functions (configured but functions/src missing)
- Firebase emulators for local development (configured in firebase.json)

## Dependencies & Technology Stack

### Core Framework
- React 17.0.2 with Create React App
- Redux for state management
- React Router for navigation
- Material-UI v4 for UI components

### Firebase & Backend
- Firebase v10.7.0 for backend services
- Axios for HTTP requests
- i18next for internationalization

### Build & Development Tools
- ESLint v7.32.0 for code linting
- Prettier v2.8.8 for code formatting
- Sass for styling
- TypeScript support (partial)

### Key Libraries
- React Testing Library (tests currently broken)
- Reactstrap/Bootstrap for UI framework
- React Big Calendar for calendar functionality
- React Map GL for mapping features
- Chart.js/Recharts for data visualization

## Troubleshooting Common Issues

### Installation Issues
- If `npm install` fails with peer dependency conflicts, use `--legacy-peer-deps`
- If Puppeteer fails to download Chromium, set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- If builds are slow, ensure adequate timeout values (15+ minutes for builds)

### Build Issues
- Sass deprecation warnings are expected and non-blocking
- ESLint warnings (~355) are expected but builds still succeed
- If `npm run build` fails, check for syntax errors in recent changes

### Development Issues
- If dev server won't start, clear node_modules and reinstall dependencies
- If Firebase errors occur, check that correct environment variables are loaded
- If imports fail, verify file paths use correct case sensitivity

## File Output Examples

### Repository Root
```
.env
.env.dsa
.env.greenplay
.env.greenplaytest
.env.sherbrooke
.firebaserc
.github/
.gitignore
README.md
config.js
firebase.json
firestore.indexes.json
firestore.rules
functions/
package.json
public/
src/
storage.rules
```

### Source Directory Structure
```
src/
├── assets/
├── atomicComponents/
├── components/
├── constants/
├── containers/
│   ├── App/
│   ├── Challenge/
│   └── ...
├── hooks/
├── redux/
├── screens/
├── services/
├── shared/
├── tests/
├── translations/
└── utils/
```

### Package.json Scripts (Most Important)
```json
{
  "start": "react-scripts --openssl-legacy-provider start",
  "build": "react-scripts --openssl-legacy-provider build",
  "test": "react-scripts test",
  "start:dsa": "firebase use defisansautosolo | dotenv -e .env.dsa npm run start",
  "build:dsa": "firebase use defisansautosolo | dotenv -e .env.dsa npm run build"
}
```