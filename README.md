# Modern Dashboard with MongoDB Integration

A full-stack dashboard application with React, TypeScript, Express.js, and MongoDB.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based permissions
- **User Management** - Complete CRUD operations for users
- **Role & Permission System** - Granular permission control
- **Blog Management** - Create, edit, publish blogs with rich text editor
- **File Upload** - Image upload with preview
- **Real-time Data** - MongoDB integration with real-time updates
- **Responsive Design** - Mobile-first design with Tailwind CSS

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd modern-dashboard
```

### 2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Environment Setup

#### Frontend Environment (.env)
```bash
cp .env.example .env
```

#### Server Environment (server/.env)
```bash
cp server/.env.example server/.env
```

Update the server/.env file with your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/modern-dashboard
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/modern-dashboard
```

### 4. Start the application

#### Development Mode (Both frontend and backend)
```bash
npm run start
```

#### Or start separately:

**Backend only:**
```bash
npm run server:dev
```

**Frontend only:**
```bash
npm run dev
```

## 🔧 Configuration

### MongoDB Setup

#### Local MongoDB:
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/modern-dashboard`

#### MongoDB Atlas:
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `server/.env`

### Default Admin Account

The application creates a default Super Admin account:
- **Email:** admin@example.com
- **Password:** admin123

You can change these in `server/.env`:
```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Your Admin Name
```

## 📁 Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── store/             # Zustand state management
│   ├── config/            # API configuration
│   └── ...
├── server/                # Backend Express application
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   └── .env               # Server environment variables
├── uploads/               # File upload directory
└── .env                   # Frontend environment variables
```

## 🔐 Authentication & Permissions

### Default Roles:
- **Super Admin** - Full access to all features
- **Admin** - User management and content publishing
- **Editor** - Content creation and editing
- **Author** - Basic content creation
- **Viewer** - Read-only access

### Permission Categories:
- Dashboard
- Apps & Pages (Users, Blogs, etc.)
- Analytics
- System
- News Portal

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Roles
- `GET /api/roles` - Get all roles
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `PATCH /api/blogs/:id/publish` - Publish blog

### Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images

## 🚀 Deployment

### Environment Variables for Production:
```env
# Server (.env)
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://your-domain.com

# Frontend (.env)
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Build for Production:
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License."# MATV-Admin" 
"# taskmanagement" 
"# taskmanagement" 
