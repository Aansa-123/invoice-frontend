# Invoice Management System - Frontend

A modern, responsive React web application for managing invoices with a professional UI built with Vite, React Router, Tailwind CSS, and Radix UI components.

## Features

- **User Authentication** - Secure JWT-based login and registration
- **Dashboard** - Real-time overview of invoices and business metrics
- **Invoice Management** - Create, read, update, and delete invoices
- **Client Management** - Manage customer information and details
- **PDF Export** - Download invoices as professional PDF documents
- **Company Settings** - Configure business information and branding
- **Dark/Light Theme** - Toggle between dark and light modes
- **Responsive Design** - Mobile-first design with desktop optimization
- **Form Validation** - Client-side validation with error handling
- **Routing** - Modern React Router v6 with protected routes

## Prerequisites

- **Node.js** 16+ 
- **npm** or **yarn**
- Backend API running on `http://localhost:3000`

## Installation

### 1. Install dependencies
```bash
npm install
```

### 2. Create .env.local file
```bash
VITE_API_URL=http://localhost:3000
```

### 3. Start development server
```bash
npm run dev
```

The application will run on **`http://localhost:5173`**

## Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm build

# Preview production build
npm run preview

# Run ESLint to check code quality
npm run lint
```

## Project Structure

```
src/
├── assets/
│   └── react.svg                # React logo
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx         # Login page component
│   │   └── RegisterForm.jsx      # Registration page component
│   ├── clients/
│   │   ├── ClientList.jsx        # List all clients
│   │   ├── ClientForm.jsx        # Add/Edit client form
│   │   └── ClientDetail.jsx      # Client details view
│   ├── dashboard/
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── InvoiceStats.jsx      # Statistics cards
│   │   └── Charts.jsx            # Charts and analytics
│   ├── invoices/
│   │   ├── InvoiceList.jsx       # List all invoices
│   │   ├── InvoiceForm.jsx       # Create/Edit invoice
│   │   ├── InvoiceDetail.jsx     # Invoice details view
│   │   └── InvoicePDF.jsx        # PDF preview/export
│   ├── settings/
│   │   ├── CompanySettings.jsx   # Company info settings
│   │   └── UserSettings.jsx      # User profile settings
│   ├── layout/
│   │   ├── Header.jsx            # Top navigation bar
│   │   ├── Sidebar.jsx           # Left sidebar navigation
│   │   └── Layout.jsx            # Main layout wrapper
│   ├── ui/
│   │   ├── Button.jsx            # Button component
│   │   ├── Input.jsx             # Input field component
│   │   ├── Form.jsx              # Form wrapper
│   │   ├── Dialog.jsx            # Modal dialog
│   │   ├── Table.jsx             # Data table
│   │   └── ...                   # Other UI components
│   └── theme-provider.jsx        # Theme context provider
├── App.jsx                       # Main app component
├── index.css                     # Global styles
└── main.jsx                      # React entry point
```

## Technology Stack

### Frontend Framework & Build
- **React** 19 - UI library
- **Vite** 7 - Build tool and dev server
- **Tailwind CSS** 4 - Utility-first CSS framework

### UI Components & Styling
- **Radix UI** - Accessible component library
  - Dialog, Dropdown, Select, Tabs, Toast, etc.
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **clsx** - Class name utility

### State Management & Forms
- **Redux** - State management
- **Redux Thunk** - Async actions
- **React Hook Form** - Efficient form handling
- **Zod** - Schema validation
- **@hookform/resolvers** - Form resolver for Zod

### Utilities & Libraries
- **date-fns** - Date manipulation and formatting
- **recharts** - Charts and graphs
- **sonner** - Toast notifications
- **next-themes** - Theme management
- **Embla Carousel** - Carousel component
- **input-otp** - OTP input component

## Getting Started Guide

### 1. First Time Setup
1. Start the backend server (see backend README)
2. Install dependencies: `npm install`
3. Configure `.env` with your backend URL
4. Start dev server: `npm run dev`

### 2. Login/Register
- Create a new account via the registration page
- Or login with existing credentials

### 3. Set Up Company
- Go to Settings
- Configure your company information
- Upload company logo (optional)

### 4. Add Clients
- Navigate to Clients section
- Click "Add Client"
- Fill in client details
- Save

### 5. Create Invoice
- Go to Invoices section
- Click "Create Invoice"
- Select client
- Add line items
- Configure tax and discount
- Generate and download PDF

## Components Overview

### Authentication Components
- **LoginForm** - Handles user login
- **RegisterForm** - New user registration with validation

### Dashboard Components
- **Dashboard** - Main dashboard with statistics and recent invoices
- **InvoiceStats** - Cards showing invoice metrics
- **Charts** - Visual charts for analytics

### Invoice Components
- **InvoiceList** - Filterable and sortable invoice table
- **InvoiceForm** - Create/edit invoices with line items
- **InvoiceDetail** - View full invoice details
- **InvoicePDF** - Generate and preview PDF invoices

### Client Components
- **ClientList** - View all clients
- **ClientForm** - Add/edit client information
- **ClientDetail** - View client details and their invoices

### UI Components (Radix UI based)
- **Button** - Customizable button component
- **Input** - Text input fields
- **Dialog** - Modal dialogs
- **Table** - Data tables with sorting/filtering
- **Select** - Dropdown selections
- **Toast** - Notifications

## Styling

### Tailwind CSS
- Global styles in `src/index.css`
- Component-specific styles using Tailwind classes
- Dark mode support via `next-themes`

### Color Theme
- Consistent color scheme across app
- Dark/Light mode toggle in header
- Customizable via theme provider

## State Management (Redux)

### Store Structure
```
store/
├── slices/
│   ├── authSlice.js          # User authentication state
│   ├── invoiceSlice.js       # Invoices data
│   ├── clientSlice.js        # Clients data
│   └── settingsSlice.js      # Settings state
├── configureStore.js         # Store configuration
└── thunks/
    ├── authThunks.js         # Async auth actions
    ├── invoiceThunks.js      # Async invoice actions
    └── clientThunks.js       # Async client actions
```

## API Integration

### Base URL
```
VITE_API_URL=http://localhost:3000/api
```

### Authentication
All API requests include JWT token in Authorization header:
```javascript
Authorization: Bearer <token>
```

### Common API Calls
```javascript
// Login
POST /auth/login

// Get invoices
GET /invoices

// Create invoice
POST /invoices

// Download PDF
GET /invoices/:id/pdf

// Get clients
GET /clients

// Update company settings
PUT /company
```

## Form Validation

Forms use React Hook Form with Zod schema validation:

```javascript
const schema = z.object({
  email: z.string().email('Invalid email'),
  amount: z.number().positive('Amount must be positive'),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

## Error Handling

- **Network Errors** - Caught and displayed via toast notifications
- **Validation Errors** - Shown inline in forms
- **API Errors** - Displayed in user-friendly toast messages
- **Auth Errors** - Redirect to login on 401

## Dark/Light Mode

Toggle theme using the button in header:
```javascript
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

## Performance Optimization

- **Code Splitting** - Routes are lazy loaded
- **Image Optimization** - Using responsive images
- **Bundle Size** - Optimized with Vite
- **Caching** - API responses cached in Redux
- **Memoization** - React.memo for expensive components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Building for Production

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

### Production Checklist
- [ ] Update API URL in .env
- [ ] Test all features
- [ ] Check console for errors/warnings
- [ ] Verify dark/light mode works
- [ ] Test PDF export
- [ ] Mobile responsiveness check

## Troubleshooting

### Port already in use
```bash
# Use different port
npm run dev -- --port 3000
```

### API Connection Error
- Verify backend is running on port 5000
- Check VITE_API_URL in .env
- Check CORS settings on backend

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Styling Issues
- Ensure Tailwind CSS is imported in `src/index.css`
- Clear browser cache
- Check for CSS conflicts

## Development Guidelines

1. **Component Structure** - Keep components small and focused
2. **Props** - Use PropTypes or TypeScript for type safety
3. **Hooks** - Use custom hooks for reusable logic
4. **State** - Use Redux for global state, useState for local state
5. **Styling** - Use Tailwind classes consistently
6. **Error Handling** - Always handle API errors gracefully
7. **Forms** - Use React Hook Form for complex forms
8. **Naming** - Use descriptive names for variables and functions

## Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint errors
npm run lint -- --fix
```

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=Invoice Management System
VITE_APP_VERSION=1.0.0

# Feature Flags (optional)
VITE_ENABLE_CHARTS=true
VITE_ENABLE_DARK_MODE=true
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.

## Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Radix UI Docs](https://radix-ui.com)
- [Redux Documentation](https://redux.js.org)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
