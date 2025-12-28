# API Usage Examples

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

### 1. Register New User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+8801234567890"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 3. Get Profile
```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Profile Management

### 1. Create Profile
```bash
curl -X POST http://localhost:5000/api/v1/profiles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileName": "My Personal Finance",
    "businessType": "personal",
    "currency": "BDT",
    "currencySymbol": "৳",
    "timezone": "Asia/Dhaka",
    "email": "personal@example.com",
    "phone": "+8801234567890"
  }'
```

### 2. Get All Profiles
```bash
curl -X GET "http://localhost:5000/api/v1/profiles?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Update Profile
```bash
curl -X PUT http://localhost:5000/api/v1/profiles/{profileId} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileName": "Updated Profile Name",
    "businessName": "My Company Ltd."
  }'
```

## Income Management

### 1. Create Income
```bash
curl -X POST http://localhost:5000/api/v1/incomes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "your-profile-uuid",
    "categoryId": "category-uuid",
    "title": "Freelance Project Payment",
    "description": "Website development project",
    "amount": 50000,
    "currency": "BDT",
    "incomeDate": "2024-01-15",
    "paymentStatus": "paid",
    "bankAccountId": "bank-account-uuid",
    "clientName": "ABC Company",
    "clientEmail": "client@abc.com",
    "notes": "First milestone payment"
  }'
```

### 2. Get All Incomes (with filtering)
```bash
# Basic listing
curl -X GET "http://localhost:5000/api/v1/incomes?profileId=uuid&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With filters
curl -X GET "http://localhost:5000/api/v1/incomes?profileId=uuid&search=freelance&categoryId=uuid&startDate=2024-01-01&endDate=2024-01-31&minAmount=10000&maxAmount=100000&paymentStatus=paid&sortBy=incomeDate&sortOrder=DESC" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Income by ID
```bash
curl -X GET "http://localhost:5000/api/v1/incomes/{incomeId}?profileId=uuid" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Income
```bash
curl -X PUT http://localhost:5000/api/v1/incomes/{incomeId} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "your-profile-uuid",
    "title": "Updated Income Title",
    "amount": 55000,
    "paymentStatus": "paid"
  }'
```

### 5. Delete Income
```bash
curl -X DELETE "http://localhost:5000/api/v1/incomes/{incomeId}?profileId=uuid" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Get Income Statistics
```bash
curl -X GET "http://localhost:5000/api/v1/incomes/stats?profileId=uuid&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Advanced Filtering Examples

### Filter by Multiple Criteria
```bash
curl -X GET "http://localhost:5000/api/v1/incomes?profileId=uuid&categoryId=uuid&paymentStatus=paid&startDate=2024-01-01&endDate=2024-12-31&minAmount=5000&sortBy=amount&sortOrder=DESC&page=1&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Search Incomes
```bash
curl -X GET "http://localhost:5000/api/v1/incomes?profileId=uuid&search=salary" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Date Range Filtering
```bash
# This month
curl -X GET "http://localhost:5000/api/v1/incomes?profileId=uuid&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# This year
curl -X GET "http://localhost:5000/api/v1/incomes?profileId=uuid&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Amount Range Filtering
```bash
curl -X GET "http://localhost:5000/api/v1/incomes?profileId=uuid&minAmount=10000&maxAmount=50000" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Query Parameters Reference

### Common Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sortBy` - Field to sort by (e.g., createdAt, amount, title)
- `sortOrder` - Sort direction (ASC or DESC, default: DESC)
- `search` - Search keyword

### Filter Parameters
- `profileId` - Filter by profile (required for most endpoints)
- `categoryId` - Filter by category
- `bankAccountId` - Filter by bank account
- `status` - Filter by status
- `paymentStatus` - Filter by payment status
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)
- `minAmount` - Minimum amount
- `maxAmount` - Maximum amount
- `isRecurring` - Filter recurring (true/false)

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success message",
  "data": [
    // Array of items
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "pageSize": 20,
    "totalItems": 195,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Notes

1. **Authorization:** All protected endpoints require Bearer token in Authorization header
2. **Profile ID:** Most endpoints require profileId as query parameter or in request body
3. **Date Format:** Use ISO 8601 format (YYYY-MM-DD) for dates
4. **Currency:** Use 3-letter currency codes (BDT, USD, EUR, etc.)
5. **Pagination:** Default page size is 20, maximum is 100
6. **Search:** Search works on title, description, and number fields
7. **Filtering:** Multiple filters can be combined
8. **Sorting:** Default sort is by creation date descending