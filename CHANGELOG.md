# Sproutify School Changelog

## [1.4.0] - 2025-08-24
### Added
- **Enhanced Pest Management System**
  - Comprehensive pest logging interface with dedicated fields for observations, actions, and notes
  - Student pest observation form accessible through kiosk interface
  - Secure Supabase Edge Function (`student-log-pest`) for authenticated student data submission
  - Visual pest report component with bug icons and color-coded urgency indicators
  - Student tower integration allowing pest observation logging from kiosk dashboard
  - Action cards for students to easily access pest logging functionality

### Enhanced
- **Improved Pest Logging Workflow**
  - Upgraded PestsTab interface with separate textarea fields for detailed logging
  - Better placeholder text and educational examples (e.g., "Aphids on row 2", "Released ladybugs")
  - Enhanced pest history display with improved typography and visual hierarchy
  - Color-coded pest reports with left border styling and proper spacing
  - Loading states and skeleton placeholders for better user experience

- **Student Engagement Features**
  - Integrated pest observation capabilities into student tower detail views
  - Comprehensive pest history accessible to students for educational purposes
  - Seamless navigation between pest logging and dashboard views
  - Educational messaging encouraging proper teacher supervision

- **Teacher Dashboard Experience**
  - Enhanced pest management within tower detail tabs
  - Improved pest log history with better date formatting and data organization
  - Professional error handling and success notifications for pest logging
  - Consistent design language throughout pest management interface

### Technical Details
- Added `StudentPestForm` component with comprehensive validation and error handling
- Implemented secure server-side pest logging with ownership verification
- Enhanced `PestReport` component with visual improvements and bug icons
- Upgraded database queries with proper error handling and loading states
- Added CORS support for cross-origin pest data submission
- Improved TypeScript types for pest log data structures
- Added proper routing for student pest observation workflows

### Security & Data Protection
- Server-side tower ownership verification before allowing pest data submission
- Secure authentication flow for student pest logging through Edge Functions
- Proper data validation and sanitization for all pest log inputs
- Educational data protection with appropriate access controls

## [Unreleased]
### Enhanced
- **Improved Sidebar Navigation**
  - Added proper hover effects for sidebar menu items with smooth color transitions
  - Enhanced active state highlighting using built-in sidebar accent colors
  - Added logo placeholder area at top of sidebar for Sproutify School branding
  - Improved navigation with tooltips showing item names when sidebar is collapsed
  - Better active route detection using React Router location for accurate highlighting
  - Professional visual feedback throughout navigation interaction

### Technical Details
- Updated `AppSidebar` component to use shadcn/ui sidebar's built-in `isActive` prop
- Replaced custom `getNavCls` function with proper active state detection
- Added `SidebarHeader` component with logo placeholder and branding area
- Implemented `useLocation` hook for accurate route matching
- Enhanced collapsed state with meaningful tooltips for all navigation items

## [1.3.0] - 2025-08-24
### Added
- **Harvest Dashboard & Student Engagement System**
  - Teacher harvest dashboard widget on main dashboard showing priority harvest schedule
  - Student harvest calendar on kiosk dashboard with class-wide harvest visibility
  - Tower-specific harvest schedules for focused student engagement
  - Smart harvest status alerts: overdue, ready today, coming soon, and upcoming
  - Priority-based harvest organization with color-coded urgency indicators
  - Direct action buttons for students to help with harvest activities
  - Educational messaging encouraging teacher guidance before harvesting

- **Enhanced Plant Catalog Integration**
  - Fixed critical `catalog_id` relationship bug in plant-to-tower addition
  - Auto-calculation of expected harvest dates based on seeding date and catalog harvest days
  - Improved plant catalog workflow with proper database relationships
  - Port number support for precise plant location tracking

### Enhanced
- **Teacher Dashboard Experience**
  - Centralized harvest overview across all classroom towers
  - Urgent harvest alerts with overdue plant notifications
  - Coming week harvest preview for lesson planning
  - Direct links to tower management for quick access
  - Visual priority indicators (red=urgent, yellow=soon, blue=upcoming)

- **Student Kiosk Experience**
  - Engaging harvest calendar with emoji indicators and student-friendly language
  - "What Can We Harvest?" section highlighting ready plants
  - Tower-specific harvest information for focused activities
  - Gamified interface encouraging student participation in harvest activities
  - Clear educational guidance about asking teachers before harvesting

- **Tower Plant Management**
  - Enhanced PlantsTab with rich plant information display
  - Catalog relationship indicators (global vs custom plants)
  - Harvest status cards with visual alert system
  - Improved plant metadata display including categories and descriptions
  - Better plant lifecycle tracking with expected harvest prominence

### Technical Details
- Enhanced teacher dashboard (`src/pages/dashboard/Home.tsx`) with integrated harvest widget
- Added comprehensive student harvest widgets to kiosk dashboard and tower detail pages
- Implemented harvest status calculation algorithm with day-based priority grouping
- Fixed plant catalog integration ensuring proper `catalog_id` foreign key relationships
- Added auto-calculation of `expected_harvest_date` based on catalog `harvest_days`
- Improved database queries with proper joins to plant catalog table
- Enhanced student interface with engaging visual indicators and actionable harvest information

### Bug Fixes
- **Critical Plant Catalog Bug**: Fixed missing `catalog_id` when adding plants from catalog to towers
- Resolved plant catalog metadata not being preserved in tower plantings
- Fixed expected harvest date auto-calculation from catalog plant data

## [1.2.0] - 2025-08-24
### Added
- **Complete Password Management System**
  - Account Settings page (`/app/settings`) with secure password change functionality
  - Current password verification before allowing password updates
  - Password reset via email using secure token-based authentication
  - "Forgot Password?" functionality integrated into login page
  - Password reset confirmation page with session validation
  - Account information display showing current email address
  - Security tips and guidance for teachers

### Enhanced
- **Improved Authentication Security**
  - Enhanced login page with integrated password recovery options
  - Secure password validation (minimum length, confirmation matching)
  - Professional user experience matching educational software standards
  - Mobile-responsive design for classroom tablets and devices

### Navigation & UX
- **New Settings Navigation**
  - Added Settings menu item to main application sidebar
  - Clean separation between Profile (educational info) and Settings (security)
  - Intuitive placement of account management features
  - Consistent design language throughout password management flow

### Technical Details
- Implemented secure password change using `supabase.auth.updateUser()`
- Added password reset flow using `supabase.auth.resetPasswordForEmail()`
- Session validation for password reset links with URL parameter handling
- Proper error handling and user feedback throughout authentication flows
- Added new routes: `/auth/reset-password` and `/app/settings`
- Enhanced `AppSidebar` component with Settings navigation
- Full TypeScript implementation with proper type safety

### Security Features
- Current password verification before updates (prevents unauthorized changes)
- Secure email-based password reset with expiring tokens
- Proper data validation and sanitization throughout password flows
- Professional security messaging and user guidance

## [1.1.1] - 2025-08-23
### Added
- **Color-Based Vitals Input System**
  - Color picker buttons for pH and EC measurements
  - Interactive color selection dialogs with educational descriptions
  - Support for test strip color matching alongside numeric input
  - Student-friendly interface for easier data logging
  - Educational guidance for each color range and plant health impact

### Enhanced
- Vitals logging now supports both numeric input and color-based selection
- Improved accessibility for students using test strips instead of digital meters
- Better user experience for both teachers and students in kiosk mode
- Educational value added with color range explanations and plant health tips

### Technical Details
- Enhanced `ColorNumberInput` component with dialog-based color picker
- pH color mapping: Red (4.5) to Purple (7.2) with ideal range at Yellow-Green (5.5)
- EC color mapping: Clear (0.5) to Purple (2.8) with ideal range at Blue (1.6)
- Maintains backward compatibility with existing numeric input functionality

## [1.1.0] - 2025-08-23
### Added
- **Enhanced Plant Catalog System**
  - Global plant catalog with curated plant varieties
  - Classroom-specific plant catalog management
  - Custom plant creation and editing for teachers
  - Plant activation/deactivation controls for classroom visibility
  - Advanced plant statistics and analytics dashboard
  - Search and filtering capabilities for plant discovery
  - Improved navigation between catalog, global, and management pages

- **Technical Improvements**
  - React Query integration for optimized data fetching and caching
  - Custom Supabase RPC functions for efficient plant catalog queries
  - Enhanced TypeScript types for better development experience
  - Improved error handling and user feedback throughout catalog system

### Enhanced
- Plant selection workflow now uses centralized catalog system
- Students can only select from teacher-activated plants
- Plant data consistency across all tower management features
- Better performance with background data synchronization

### Technical Details
- Added `is_active` field to `plant_catalog` table for visibility control
- Implemented `get_global_plants_with_status()` RPC function
- Implemented `get_classroom_catalog()` RPC function  
- Implemented `get_active_classroom_plants()` RPC function
- Added `add_global_plant_to_classroom()` RPC function
- Added `toggle_classroom_plant_active()` RPC function
- Added `remove_plant_from_classroom()` RPC function

## [1.0.0] - 2025-08-23  
### Added
- Initial release with hydroponic tower tracking
- pH and EC vitals monitoring with color-coded ranges
- Plant lifecycle management from seed to harvest
- Harvest and waste weight logging
- Pest observation and management system
- Photo gallery with student photo credits
- Kiosk mode for student participation
- Gamified leaderboard system