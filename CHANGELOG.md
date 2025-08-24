# Sproutify School Changelog

## [Unreleased]
### Added
- Features in development

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