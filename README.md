# E-commerce Website

A modern, responsive e-commerce platform built with React, Vite, Tailwind CSS, and Supabase.

## Features

✅ **Dynamic Product Management**
- Database-driven product catalog
- Admin dashboard for CRUD operations
- Image upload functionality
- Category management

✅ **Advanced Filtering & Search**
- Real-time search across products
- Category filtering
- Price range filtering
- Trending products filter
- Multiple sorting options
- Pagination (12 products per page)

✅ **Responsive Design**
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Progressive enhancement

✅ **Admin Panel**
- Secure authentication
- Product management
- Category management
- Settings management
- Trending products control

## Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL)
- **Routing**: React Router DOM
- **UI Components**: Lucide React, RC Slider
- **Storage**: Supabase Storage for images

## Setup Instructions

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd ecommerence
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env

# Update .env with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
1. Create a new Supabase project
2. Run the SQL files in the `database/` folder in order:
   - `01_schema.sql` - Creates tables and relationships
   - `02_data.sql` - Inserts sample data
   - `03_functions.sql` - Creates database functions
   - `EMERGENCY_FIX.sql` - Disables RLS for admin functionality

### 5. Run Development Server
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
```

## Deployment

### Netlify/Vercel Deployment
1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Set environment variables in your hosting platform
4. Configure redirects for SPA routing

### Environment Variables Required
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Admin Access

- Access admin panel at: `/admindashboard`
- Default credentials are set in your database
- Change username/password from admin settings

## Project Structure

```
src/
├── frontend/          # React components
├── lib/              # Supabase client and functions
├── responsive.css    # Custom responsive styles
└── App.jsx          # Main app component

database/            # SQL schema and data files
public/             # Static assets
```

## Features Overview

### Customer Features
- Browse products with responsive grid layout
- Advanced filtering and search
- Product detail modals
- Mobile-optimized interface
- Fast loading with pagination

### Admin Features
- Secure login system
- Product CRUD operations
- Category management
- Image upload from device
- Trending products management
- Settings management (username/password)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

This project is licensed under the MIT License.
