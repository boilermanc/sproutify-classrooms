# Sproutify Classrooms 🌱

A comprehensive web application designed for educators to manage classroom hydroponic tower gardens. Sproutify Classrooms helps teachers track plant growth, monitor environmental data, engage students through gamified learning, and manage multi-level educational programs from individual classrooms to entire school districts.

---

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [User Roles & Permissions](#user-roles--permissions)
- [Subscription Plans](#subscription-plans)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Supabase Setup](#supabase-setup)
  - [Stripe Setup](#stripe-setup)
  - [Local Installation](#local-installation)
- [Deployment](#deployment)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [Future Roadmap](#future-roadmap)

---

## About The Project

Sproutify Classrooms addresses the need for a comprehensive, scalable tool for educators using hydroponic towers in their classrooms. It replaces scattered spreadsheets and notebooks with a centralized, user-friendly dashboard that supports everything from individual classroom management to district-wide implementations.

The application features role-based access control, allowing teachers, school administrators, and district administrators to manage their respective scopes while maintaining data security and privacy. Students can securely access the system through kiosk mode using name-based login with classroom PINs.

## Key Features

### 🌱 **Tower Management**
- Add and manage multiple hydroponic towers per classroom
- Track tower locations, setup dates, and configurations
- Monitor tower health and performance metrics

### 📊 **Environmental Monitoring**
- **Vitals Tracking:** Log and monitor essential water quality metrics (pH, EC) with color-coded inputs for instant feedback on optimal ranges
- **Real-time Alerts:** Get notified when environmental parameters fall outside optimal ranges
- **Historical Data:** View trends and patterns in environmental data over time

### 🌿 **Plant Lifecycle Management**
- **Plant Logging:** Track each plant's journey from seed to harvest, including dates, quantities, and port numbers
- **Plant Catalog:** Browse extensive database of plants with growing requirements and educational information
- **Pest Management:** Keep detailed logs of pest observations and treatment actions

### 📈 **Harvest & Analytics**
- **Harvest Logging:** Record weight, destination, and quality of all harvests
- **Waste Tracking:** Log plant waste and disposal methods for comprehensive yield analysis
- **Performance Analytics:** Generate reports on tower productivity and student engagement

### 👥 **Student Engagement**
- **Kiosk Mode:** Secure student access through name-based login with classroom PINs
- **Photo Documentation:** Students can upload photos of tower progress with automatic crediting
- **Gamified Learning:** Leaderboards and achievement systems to motivate student participation
- **Activity Tracking:** Monitor which students have participated and track their engagement over time

### 🏫 **Multi-Level Administration**
- **Classroom Management:** Teachers manage their own classrooms and student rosters
- **School Administration:** School admins oversee multiple classrooms within their school
- **District Administration:** District admins manage multiple schools and district-wide programs

### 🔐 **Security & Privacy**
- **Row Level Security (RLS):** Ensures data privacy and access control at the database level
- **Role-Based Access:** Granular permissions based on user roles and organizational hierarchy
- **Student Privacy:** Secure handling of student data with appropriate access controls

## User Roles & Permissions

### 👨‍🏫 **Teacher**
- Manage personal classrooms and student rosters
- Track tower vitals, harvests, and plant data
- Access educational resources and plant catalog
- View student engagement analytics

### 🏢 **School Administrator**
- Oversee multiple classrooms within their school
- Access school-wide analytics and reporting
- Manage teacher accounts and permissions
- Coordinate school-wide programs

### 🏛️ **District Administrator**
- Manage multiple schools within the district
- Access district-wide analytics and reporting
- Oversee district-wide implementations
- Manage school administrator accounts

### 👨‍🎓 **Student (Kiosk Mode)**
- Log in using name and classroom PIN
- Upload photos of tower progress
- View their participation history
- Access educational content

## Subscription Plans

### 💚 **Basic Plan - $9.99/month**
- Up to 3 aeroponic towers
- 50 student accounts
- Basic curriculum modules
- Student progress tracking
- Email support

### ⭐ **Professional Plan - $19.99/month** (Most Popular)
- Up to 10 aeroponic towers
- 200 student accounts
- Complete curriculum library
- Advanced analytics & reporting
- Teacher collaboration tools
- Priority email support

### 🏫 **School Plan - $39.99/month**
- Unlimited aeroponic towers
- Unlimited student accounts
- Custom curriculum development
- District-wide reporting
- Administrator dashboard
- Dedicated account manager

*All plans include a 14-day free trial and annual billing discounts.*

## Tech Stack

This project is built with a modern, robust, and scalable technology stack:

### **Frontend**
- **Framework:** [React](https://reactjs.org/) 18 with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/) for fast development and optimized builds
- **UI Framework:** [shadcn/ui](https://ui.shadcn.com/) with [Radix UI](https://www.radix-ui.com/) primitives
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Routing:** [React Router](https://reactrouter.com/) for client-side navigation
- **State Management:** React Context with custom hooks

### **Backend & Database**
- **Backend:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Authentication:** Supabase Auth with role-based access control
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Storage:** Supabase Storage for images (avatars, school logos, tower photos)
- **Real-time:** Supabase real-time subscriptions

### **Payments & Subscriptions**
- **Payment Processing:** [Stripe](https://stripe.com/) for subscription management
- **Webhooks:** Stripe webhooks for subscription status updates

### **Development & Deployment**
- **Package Manager:** npm
- **Linting:** ESLint with TypeScript support
- **Deployment:** PowerShell scripts for automated deployment to production and test environments
- **CI/CD:** GitHub Actions for automated builds and deployments

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- A free [Supabase](https://supabase.com/) account
- A [Stripe](https://stripe.com/) account for payment processing

### Supabase Setup

1. **Create a New Project:** Go to your Supabase dashboard and create a new project.

2. **Get API Keys:** Navigate to `Project Settings` > `API`. You will need:
   - **Project URL**
   - **`anon` (public) key**
   - **`service_role` key** (for server-side operations)

3. **Run Database Migrations:** Navigate to the `SQL Editor` in your Supabase dashboard and run the migrations from the `supabase/migrations/` directory in order.

4. **Create Storage Buckets:** Navigate to the `Storage` section and create the following public buckets:
   - `avatars`
   - `school-logos`
   - `tower-photos`

5. **Configure Authentication:** Set up email authentication and configure any additional auth providers as needed.

### Stripe Setup

1. **Create Stripe Account:** Sign up for a Stripe account at [stripe.com](https://stripe.com/)

2. **Get API Keys:** From your Stripe dashboard, get:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)
   - **Webhook signing secret**

3. **Create Products and Prices:** Set up your subscription products and pricing in the Stripe dashboard

4. **Configure Webhooks:** Set up webhook endpoints to handle subscription events

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/sproutify-classrooms.git
   cd sproutify-classrooms
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:** Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL="your_supabase_project_url"
   VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
   
   # Stripe Configuration
   VITE_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
   
   # Feature Flags (optional)
   VITE_FEATURE_GARDEN_NETWORK="true"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Your application should now be running on `http://localhost:5173`.

---

## Deployment

The application includes automated deployment scripts for both test and production environments.

### Available Scripts

```bash
# Deploy to test environment
npm run deploy:test

# Deploy to production environment
npm run deploy:prod
```

### Manual Deployment

You can also use the PowerShell deployment script directly:

```powershell
# Deploy to test environment
powershell -NoProfile -ExecutionPolicy Bypass -File ./deploy_school.ps1 test

# Deploy to production environment
powershell -NoProfile -ExecutionPolicy Bypass -File ./deploy_school.ps1 prod

# Auto-deploy (main branch -> prod, others -> test)
powershell -NoProfile -ExecutionPolicy Bypass -File ./deploy_school.ps1 auto
```

### Deployment Targets

- **Test Environment:** `http://100.96.83.5:8081/`
- **Production Environment:** `https://school.sproutify.app/`

### GitHub Actions

The project includes GitHub Actions workflows for automated deployment:
- **Production:** Automatically deploys when code is pushed to the `main` branch
- **Manual:** Supports manual workflow dispatch for on-demand deployments

---

## Database Schema

The application uses PostgreSQL with Supabase, featuring:

### Core Tables
- **`profiles`** - User profiles and school information
- **`classrooms`** - Classroom management and kiosk PINs
- **`students`** - Student rosters with login tracking
- **`towers`** - Hydroponic tower information
- **`plantings`** - Plant lifecycle tracking
- **`harvests`** - Harvest records and yields
- **`waste_logs`** - Waste tracking and disposal
- **`vitals_logs`** - Environmental data (pH, EC, etc.)
- **`pest_logs`** - Pest observations and treatments

### Administrative Tables
- **`schools`** - School information and join codes
- **`districts`** - District information and management
- **`user_roles`** - Role-based access control
- **`subscriptions`** - Stripe subscription management

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- **Role-based policies** for data access control
- **Audit trails** for sensitive operations

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components (AppLayout, etc.)
│   ├── dashboard/      # Dashboard-specific components
│   ├── scouting/       # Pest scouting components
│   ├── towers/         # Tower management components
│   └── ...
├── pages/              # Page components and routing
│   ├── auth/          # Authentication pages
│   ├── classrooms/    # Classroom management
│   ├── district/      # District admin pages
│   ├── school/        # School admin pages
│   ├── kiosk/         # Student kiosk interface
│   ├── towers/        # Tower management pages
│   ├── catalog/        # Plant catalog
│   └── ...
├── context/           # React Context providers
├── hooks/             # Custom React hooks
├── integrations/      # Third-party integrations
│   └── supabase/     # Supabase client and types
├── lib/              # Utility functions and helpers
├── services/         # API services and business logic
└── utils/            # General utility functions
```

### Key Components

- **`AppSidebar`** - Main navigation with role-based menu items
- **`RoleBasedRedirect`** - Automatic redirection based on user roles
- **`SubscriptionGuard`** - Feature access control based on subscription plans
- **`EducationalPackageContext`** - Curriculum and feature management
- **`WelcomeModal`** - Onboarding experience for new users

---

## API Endpoints

### Supabase Functions
- **`create_teacher_account`** - Automated teacher account creation
- **`create-checkout-session`** - Stripe checkout session creation
- **`stripe-webhook`** - Stripe webhook handling
- **`student-log-*`** - Student activity logging functions

### External APIs
- **Stripe API** - Payment processing and subscription management
- **MailerLite API** - Email marketing and newsletter management

---

## Contributing

We welcome contributions to Sproutify Classrooms! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Follow the existing TypeScript and React patterns
- Use ESLint for code quality
- Write meaningful commit messages
- Add comments for complex logic

### Testing
- Test your changes thoroughly
- Ensure all existing functionality still works
- Test with different user roles and subscription plans

---

## Future Roadmap

### 🚀 **Short Term (Next 3 months)**
- [ ] **Enhanced Student Analytics** - Detailed engagement metrics and participation reports
- [ ] **Bulk Student Import** - CSV import functionality for student rosters
- [ ] **Real Leaderboard Data** - Replace mock data with real aggregated statistics
- [ ] **Data Visualization** - Charts and graphs for environmental and harvest trends

### 🎯 **Medium Term (3-6 months)**
- [ ] **Parent/Guardian Access** - Read-only access for parents to view child's progress
- [ ] **Advanced Notifications** - Smart alerts for harvest timing and environmental issues
- [ ] **Mobile App** - Companion mobile apps for easier kiosk access
- [ ] **API Documentation** - Comprehensive API documentation for integrations

### 🌟 **Long Term (6+ months)**
- [ ] **Multi-Language Support** - Internationalization for diverse classroom environments
- [ ] **AI-Powered Insights** - Machine learning for growth predictions and recommendations
- [ ] **Integration Ecosystem** - Connect with popular educational platforms
- [ ] **Advanced Reporting** - Custom report builder for administrators

### 🔧 **Technical Improvements**
- [ ] **Performance Optimization** - Code splitting and lazy loading
- [ ] **Offline Support** - Progressive Web App capabilities
- [ ] **Advanced Security** - Enhanced audit logging and security features
- [ ] **Scalability** - Database optimization and caching strategies

---

## Support

- **Documentation:** Check the Help Center within the application
- **Email Support:** Available for all subscription plans
- **Community:** Join our educator community for tips and best practices

---

## License

This project is proprietary software. All rights reserved.

---

*Built with ❤️ for educators and students passionate about sustainable agriculture and hands-on learning.*