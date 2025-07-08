# Movies & TV Shows Manager - Frontend

A modern React TypeScript application for managing your favorite movies and TV shows with infinite scrolling, search, and responsive design.

## Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Infinite Scrolling**: Seamless browsing experience with lazy loading
- **Search & Filter**: Real-time search and filtering capabilities
- **CRUD Operations**: Add, edit, view, and delete entries
- **Form Validation**: Comprehensive client-side validation
- **Statistics Dashboard**: Overview of your collection with insights
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Toast Notifications**: User-friendly feedback for all actions
- **TypeScript**: Full type safety throughout the application

## Technology Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form management and validation
- **Axios** - HTTP client
- **React Infinite Scroll** - Infinite scrolling component
- **Lucide React** - Beautiful icons

## Pages

### Dashboard
- Collection statistics overview
- Quick action buttons
- Getting started guide

### Entry List
- Infinite scrolling table of all entries
- Search and filter functionality
- Sort by various fields
- Edit and delete actions

### Entry Form
- Add new entries
- Edit existing entries
- Dynamic cast member management
- Comprehensive form validation

## Components

- **Header** - Navigation with active state indicators
- **Toaster** - Global toast notification system
- **Loading States** - Consistent loading indicators
- **Error Handling** - User-friendly error messages

## Installation & Setup

1. Install dependencies:
   ```bash
   yarn
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

The application will open at `http://localhost:3000`

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   └── Toaster.tsx     # Toast notification system
├── pages/              # Page components
│   ├── Dashboard.tsx   # Statistics dashboard
│   ├── EntryList.tsx   # Infinite scrolling table
│   └── EntryForm.tsx   # Add/edit form
├── services/           # API services
│   └── api.ts         # API client and endpoints
├── types/             # TypeScript type definitions
│   └── index.ts       # Shared interfaces
├── App.tsx            # Main app component
├── index.tsx          # App entry point
└── index.css          # Global styles
```

## Key Features

### Infinite Scrolling
- Automatically loads more entries as you scroll
- Smooth performance with large datasets
- Loading indicators and end-of-data messaging

### Search & Filter
- Real-time search across title, director, and genre
- Filter by content type (movies vs TV shows)
- Sort by date, title, year, or rating
- Persistent state during navigation

### Form Management
- Dynamic cast member addition/removal
- Real-time validation with helpful error messages
- Auto-save draft functionality
- Responsive form layout

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interface
- Consistent spacing and typography

## API Integration

The frontend communicates with the backend API using:
- **React Query** for caching and synchronization
- **Axios** for HTTP requests
- **TypeScript interfaces** for type safety
- **Error handling** with user-friendly messages

## Styling

Uses Tailwind CSS for:
- Utility-first styling approach
- Consistent design system
- Responsive breakpoints
- Custom color palette
- Hover and focus states

## Development

### Available Scripts

- `yarn start` - Development server
- `yarn build` - Production build
- `yarn test` - Run tests
- `yarn eject` - Eject from Create React App

### Code Organization

- Components follow React functional patterns
- Hooks for state management
- Custom hooks for API interactions
- TypeScript for type safety
- Consistent naming conventions

## Performance Optimizations

- React Query caching
- Infinite scrolling pagination
- Optimized re-renders
- Code splitting ready
- Image optimization ready

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach
