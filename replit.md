# Replit.md - Humanitarian Family Reunification Platform

## Overview

This is a humanitarian platform designed to help refugee families reunite through advanced biometric matching and AI-powered data analysis. The system uses facial recognition, voice analysis, and personal information to identify potential family connections among displaced individuals.

## System Architecture

### Frontend Architecture
- **Framework**: SvelteKit 5.35.1 with Svelte 5 for reactive UI components
- **Styling**: Tailwind CSS 4.1.11 with custom design system including humanitarian-focused color palette
- **Icons**: Lucide Svelte for consistent iconography
- **Data Visualization**: D3.js 7.9.0 for connection graphs and relationship mapping
- **Build Tool**: Vite 6.3.5 for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with SvelteKit's adapter-node for server-side rendering
- **Database**: Better-sqlite3 for local SQLite database storage
- **AI Integration**: Google Gemini AI for generating insights from user data
- **Biometric Processing**: Custom JavaScript modules for facial and voice feature extraction
- **Encryption**: Web Crypto API for secure biometric data handling

### Key Design Decisions
- **SQLite over PostgreSQL**: Chosen for simplicity and portability in humanitarian contexts where infrastructure may be limited
- **Client-side biometric processing**: Reduces server load and improves privacy
- **Encrypted biometric storage**: Ensures sensitive data protection
- **Node.js deployment**: Enables easy deployment on various hosting platforms

## Key Components

### Database Schema
- **Users table**: Stores personal information, family details, and metadata
- **User_biometrics table**: Encrypted storage for facial and voice features
- **Connections table**: Tracks potential family matches with similarity scores

### Biometric Services
- **Face feature extraction**: Processes uploaded photos to extract facial characteristics
- **Voice feature extraction**: Analyzes audio recordings for voice patterns
- **Similarity calculation**: Compares biometric data to find potential matches

### AI Services
- **Gemini AI integration**: Generates insights from user data for improved matching
- **Multi-language support**: Handles various languages spoken by refugees
- **Risk assessment**: Evaluates priority levels for family reunification cases

### Security Features
- **Data encryption**: AES-GCM encryption for sensitive biometric data
- **PBKDF2 key derivation**: Secure key generation from user passwords
- **CSRF protection**: Disabled for API flexibility but should be enabled in production

## Data Flow

1. **User Registration**: 
   - User provides personal information and uploads photo/voice recording
   - Biometric features are extracted and encrypted
   - AI generates insights and matching keywords
   - Data is stored in SQLite database

2. **Matching Process**:
   - System compares new user's biometric data with existing records
   - Similarity scores are calculated across facial, voice, and information data
   - Potential matches are ranked by confidence levels

3. **Visualization**:
   - Connection graphs show relationships between users
   - D3.js renders interactive network diagrams
   - Users can explore potential family connections

## External Dependencies

### Core Services
- **Google Gemini AI**: For intelligent data analysis and insights generation
- **Better-sqlite3**: Native SQLite database driver
- **Web Crypto API**: For client-side encryption

### Development Tools
- **Tailwind CSS**: Utility-first styling framework
- **PostCSS**: CSS preprocessing with autoprefixer
- **Vite**: Build tool and development server

### Missing Dependencies
- **Face detection library**: Currently using mock implementation (recommend face-api.js or TensorFlow.js)
- **Audio processing library**: Mock implementation present (recommend Meyda or Web Audio API)
- **Authentication system**: Basic structure present but needs implementation

## Deployment Strategy

### Production Configuration
- **Adapter**: SvelteKit Node.js adapter for server deployment
- **Database**: File-based SQLite with fallback to in-memory for testing
- **Server**: Configured to bind to 0.0.0.0:5000 for container deployment
- **Assets**: Static asset optimization enabled

### Environment Variables
- `VITE_GEMINI_API_KEY`: Google Gemini AI API key
- `GEMINI_API_KEY`: Server-side Gemini API key (fallback)

### Deployment Considerations
- Database directory (`data/`) must be writable
- Large biometric files require adequate storage
- Consider CDN for static assets in production

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## Development Notes

### Current Implementation Status
- ✅ Basic SvelteKit setup with Tailwind CSS
- ✅ Database schema and basic operations
- ✅ AI integration with Gemini
- ✅ Biometric processing structure
- ✅ API endpoints for core functionality
- ⚠️ Mock biometric feature extraction (needs real implementation)
- ⚠️ Authentication system structure only
- ⚠️ Encryption utilities partially implemented

### Next Steps
1. Implement real biometric feature extraction
2. Complete authentication and session management
3. Add comprehensive error handling
4. Implement real-time matching updates
5. Add multi-language support for UI
6. Enhance security measures for production deployment

### Technical Debt
- Replace mock biometric processing with actual libraries
- Implement proper error boundaries
- Add comprehensive logging
- Create backup and recovery procedures
- Add performance monitoring