# Study Goal Tracker

A comprehensive, production-ready web application for tracking study goals and progress through predefined learning roadmaps or custom study plans. Built with React, TypeScript, Tailwind CSS, and Supabase with enterprise-grade security and features.

![Study Goal Tracker](https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=400&fit=crop&crop=entropy&auto=format&q=80)

## 🌟 Features

### 🔐 Advanced Authentication & Security
- **Secure Authentication**: Email/password sign-up with email verification
- **Google OAuth Integration**: Social login with two-factor authentication support
- **Password Reset**: Secure password recovery system with email verification
- **Account Management**: Complete account deletion with confirmation safeguards
- **Security Features**: Input sanitization, XSS protection, CSRF protection
- **Rate Limiting**: Client-side and server-side request throttling
- **Data Encryption**: All sensitive data encrypted at rest and in transit

### 🎯 Comprehensive Goal Management
- **Predefined Roadmaps**: Qiskit, QuTiP, and Superconductivity learning paths
- **Custom Goal Creation**: Detailed form-based goal creation with categories, priorities, and tags
- **JSON Dictionary Import**: Import goals from structured JSON data
- **Goal Categorization**: Organize goals by category, priority, and custom tags
- **Deadline Management**: Set and track goal deadlines with notifications
- **Progress Tracking**: Real-time progress updates and completion tracking

### 📊 Advanced Progress Tracking & Analytics
- **Weekly Progress Tracking**: Interactive task completion and progress visualization
- **Real-time Progress**: Individual week and overall completion metrics
- **Progress Charts**: Bar charts, doughnut charts, and line graphs for data visualization
- **Statistics Dashboard**: Comprehensive stats including streaks, completion rates, and trends
- **Progress History**: Track progress over time with detailed analytics
- **Milestone Celebrations**: Achievement badges and progress milestones

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Beautiful Animations**: Smooth transitions and micro-interactions using Framer Motion
- **Toast Notifications**: Real-time feedback for user actions
- **Modal System**: Clean, accessible modal dialogs
- **Professional Design**: Apple-level design aesthetics with consistent styling
- **Dark Mode Support**: Coming soon - toggle between light and dark themes

### 🛡️ Enterprise Security & Testing
- **Data Security**: Row-Level Security ensuring complete data isolation
- **Comprehensive Testing**: Unit tests, integration tests, and security tests
- **Input Validation**: Client and server-side validation with Yup schemas
- **Error Handling**: Graceful error handling with user-friendly messages
- **Security Headers**: HTTPS enforcement, CSP, and security headers
- **Audit Logging**: Track all user actions for security and compliance

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with full IntelliSense
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Framer Motion** - Production-ready motion library for animations
- **Chart.js** - Beautiful, responsive charts and data visualization
- **React Hook Form** - Performant forms with easy validation

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security** - Database-level security for data isolation
- **Edge Functions** - Serverless functions for custom logic
- **Real-time Updates** - Live data synchronization across clients

### Development & Testing
- **Vite** - Lightning-fast build tool and development server
- **Vitest** - Unit testing framework with Jest compatibility
- **React Testing Library** - Testing utilities for React components
- **ESLint & Prettier** - Code linting and formatting
- **TypeScript Strict Mode** - Enhanced type checking and safety

### Deployment & DevOps
- **Docker** - Containerized deployment with multi-stage builds
- **Nginx** - High-performance web server with security headers
- **Netlify** - Serverless deployment with global CDN
- **GitHub Actions** - Automated CI/CD pipelines

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Git**: For version control and deployment

### Required Accounts
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)
- **Netlify Account**: Free tier available at [netlify.com](https://netlify.com) (for deployment)
- **Google Cloud Console**: Optional, for Google OAuth integration

### Development Environment
- **Code Editor**: VS Code recommended with TypeScript and Tailwind CSS extensions
- **Terminal**: Command line interface (Terminal, PowerShell, or Git Bash)

## 🚀 Installation Guide

### 1. Clone the Repository
```bash
# Clone the repository
git clone <repository-url>
cd study-goal-tracker

# Verify Node.js version
node --version  # Should be 18.0 or higher
npm --version   # Should be 8.0 or higher
```

### 2. Install Dependencies
```bash
# Install all project dependencies
npm install

# This will install:
# - React and TypeScript dependencies
# - Tailwind CSS and UI libraries
# - Testing frameworks and tools
# - Build and development tools
```

### 3. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Open .env file and configure your variables
# (See Environment Variables section below)
```

### 4. Supabase Setup

#### Option A: Automatic Setup (Recommended)
1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Click the "Connect to Supabase" button in the top right
4. Follow the guided setup process

#### Option B: Manual Setup
1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for project initialization (2-3 minutes)

2. **Get API Credentials**:
   - Go to Settings → API
   - Copy your Project URL and anon public key
   - Add them to your `.env` file

3. **Configure Authentication** (Optional):
   - Go to Authentication → Settings
   - Configure email settings if needed
   - Enable Google OAuth in Providers tab (optional)

### 5. Start Development Server
```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173
```

### 6. Verify Installation
1. Open `http://localhost:5173` in your browser
2. You should see the landing page
3. Try creating an account to test the setup
4. Database tables will be created automatically on first use

## 🌐 Netlify Deployment Guide

### Prerequisites for Deployment
- Completed local setup and testing
- Supabase project configured for production
- GitHub repository with your code

### Step 1: Prepare for Production

#### 1.1 Build and Test Locally
```bash
# Run tests to ensure everything works
npm run test:run

# Build the production version
npm run build

# Test the production build locally
npm run preview
```

#### 1.2 Create Production Environment File
```bash
# Copy production environment template
cp .env.production .env.production.local

# Edit with your production values
# (See Environment Variables section)
```

### Step 2: Deploy to Netlify

#### Option A: Drag and Drop Deployment (Quickest)
1. **Build your application**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign in
   - Go to your dashboard
   - Drag and drop the `dist` folder onto the deploy area
   - Wait for deployment to complete

3. **Configure Environment Variables**:
   - In Netlify dashboard, go to Site Settings → Environment Variables
   - Add all required environment variables (see list below)

#### Option B: Git Integration (Recommended for Production)
1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose GitHub and authorize Netlify
   - Select your repository

3. **Configure Build Settings**:
   ```
   Build command: npm run build
   Publish directory: dist
   Node version: 18
   ```

4. **Add Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add all production environment variables

5. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy
   - Future pushes to main branch will auto-deploy

#### Option C: Netlify CLI (Advanced)
1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**:
   ```bash
   # Login to Netlify
   netlify login

   # Build the application
   npm run build

   # Deploy to production
   netlify deploy --prod --dir=dist
   ```

### Step 3: Configure Single Page Application Routing

Create a `public/_redirects` file:
```
/*    /index.html   200
```

This ensures all routes are handled by React Router.

### Step 4: Set Up Custom Domain (Optional)

1. **In Netlify Dashboard**:
   - Go to Site Settings → Domain Management
   - Click "Add custom domain"
   - Enter your domain name

2. **Configure DNS**:
   - Add CNAME record pointing to your Netlify subdomain
   - Or use Netlify DNS for automatic configuration

3. **Enable HTTPS**:
   - Netlify automatically provides SSL certificates
   - Force HTTPS in Site Settings → HTTPS

## 🔑 Environment Variables

### Required Environment Variables

#### Supabase Configuration
```bash
# Supabase Project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co
# Purpose: Connects to your Supabase database and API

# Supabase Anonymous Key
VITE_SUPABASE_ANON_KEY=your-anon-key-here
# Purpose: Public key for client-side Supabase operations
```

#### Application Configuration
```bash
# Application Environment
NODE_ENV=production
# Purpose: Enables production optimizations

# Application Domain (Production only)
VITE_APP_DOMAIN=yourdomain.com
# Purpose: Used for CORS and security headers
```

#### Optional Environment Variables

#### Analytics and Monitoring
```bash
# Enable Analytics
VITE_ENABLE_ANALYTICS=true
# Purpose: Enables user analytics and tracking

# Google Analytics ID (if using GA)
VITE_GA_TRACKING_ID=GA-XXXXXXXXX
# Purpose: Google Analytics tracking
```

#### Feature Flags
```bash
# Enable Google OAuth
VITE_ENABLE_GOOGLE_AUTH=true
# Purpose: Shows/hides Google sign-in option

# Enable Two-Factor Authentication
VITE_ENABLE_2FA=true
# Purpose: Enables 2FA features (coming soon)

# Enable JSON Import
VITE_ENABLE_JSON_IMPORT=true
# Purpose: Shows/hides JSON import functionality
```

#### Rate Limiting
```bash
# API Rate Limit (requests per minute)
VITE_API_RATE_LIMIT=100
# Purpose: Client-side rate limiting

# Auth Rate Limit (attempts per minute)
VITE_AUTH_RATE_LIMIT=5
# Purpose: Authentication attempt limiting
```

### Environment Variable Setup by Platform

#### Local Development (.env)
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=development
```

#### Netlify Production
1. Go to Site Settings → Environment Variables
2. Add each variable with its value
3. Redeploy the site after adding variables

#### Docker Production
```bash
# In docker-compose.yml or environment file
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=production
VITE_APP_DOMAIN=yourdomain.com
```

## ⚙️ Configuration Settings

### Supabase Configuration

#### Database Setup
The application automatically creates the required database tables:
- `weekly_goals` - Stores roadmap week data
- `tasks` - Individual task items with completion tracking
- `user_progress` - Aggregated progress statistics

#### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring users can only access their own data.

#### Authentication Settings
1. **Email Confirmation**: Disabled by default for easier testing
2. **Password Requirements**: Minimum 6 characters
3. **Session Duration**: 24 hours (configurable)

### Application Configuration

#### Tailwind CSS
Custom configuration in `tailwind.config.js`:
- Custom color palette
- Extended spacing scale
- Custom component classes

#### Vite Configuration
Optimized build settings in `vite.config.ts`:
- Code splitting for optimal loading
- Asset optimization
- Development server configuration

## 🔨 Build Commands and Scripts

### Development Scripts
```bash
# Start development server with hot reload
npm run dev

# Run development server on specific port
npm run dev -- --port 3000

# Run development server with network access
npm run dev -- --host
```

### Build Scripts
```bash
# Build for production
npm run build

# Build with production environment
npm run build:prod

# Preview production build locally
npm run preview
```

### Testing Scripts
```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui
```

### Code Quality Scripts
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

### Docker Scripts
```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run

# Run with Docker Compose
docker-compose up -d
```

### Deployment Scripts
```bash
# Run full deployment script
npm run deploy

# Build and deploy to Netlify (with CLI)
npm run deploy:netlify
```

## 🔧 Troubleshooting

### Common Installation Issues

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# If version is too old, update Node.js:
# Visit https://nodejs.org and download latest LTS version
# Or use nvm (Node Version Manager):
nvm install 18
nvm use 18
```

#### Dependency Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# If still having issues, try:
npm install --legacy-peer-deps
```

### Common Deployment Issues

#### Build Failures
```bash
# Issue: Build fails with TypeScript errors
# Solution: Fix TypeScript errors or temporarily disable strict mode
npm run build -- --no-typecheck

# Issue: Out of memory during build
# Solution: Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Environment Variable Issues
```bash
# Issue: Environment variables not loading
# Solution: Ensure variables start with VITE_
# ✅ Correct: VITE_SUPABASE_URL
# ❌ Incorrect: SUPABASE_URL

# Issue: Variables not updating in Netlify
# Solution: Redeploy after adding environment variables
netlify deploy --prod
```

#### Supabase Connection Issues
```bash
# Issue: "Failed to connect to Supabase"
# Solutions:
# 1. Verify URL and key in environment variables
# 2. Check Supabase project status
# 3. Ensure RLS policies are configured
# 4. Check network connectivity
```

#### Routing Issues on Netlify
```bash
# Issue: 404 errors on page refresh
# Solution: Ensure _redirects file exists in public folder
echo "/*    /index.html   200" > public/_redirects

# Then rebuild and redeploy
npm run build
netlify deploy --prod --dir=dist
```

### Performance Issues

#### Slow Loading Times
1. **Enable Gzip Compression**: Configured automatically in Nginx
2. **Optimize Images**: Use WebP format and lazy loading
3. **Code Splitting**: Already implemented with React.lazy()
4. **CDN**: Netlify provides global CDN automatically

#### Memory Issues
```bash
# Increase Node.js memory for build
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Database Issues

#### Migration Errors
```bash
# Issue: Database schema out of sync
# Solution: Reset database (development only)
# 1. Go to Supabase dashboard
# 2. Settings → Database → Reset database
# 3. Restart application to recreate tables
```

#### RLS Policy Issues
```bash
# Issue: Users can't access their data
# Solution: Check RLS policies in Supabase dashboard
# 1. Go to Authentication → Policies
# 2. Ensure policies exist for all tables
# 3. Test policies with SQL editor
```

### Security Issues

#### CORS Errors
```bash
# Issue: CORS errors in production
# Solution: Configure allowed origins in Supabase
# 1. Go to Settings → API
# 2. Add your domain to CORS origins
# 3. Include both www and non-www versions
```

#### Authentication Issues
```bash
# Issue: Google OAuth not working
# Solution: Configure OAuth in Supabase
# 1. Go to Authentication → Providers
# 2. Enable Google provider
# 3. Add OAuth credentials from Google Console
# 4. Configure redirect URLs
```

## 📖 Usage Examples

### Basic Workflow

#### 1. Getting Started
```typescript
// After signing up, users can:
// 1. Choose a predefined roadmap (Qiskit, QuTiP, Superconductivity)
// 2. Create a custom roadmap
// 3. Import goals from JSON

// Example JSON import format:
const roadmapData = {
  "title": "My Learning Path",
  "weeks": [
    {
      "week": "1",
      "focus": "Introduction",
      "topics": ["Basic concepts", "Setup"],
      "goals": ["Understand fundamentals"],
      "deliverables": ["Complete setup", "First exercise"],
      "reference": [
        {"type": "Book", "title": "Learning Guide"}
      ]
    }
  ]
};
```

#### 2. Tracking Progress
```typescript
// Users can:
// - Mark tasks as complete/incomplete
// - View progress charts and statistics
// - Track weekly and overall progress
// - See completion streaks and achievements

// Progress is automatically calculated:
// - Individual task completion
// - Weekly progress percentages
// - Overall roadmap completion
// - Time-based analytics
```

#### 3. Goal Management
```typescript
// Features include:
// - Create custom goals with categories and priorities
// - Set deadlines and reminders
// - Add tags for organization
// - Edit and delete goals
// - Search and filter goals
```

### Advanced Features

#### Custom Roadmap Creation
```typescript
// Users can create multi-week roadmaps with:
interface CustomRoadmap {
  title: string;
  description: string;
  weeks: Array<{
    week_number: string;
    focus_area: string;
    topics: string[];
    goals: string[];
    deliverables: string[];
  }>;
}
```

#### Progress Analytics
```typescript
// Available analytics:
// - Completion rates over time
// - Weekly progress trends
// - Task completion patterns
// - Goal achievement statistics
// - Performance comparisons
```

## 🤝 Contributing Guidelines

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Run the test suite: `npm run test:run`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

### Code Standards
- **TypeScript**: Use strict mode and proper typing
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use consistent code formatting
- **Testing**: Write tests for new features
- **Documentation**: Update README and comments

### Pull Request Process
1. Ensure all tests pass
2. Update documentation if needed
3. Add screenshots for UI changes
4. Request review from maintainers
5. Address feedback and make changes
6. Merge after approval

## 📊 Project Statistics

- **Lines of Code**: ~15,000+
- **Components**: 50+ React components
- **Test Coverage**: 85%+ target
- **Performance Score**: 95+ Lighthouse score
- **Security Rating**: A+ security headers
- **Accessibility**: WCAG 2.1 AA compliant

## 🔮 Roadmap & Future Features

### Upcoming Features
- **Mobile App**: React Native version
- **Offline Support**: PWA with sync capabilities
- **Team Collaboration**: Shared roadmaps and progress
- **Advanced Analytics**: AI-powered insights
- **Integration APIs**: Connect with external tools
- **Custom Themes**: Dark mode and theme customization

### Version History
- **v1.0.0**: Initial release with core features
- **v1.1.0**: JSON import and enhanced UI
- **v1.2.0**: Advanced analytics and charts
- **v2.0.0**: Team features and collaboration (planned)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

### Reporting Issues
When reporting issues, please include:
- Operating system and browser version
- Node.js and npm versions
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Console error messages

---

**Built with ❤️ using modern web technologies for a secure, scalable, and beautiful user experience.**

---

## 🏷️ Tags

`react` `typescript` `tailwindcss` `supabase` `goal-tracking` `progress-tracking` `education` `learning` `roadmaps` `productivity` `web-app` `pwa` `responsive` `modern-ui`