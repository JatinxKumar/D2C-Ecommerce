# D2C Ecommerce Website

A modern direct-to-consumer ecommerce platform built with React and Vite. The application provides a smooth shopping experience with product discovery, cart management, authentication, responsive layouts, and a streamlined checkout flow.

## Live Demo

[Visit Live Website](https://shivani-ten.vercel.app)

## Features

- Modern and responsive ecommerce interface
- Product browsing and category-based discovery
- Product details and search experience
- Add to cart and cart quantity management
- User authentication and account features
- Secure checkout workflow
- Toast notifications and interactive UI feedback
- Smooth animations using Framer Motion
- Supabase integration for backend services
- Contact and customer communication support
- Mobile-first responsive design

## Tech Stack

- React
- Vite
- React Router
- Tailwind CSS
- Supabase
- Framer Motion
- Lucide React
- React Hot Toast
- EmailJS

## Getting Started

### Clone the repository

```bash
git clone https://github.com/JatinxKumar/D2C-Ecommerce.git
cd D2C-Ecommerce
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Start the development server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Create production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Project Structure

```text
src/
├── components/   # Reusable UI components
├── pages/        # Application pages
├── assets/       # Images and static assets
├── lib/          # Supabase and utility configuration
├── App.jsx       # Main application component
└── main.jsx      # Application entry point
```

## Deployment

The project can be deployed easily using platforms such as:

- Vercel
- Netlify
- Render

Build the project before deployment:

```bash
npm run build
```

## Author

**Jatin Kumar**

- GitHub: [@JatinxKumar](https://github.com/JatinxKumar)
