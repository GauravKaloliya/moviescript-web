# MovieScript - Coming Soon Landing Page

## Overview

MovieScript is a coming soon landing page for a future screenplay writing and movie production platform. The project is a static frontend application showcasing the upcoming features and collecting email signups from interested users. The page features a dark, cinematic design with countdown functionality and email collection capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML/CSS/JavaScript**: Pure vanilla web technologies without frameworks
- **Single Page Application**: All functionality contained in a single HTML file with modular CSS and JavaScript
- **Progressive Enhancement**: Core content accessible without JavaScript, enhanced features added via JS
- **Responsive Design**: Mobile-first approach with flexible layouts and viewport optimization

### Design System
- **Typography**: Inter font family from Google Fonts for modern, clean readability
- **Color Scheme**: Dark theme with gradient backgrounds (#0a0a0a to #1a1a1a) and orange accent color (#ff6b35)
- **Icons**: Font Awesome 6.4.0 for consistent iconography
- **Animations**: CSS animations for page load effects and user interaction feedback

### JavaScript Features
- **Email Validation**: Client-side email format validation using regex patterns
- **Local Storage**: Browser storage for demo email collection (simulating backend persistence)
- **Countdown Timer**: Dynamic countdown calculation to launch date (60 days from page load)
- **Form Handling**: Asynchronous form submission simulation with success messaging

### User Experience Components
- **Feature Preview**: Three key features highlighted with icons (Professional Editor, Collaboration, Production Management)
- **Email Signup**: Newsletter subscription form with validation and success states
- **Success Messaging**: Temporary notification system for user feedback
- **Launch Countdown**: Real-time countdown display showing days, hours, minutes, and seconds

## External Dependencies

### CDN Resources
- **Google Fonts**: Inter font family for typography
- **Font Awesome**: Version 6.4.0 for iconography and visual elements

### Browser APIs
- **Local Storage**: For client-side email persistence and demo functionality
- **DOM API**: For dynamic content updates and user interaction handling
- **Date API**: For countdown timer calculations and launch date management

### Future Integration Points
- **Email Service**: Backend API endpoint for actual email collection and newsletter management
- **Analytics**: Tracking for conversion rates and user engagement metrics
- **Backend Database**: Persistent storage for email signups and user data