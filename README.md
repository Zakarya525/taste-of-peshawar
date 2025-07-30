# Taste of Peshawar - Restaurant Management System

A modern, high-performance restaurant order management system built with React Native and Supabase, designed specifically for tablet use in restaurant environments.

## 🚀 Features

### Core Functionality

- **Branch-based Authentication**: Secure login for Cardiff and Wembley branches
- **Real-time Order Management**: Live updates across all tablets
- **Menu Management**: Complete menu with categories, search, and filtering
- **Order Creation**: Intuitive cart-based order building
- **Status Tracking**: New → Preparing → Ready workflow
- **Statistics Dashboard**: Real-time order statistics and analytics

### Technical Features

- **TypeScript**: Full type safety throughout the application
- **React Query**: Optimized data fetching and caching
- **Supabase Realtime**: Live updates and notifications
- **Touch-optimized UI**: Designed for tablet use with large touch targets
- **Modern Design**: Clean, professional interface with smooth animations
- **Offline Support**: Graceful handling of network issues

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Run the provided SQL schema in your Supabase project:

```sql
-- Copy and paste the complete schema from the requirements
-- This includes all tables, RLS policies, functions, and initial data
```

### 4. Create Branch Users

After setting up the database, create users through Supabase Auth and link them to branches:

```sql
-- Example: Create a Cardiff branch user
INSERT INTO branch_users (id, branch_id, full_name, role)
VALUES (
    'USER_UUID_FROM_AUTH',
    (SELECT id FROM branches WHERE name = 'Cardiff'),
    'Cardiff Manager',
    'manager'
);
```

### 5. Start Development

```bash
npm start
```

## 📱 Usage

### Login

1. Select your branch (Cardiff or Wembley)
2. Enter your credentials
3. System automatically detects your branch permissions

### Dashboard

- View real-time order statistics
- Filter orders by status (New, Preparing, Ready)
- Quick status updates with one-tap actions
- Pull to refresh for latest data

### Menu

- Browse menu by categories
- Search for specific items
- Add items to cart with quantity controls
- View vegetarian/vegan indicators
- Create orders with table numbers

## 🏗️ Architecture

### Frontend

- **React Native** with Expo
- **TypeScript** for type safety
- **React Query** for data management
- **Expo Router** for navigation
- **Custom UI Components** for consistency

### Backend

- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Real-time subscriptions** for live updates
- **Custom functions** for business logic

### Database Schema

- **Branches**: Cardiff and Wembley locations
- **Menu Items**: Complete menu with categories
- **Orders**: Order management with status tracking
- **Users**: Branch-specific user management
- **Notifications**: Real-time alerts and updates

## 🎨 Design System

### Colors

- Primary: `#3b82f6` (Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Danger: `#ef4444` (Red)
- Neutral: `#64748b` (Gray)

### Components

- **Button**: Multiple variants and sizes
- **Card**: Elevated, outlined, and flat styles
- **Input**: Search and form inputs
- **Status Indicators**: Color-coded order status

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Enable Row Level Security (RLS)
3. Run the provided SQL schema
4. Configure authentication settings
5. Set up real-time subscriptions

### Environment Variables

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 📊 Performance Optimizations

- **React Query**: Intelligent caching and background updates
- **Lazy Loading**: Menu items loaded on demand
- **Debounced Search**: Efficient search with minimal API calls
- **Optimistic Updates**: Immediate UI feedback
- **Connection Handling**: Graceful offline/online transitions

## 🔒 Security

- **Row Level Security**: Branch-specific data isolation
- **Authentication**: Secure user management
- **Input Validation**: Client and server-side validation
- **Error Handling**: Graceful error recovery

## 🚀 Deployment

### Development

```bash
npm start
```

### Production Build

```bash
expo build:android
expo build:ios
```

### EAS Build

```bash
eas build --platform all
```

## 📝 API Documentation

### Orders

- `GET /orders` - Fetch orders for current branch
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order status
- `GET /orders/:id` - Get order details

### Menu

- `GET /menu` - Fetch menu items
- `GET /menu/categories` - Fetch categories
- `GET /menu/search` - Search menu items

### Statistics

- `GET /stats` - Get order statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for Taste of Peshawar restaurant.

## 🆘 Support

For technical support or questions:

- Check the documentation
- Review the code comments
- Contact the development team

---

**Built with ❤️ for Taste of Peshawar**
