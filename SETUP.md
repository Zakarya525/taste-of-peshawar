# Database Setup Guide

## Required Configuration

To use real database data (no mock data), you must configure Supabase properly:

### 1. Create .env file

Create a `.env` file in the `taste-of-peshawar` directory with your Supabase credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Database Schema Requirements

Your Supabase database must have these tables:

#### branches

- id (uuid, primary key)
- name (enum: 'Cardiff' | 'Wembley')
- address (text)
- phone (text)
- email (text)
- created_at (timestamp)
- updated_at (timestamp)

#### branch_users

- id (uuid, primary key, references auth.users)
- branch_id (uuid, references branches)
- full_name (text)
- role (text)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)

#### menu_categories

- id (uuid, primary key)
- name (text)
- display_order (integer)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)

#### menu_items

- id (uuid, primary key)
- name (text)
- description (text)
- price (numeric)
- category_id (uuid, references menu_categories)
- image_url (text)
- is_available (boolean)
- is_vegetarian (boolean)
- is_vegan (boolean)
- allergens (text[])
- prep_time_minutes (integer)
- display_order (integer)
- created_at (timestamp)
- updated_at (timestamp)

#### orders

- id (uuid, primary key)
- order_number (text)
- branch_id (uuid, references branches)
- table_number (text)
- status (enum: 'New' | 'Preparing' | 'Ready')
- total_amount (numeric)
- notes (text)
- created_by (uuid, references auth.users)
- created_at (timestamp)
- updated_at (timestamp)
- ready_at (timestamp)

#### order_items

- id (uuid, primary key)
- order_id (uuid, references orders)
- menu_item_id (uuid, references menu_items)
- quantity (integer)
- unit_price (numeric)
- total_price (numeric)
- special_instructions (text)
- created_at (timestamp)

### 3. Required Data

You must have at least:

1. One branch record (Cardiff or Wembley)
2. One user account in auth.users
3. One branch_user record linking the user to the branch
4. Menu categories and items

### 4. Authentication Setup

Enable Email/Password authentication in your Supabase project:

1. Go to Authentication > Settings
2. Enable Email confirmations: OFF (for testing)
3. Enable Email change confirmations: OFF (for testing)

### 5. Row Level Security (RLS)

Enable RLS on all tables and create appropriate policies for your use case.

### 6. Test the Setup

1. Start the app: `npm start`
2. Try to log in with a real user account
3. Add items to cart and create an order
4. Check the orders screen to see the created order

## Troubleshooting

### "No valid branch found" error

- Ensure you have branch records in the database
- Check that the user is properly linked to a branch via branch_users table

### "No valid user found" error

- Ensure the user exists in auth.users
- Check that the user has a corresponding branch_users record

### "Supabase configuration missing" error

- Create the .env file with proper Supabase credentials
- Restart the development server after creating .env

### Database connection errors

- Check your Supabase URL and anon key
- Ensure your database is online
- Check network connectivity
