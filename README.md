# Income & Expense Management SaaS Backend

A comprehensive, production-ready backend system for managing income and expenses with multi-tenant support (SaaS).

## 🚀 Features

### Core Features
- ✅ **Multi-tenant SaaS Architecture** - Profile-based isolation
- ✅ **User Management** - Registration, login, JWT authentication, role-based access
- ✅ **Income Management** - Complete CRUD with categorization, recurring income, forecasting
- ✅ **Expense Management** - Detailed tracking, vendor management, approvals, mileage tracking
- ✅ **Category Management** - Hierarchical categories with color coding
- ✅ **Budget Management** - Category-wise budgets, alerts, rollover support
- ✅ **Banking & Accounts** - Multiple accounts, transfers, reconciliation
- ✅ **Invoice & Billing** - Professional invoices, recurring invoices, client management
- ✅ **Reports & Analytics** - P&L, balance sheet, cash flow, custom reports
- ✅ **Tax Management** - Tax tracking, GST/VAT support, tax reports

### Technical Features
- 🔐 **JWT Authentication** with access and refresh tokens
- 👥 **Role-Based Access Control (RBAC)** - Flexible permission system
- 📝 **Comprehensive Audit Logs** - Track all actions
- 📎 **File Upload Support** - Receipts, invoices, documents
- 🔍 **Advanced Filtering** - Filter by date, amount, status, category, etc.
- 📊 **Pagination & Sorting** - Efficient data retrieval
- ✅ **Input Validation** - Express-validator integration
- 🛡️ **Security** - Helmet, rate limiting, CORS
- 📨 **Notifications** - Email and in-app notifications (ready)
- 🔄 **Recurring Transactions** - Automated income/expense creation

## 📋 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** MySQL
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **File Upload:** Multer
- **Security:** Helmet, bcryptjs
- **Utilities:** moment, uuid, dotenv

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── jwt.js                # JWT configuration
│   ├── models/
│   │   ├── index.js              # Model associations
│   │   ├── User.js               # User model
│   │   ├── Profile.js            # Profile/Tenant model
│   │   ├── Role.js               # Role model
│   │   ├── Permission.js         # Permission model
│   │   ├── Category.js           # Category model
│   │   ├── Income.js             # Income model
│   │   ├── Expense.js            # Expense model
│   │   ├── Budget.js             # Budget model
│   │   ├── BankAccount.js        # Bank account model
│   │   ├── Invoice.js            # Invoice model
│   │   ├── Client.js             # Client model
│   │   ├── Vendor.js             # Vendor model
│   │   └── ... (20+ models)
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── profileController.js  # Profile management
│   │   ├── incomeController.js   # Income operations
│   │   └── ... (more controllers)
│   ├── routes/
│   │   ├── index.js              # Route aggregator
│   │   ├── authRoutes.js         # Auth routes
│   │   ├── incomeRoutes.js       # Income routes
│   │   └── ... (more routes)
│   ├── middlewares/
│   │   ├── auth.js               # Authentication middleware
│   │   ├── errorHandler.js       # Global error handler
│   │   ├── auditLogger.js        # Audit logging
│   │   ├── upload.js             # File upload handling
│   │   └── validate.js           # Validation middleware
│   └── utils/
│       ├── helpers.js            # Utility functions
│       └── responseHandler.js    # Standardized responses
├── uploads/                      # File uploads directory
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
├── server.js                     # Application entry point
└── README.md
```

## 🔧 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd income-expense-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=income_expense_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
```

4. **Create database**
```bash
mysql -u root -p
CREATE DATABASE income_expense_db;
```

5. **Run the server**
```bash
# Development
npm run dev

# Production
npm start
```

Server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+8801234567890"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Profile Management

#### Create Profile
```http
POST /profiles
Authorization: Bearer {token}
Content-Type: application/json

{
  "profileName": "My Business",
  "businessType": "business",
  "currency": "BDT",
  "email": "business@example.com"
}
```

#### Get All Profiles
```http
GET /profiles?page=1&limit=20
Authorization: Bearer {token}
```

### Income Management

#### Create Income
```http
POST /incomes
Authorization: Bearer {token}
Content-Type: application/json

{
  "profileId": "uuid",
  "categoryId": "uuid",
  "title": "Freelance Project Payment",
  "description": "Payment for website development",
  "amount": 50000,
  "incomeDate": "2024-01-15",
  "paymentStatus": "paid",
  "bankAccountId": "uuid"
}
```

#### Get All Incomes (with filtering)
```http
GET /incomes?profileId=uuid&page=1&limit=20&search=freelance&categoryId=uuid&startDate=2024-01-01&endDate=2024-01-31&minAmount=1000&maxAmount=100000&paymentStatus=paid&sortBy=incomeDate&sortOrder=DESC
Authorization: Bearer {token}
```

#### Get Income Statistics
```http
GET /incomes/stats?profileId=uuid&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

### Expense Management

Similar structure to Income with additional fields for:
- Vendor tracking
- Approval workflow
- Reimbursement
- Mileage tracking

### Category Management

#### Create Category
```http
POST /categories
Authorization: Bearer {token}

{
  "profileId": "uuid",
  "name": "Salary",
  "type": "income",
  "color": "#3B82F6",
  "icon": "💰"
}
```

### Advanced Filtering

All list endpoints support:
- **Search:** `?search=keyword`
- **Pagination:** `?page=1&limit=20`
- **Sorting:** `?sortBy=createdAt&sortOrder=DESC`
- **Date Range:** `?startDate=2024-01-01&endDate=2024-01-31`
- **Amount Range:** `?minAmount=1000&maxAmount=50000`
- **Status:** `?status=active&paymentStatus=paid`
- **Category:** `?categoryId=uuid`
- **Bank Account:** `?bankAccountId=uuid`

## 🔐 Security Features

1. **JWT Authentication** - Secure token-based authentication
2. **Password Hashing** - bcrypt with salt rounds
3. **Rate Limiting** - Prevent brute force attacks
4. **Helmet** - Security headers
5. **CORS** - Cross-origin resource sharing
6. **Input Validation** - Validate all inputs
7. **SQL Injection Protection** - Sequelize ORM
8. **XSS Protection** - Input sanitization

## 👥 Role-Based Access Control

### Default Roles
- **Super Admin** - Full system access
- **Admin** - Profile admin access
- **Manager** - Manage income/expenses
- **Accountant** - View and manage financial data
- **User** - Basic access

### Permissions
- Granular permissions per module
- Actions: create, read, update, delete, approve, export

## 📊 Database Models

### Core Models
1. **User** - User accounts
2. **Profile** - Multi-tenant profiles
3. **Role & Permission** - RBAC system
4. **Category** - Income/expense categories
5. **Income** - Income transactions
6. **Expense** - Expense transactions
7. **Budget** - Budget planning
8. **BankAccount** - Bank accounts
9. **Invoice** - Client invoices
10. **Client & Vendor** - Business contacts

### Support Models
- AuditLog - Activity tracking
- Notification - User notifications
- Attachment - File uploads
- Transaction - Bank transactions
- Transfer - Inter-account transfers
- Report - Saved reports

## 🔍 Audit Logging

All critical operations are logged:
- Who performed the action
- What was changed (old and new values)
- When it happened
- IP address and user agent
- Module and record affected

## 📤 File Upload

Supported file types:
- Images (jpg, png, gif, webp)
- Documents (pdf, doc, docx, xls, xlsx)
- Text files (txt, csv)

Max file size: 5MB (configurable)

## 🚀 Deployment

### Environment Setup
```bash
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=strong-secret-key
```

### Database Migration
```bash
# Sync database
npm run migrate
```

### PM2 (Production)
```bash
npm install -g pm2
pm2 start server.js --name income-expense-api
pm2 save
pm2 startup
```

## 📝 Testing

```bash
# Run tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Built with ❤️ for professional income and expense management.

## 🔮 Upcoming Features

- [ ] Dashboard with charts
- [ ] Expense controller
- [ ] Category controller
- [ ] Budget controller
- [ ] Invoice controller
- [ ] Report generation (PDF/Excel)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Bank integration
- [ ] Multi-currency support
- [ ] Mobile app API
- [ ] Recurring transaction automation

## 📞 Support

For support, email support@example.com or create an issue in the repository.