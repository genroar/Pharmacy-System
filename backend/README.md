# Pharmacy System Backend

A robust, scalable backend API for a Pharmacy Management System built with TypeScript, Node.js, and Express.

## 🚀 Features

- **TypeScript**: Full TypeScript support with strict type checking
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Request validation using Joi and express-validator
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Centralized error handling middleware
- **CORS**: Cross-origin resource sharing support
- **Security**: Helmet.js for security headers
- **Rate Limiting**: API rate limiting protection
- **File Upload**: Support for file uploads
- **Email**: Email functionality with Nodemailer
- **Redis**: Caching and session storage
- **Testing**: Jest testing framework setup
- **Linting**: ESLint configuration
- **Hot Reload**: Development with nodemon

## 📁 Project Structure

```
backend/
│
├── src/
│   ├── config/          # Configuration files
│   ├── database/        # Database connection and models
│   ├── models/          # Data models and schemas
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── routes/          # API route definitions
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── validations/     # Input validation schemas
│   ├── jobs/            # Background jobs
│   ├── sync/            # Data synchronization
│   ├── logs/            # Application logs
│   ├── tests/           # Test files
│   └── server.ts        # Main application file
│
├── .env                 # Environment variables (create from env.sample)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Redis (v6 or higher) - Optional
- npm or yarn

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pharmacy-system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the sample environment file
   cp env.sample .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if using local installation)
   mongod
   
   # Or use MongoDB Atlas (cloud service)
   # Update DATABASE_URL in .env
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Testing
```bash
npm test
npm run test:watch
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 🌐 API Endpoints

- `GET /health` - Health check
- `GET /api/v1` - API information

## 🔧 Configuration

The application uses environment variables for configuration. Key settings include:

- **Database**: MongoDB connection string and credentials
- **JWT**: Secret keys and token expiration
- **Email**: SMTP server configuration
- **Redis**: Cache server settings
- **CORS**: Allowed origins
- **File Upload**: Size limits and allowed types

## 📊 Database Models

The system includes models for:
- Users (Pharmacists, Staff, Customers)
- Medicines and Drugs
- Prescriptions
- Inventory
- Orders and Transactions
- Suppliers
- Categories

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Token refresh mechanism

## 🧪 Testing

- Jest testing framework
- Test coverage reporting
- Mock database for testing
- API endpoint testing

## 📝 Logging

- Winston logger with multiple transports
- File and console logging
- Structured logging format
- Log rotation and compression

## 🚨 Error Handling

- Centralized error handling
- Custom error classes
- HTTP status code mapping
- Error logging and monitoring

## 🔒 Security Features

- Helmet.js security headers
- CORS configuration
- Rate limiting
- Input validation and sanitization
- SQL injection protection

## 📈 Performance

- Database connection pooling
- Redis caching
- Response compression
- Efficient query optimization

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build image
docker build -t pharmacy-backend .

# Run container
docker run -p 3000:3000 pharmacy-backend
```

### Manual Deployment
1. Build the project: `npm run build`
2. Set production environment variables
3. Use PM2 or similar process manager
4. Set up reverse proxy (Nginx)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v1.0.0
- Initial release
- Basic API structure
- Authentication system
- Database models
- Error handling
- Logging system

---

**Happy Coding! 🎉**
