# FIU Backend System - Technical Documentation

## 🏗️ System Architecture

The Financial Intelligence Unit (FIU) backend is a comprehensive Node.js/Express.js application designed for managing suspicious transaction reports (STR) and cash transaction reports (CTR) with role-based access control, real-time notifications, and advanced workflow management.

### Core Technologies

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 13+ with raw SQL queries
- **Authentication**: JWT (JSON Web Tokens) with refresh token support
- **Real-time Communication**: WebSocket (ws library)
- **File Upload**: Multer with custom storage configuration
- **Security**: Helmet, CORS, Rate Limiting, bcrypt
- **Logging**: Custom Winston-like logger implementation
- **Validation**: express-validator
- **Process Management**: PM2 ready with graceful shutdown

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Environment Configuration

Copy the example environment file and configure your settings:

\`\`\`bash
cp .env.example .env
\`\`\`

Update the `.env` file with your database credentials and other settings:

\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:6000/fiu_system"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
NODE_ENV="development"
\`\`\`

### 3. Database Setup

First, make sure PostgreSQL is running and create the database:

\`\`\`sql
CREATE DATABASE fiu_system;
\`\`\`

Then run the database migrations:

\`\`\`bash
npm run db:push
\`\`\`

Generate Prisma client:

\`\`\`bash
npm run db:generate
\`\`\`

### 4. Seed Database (Optional)

\`\`\`bash
npm run db:seed
\`\`\`

### 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The server will start on `http://localhost:5000`

## 📊 Database Architecture

### Connection Management
\`\`\`javascript
// Connection pooling with automatic reconnection
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
\`\`\`

### Transaction Management
All critical operations use database transactions with proper rollback handling:
\`\`\`javascript
const client = await pool.connect()
try {
  await client.query('BEGIN')
  // Multiple operations
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
\`\`\`

### Key Tables Structure

#### Users Table
- **Primary Key**: UUID
- **Indexes**: username, email, role, created_by
- **Constraints**: Unique username/email, role enum validation
- **Audit Fields**: created_at, updated_at, created_by, updated_by

#### STR Reports Table
- **Primary Key**: UUID
- **Foreign Keys**: created_by, branch_id, transaction_manner_id, crime_type_id
- **Indexes**: report_number, status, created_at, branch_id
- **JSON Fields**: person_being_reported, beneficiary_information
- **Full-text Search**: On description fields using PostgreSQL tsvector

#### Audit Logs Table
- **Partitioned**: By month for performance
- **Indexes**: user_id, action, created_at, table_name
- **Retention**: Configurable (default 2 years)

## 🔐 Authentication & Authorization

### JWT Implementation
\`\`\`javascript
// Dual token system
const tokens = {
  accessToken: jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }),
  refreshToken: jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}
\`\`\`

### Session Management
- **Storage**: Database-backed sessions with automatic cleanup
- **Security**: IP address and User-Agent tracking
- **Expiration**: Configurable timeout with sliding window
- **Concurrent Sessions**: Limited per user with oldest session eviction

### Role-Based Access Control (RBAC)
\`\`\`javascript
// Hierarchical role system
const ROLES = {
  SUPER_ADMIN: {
    permissions: ['*'], // All permissions
    level: 100
  },
  INTERMEDIATE_ADMIN: {
    permissions: ['manage_branches', 'manage_encoders', 'approve_reports'],
    level: 50,
    scope: 'entity' // Limited to their reporting entity
  },
  DATA_ENCODER: {
    permissions: ['create_reports', 'upload_files'],
    level: 10,
    scope: 'branch' // Limited to their branch
  }
}
\`\`\`

### Middleware Chain
\`\`\`javascript
// Authentication middleware
const authenticate = async (req, res, next) => {
  // 1. Extract JWT from Authorization header
  // 2. Verify token signature and expiration
  // 3. Validate active session in database
  // 4. Check user account status
  // 5. Update session last_accessed timestamp
  // 6. Attach user object to request
}

// Authorization middleware
const authorize = (...roles) => (req, res, next) => {
  // 1. Verify user is authenticated
  // 2. Check user role against required roles
  // 3. Validate entity/branch scope if applicable
  // 4. Log authorization attempts for audit
}
\`\`\`

## 🚀 API Architecture

### RESTful Design Principles
- **Resource-based URLs**: \`/api/resource/:id/sub-resource\`
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Status Codes**: Proper HTTP status codes with consistent error responses
- **Pagination**: Cursor-based pagination for large datasets
- **Filtering**: Query parameter-based filtering with SQL injection protection

### Response Format Standardization
\`\`\`javascript
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "pagination": { /* pagination info */ }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Error type",
  "errors": { /* validation errors */ }
}
\`\`\`

### Input Validation Pipeline
\`\`\`javascript
// Multi-layer validation
const validation = [
  // 1. express-validator rules
  body('email').isEmail().normalizeEmail(),
  body('amount').isNumeric().custom(value => value > 0),
  
  // 2. Custom business logic validation
  async (req, res, next) => {
    // Check business rules
    // Validate against database constraints
    // Cross-field validation
  },
  
  // 3. Error handling middleware
  handleValidationErrors
]
\`\`\`

## 📁 File Upload System

### Storage Architecture
\`\`\`javascript
// Organized directory structure
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // /uploads/reports/{reportType}/{reportId}/{year}/{month}/
    const path = \`uploads/reports/\${reportType}/\${reportId}/\${year}/\${month}\`
    ensureDirectoryExists(path)
    cb(null, path)
  },
  filename: (req, file, cb) => {
    // timestamp_originalname_hash.ext
    const filename = \`\${Date.now()}_\${sanitizeFilename(file.originalname)}_\${generateHash()}\`
    cb(null, filename)
  }
})
\`\`\`

### Security Measures
- **File Type Validation**: Whitelist-based MIME type checking
- **Size Limits**: Configurable per file type (default 10MB)
- **Virus Scanning**: Integration ready for ClamAV
- **Access Control**: JWT-based file access with ownership validation
- **Path Traversal Protection**: Sanitized file paths and names

### File Processing Pipeline
\`\`\`javascript
const fileProcessor = {
  // 1. Validate file type and size
  validate: (file) => { /* validation logic */ },
  
  // 2. Generate thumbnails for images
  generateThumbnail: async (filePath) => { /* thumbnail generation */ },
  
  // 3. Extract metadata
  extractMetadata: (file) => { /* metadata extraction */ },
  
  // 4. Store in database with relationships
  saveToDatabase: async (fileData) => { /* database storage */ }
}
\`\`\`

## 🔄 Workflow Engine

### State Machine Implementation
\`\`\`javascript
const REPORT_STATES = {
  DRAFT: {
    allowedTransitions: ['SUBMITTED'],
    permissions: ['owner', 'intermediate_admin', 'super_admin']
  },
  SUBMITTED: {
    allowedTransitions: ['APPROVED', 'REJECTED', 'RETURNED'],
    permissions: ['intermediate_admin', 'super_admin']
  },
  APPROVED: {
    allowedTransitions: [],
    permissions: ['super_admin'] // Only super admin can modify approved reports
  },
  REJECTED: {
    allowedTransitions: ['SUBMITTED'], // Can be resubmitted after fixes
    permissions: ['owner', 'intermediate_admin', 'super_admin']
  },
  RETURNED: {
    allowedTransitions: ['SUBMITTED'],
    permissions: ['owner']
  }
}
\`\`\`

### Workflow Actions
\`\`\`javascript
class WorkflowService {
  async transitionReport(reportId, reportType, fromStatus, toStatus, userId, data) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      // 1. Validate transition is allowed
      this.validateTransition(fromStatus, toStatus)
      
      // 2. Check user permissions
      await this.checkPermissions(userId, reportId, toStatus)
      
      // 3. Update report status
      await this.updateReportStatus(client, reportId, reportType, toStatus, data)
      
      // 4. Create workflow history entry
      await this.createWorkflowHistory(client, reportId, reportType, fromStatus, toStatus, userId, data)
      
      // 5. Send notifications
      await this.sendNotifications(reportId, reportType, toStatus, userId)
      
      // 6. Trigger business rules
      await this.executeBusinesRules(reportId, reportType, toStatus)
      
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}
\`\`\`

## 🔔 Real-time Notification System

### WebSocket Architecture
\`\`\`javascript
// Connection management
class WebSocketManager {
  constructor() {
    this.connections = new Map() // userId -> WebSocket connections
    this.heartbeatInterval = 30000 // 30 seconds
  }
  
  addConnection(userId, ws) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set())
    }
    this.connections.get(userId).add(ws)
    
    // Setup heartbeat
    ws.isAlive = true
    ws.on('pong', () => { ws.isAlive = true })
  }
  
  broadcast(userId, message) {
    const userConnections = this.connections.get(userId)
    if (userConnections) {
      userConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message))
        }
      })
    }
  }
}
\`\`\`

### Notification Types
\`\`\`javascript
const NOTIFICATION_TYPES = {
  REPORT_SUBMITTED: {
    priority: 'NORMAL',
    recipients: ['intermediate_admin', 'super_admin'],
    template: 'report_submitted',
    realtime: true,
    email: false
  },
  REPORT_APPROVED: {
    priority: 'HIGH',
    recipients: ['report_creator'],
    template: 'report_approved',
    realtime: true,
    email: true
  },
  REPORT_REJECTED: {
    priority: 'HIGH',
    recipients: ['report_creator'],
    template: 'report_rejected',
    realtime: true,
    email: true
  },
  SYSTEM_MAINTENANCE: {
    priority: 'URGENT',
    recipients: ['all_users'],
    template: 'system_maintenance',
    realtime: true,
    email: true
  }
}
\`\`\`

### Message Queue Integration
\`\`\`javascript
// Ready for Redis/RabbitMQ integration
class NotificationQueue {
  async enqueue(notification) {
    // 1. Validate notification structure
    // 2. Determine recipients based on type and scope
    // 3. Queue for immediate delivery (WebSocket)
    // 4. Queue for email delivery (if enabled)
    // 5. Store in database for persistence
  }
  
  async process() {
    // Background worker to process queued notifications
    // Handles retries, dead letter queue, and delivery confirmation
  }
}
\`\`\`

## 📊 Performance Optimizations

### Database Query Optimization
\`\`\`sql
-- Optimized report listing query with proper indexing
SELECT 
  r.*,
  u.first_name || ' ' || u.last_name as creator_name,
  b.branch_name,
  re.entity_name
FROM str_reports r
JOIN users u ON r.created_by = u.id
JOIN branches b ON r.branch_id = b.id
JOIN reporting_entities re ON b.reporting_entity_id = re.id
WHERE r.status = $1 
  AND r.created_at >= $2
  AND ($3::uuid IS NULL OR r.branch_id = $3)
ORDER BY r.created_at DESC
LIMIT $4 OFFSET $5;

-- Supporting indexes
CREATE INDEX CONCURRENTLY idx_str_reports_status_created_at ON str_reports(status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_str_reports_branch_status ON str_reports(branch_id, status);
\`\`\`

### Caching Strategy
\`\`\`javascript
// Multi-level caching
const cache = {
  // 1. In-memory cache for frequently accessed data
  memory: new Map(),
  
  // 2. Redis cache for shared data across instances
  redis: redisClient,
  
  // 3. Database query result caching
  async get(key, fetchFunction, ttl = 300) {
    // Check memory cache first
    if (this.memory.has(key)) {
      return this.memory.get(key)
    }
    
    // Check Redis cache
    const cached = await this.redis.get(key)
    if (cached) {
      const data = JSON.parse(cached)
      this.memory.set(key, data)
      return data
    }
    
    // Fetch from database
    const data = await fetchFunction()
    
    // Store in both caches
    this.memory.set(key, data)
    await this.redis.setex(key, ttl, JSON.stringify(data))
    
    return data
  }
}
\`\`\`

### Connection Pooling
\`\`\`javascript
// Optimized connection pool configuration
const poolConfig = {
  max: process.env.DB_POOL_MAX || 20,
  min: process.env.DB_POOL_MIN || 5,
  acquire: 30000,
  idle: 10000,
  evict: 1000,
  handleDisconnects: true,
  
  // Custom connection validation
  validate: async (connection) => {
    try {
      await connection.query('SELECT 1')
      return true
    } catch (error) {
      return false
    }
  }
}
\`\`\`

## 🛡️ Security Implementation

### Input Sanitization
\`\`\`javascript
// Multi-layer input sanitization
const sanitize = {
  // 1. HTML sanitization
  html: (input) => DOMPurify.sanitize(input),
  
  // 2. SQL injection prevention
  sql: (input) => {
    // Using parameterized queries exclusively
    // No string concatenation in SQL
  },
  
  // 3. XSS prevention
  xss: (input) => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  },
  
  // 4. File path sanitization
  filename: (filename) => {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255)
  }
}
\`\`\`

### Rate Limiting Implementation
\`\`\`javascript
// Sophisticated rate limiting
const rateLimiter = {
  // 1. Global rate limiting
  global: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    standardHeaders: true,
    legacyHeaders: false
  }),
  
  // 2. Endpoint-specific limiting
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 login attempts per 15 minutes
    skipSuccessfulRequests: true
  }),
  
  // 3. User-specific limiting
  perUser: async (req, res, next) => {
    const userId = req.user?.id
    if (userId) {
      const key = \`user:\${userId}\`
      const requests = await redis.incr(key)
      if (requests === 1) {
        await redis.expire(key, 3600) // 1 hour window
      }
      if (requests > 1000) { // 1000 requests per hour per user
        return res.status(429).json({ error: 'Rate limit exceeded' })
      }
    }
    next()
  }
}
\`\`\`

### Audit Logging
\`\`\`javascript
// Comprehensive audit trail
class AuditLogger {
  async log(action, details) {
    const auditEntry = {
      id: generateUUID(),
      user_id: details.userId,
      action: action,
      table_name: details.tableName,
      record_id: details.recordId,
      old_values: details.oldValues ? JSON.stringify(details.oldValues) : null,
      new_values: details.newValues ? JSON.stringify(details.newValues) : null,
      ip_address: details.ipAddress,
      user_agent: details.userAgent,
      created_at: new Date(),
      
      // Additional context
      session_id: details.sessionId,
      request_id: details.requestId,
      endpoint: details.endpoint,
      method: details.method
    }
    
    // Async logging to avoid blocking main thread
    setImmediate(async () => {
      try {
        await pool.query(
          'INSERT INTO audit_logs (...) VALUES (...)',
          Object.values(auditEntry)
        )
      } catch (error) {
        // Log to file if database logging fails
        logger.error('Audit logging failed', { error, auditEntry })
      }
    })
  }
}
\`\`\`

## 🔧 Error Handling & Monitoring

### Centralized Error Handling
\`\`\`javascript
class ErrorHandler {
  static handle(error, req, res, next) {
    // 1. Log error with context
    logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      user: req.user?.id,
      body: req.body,
      params: req.params,
      query: req.query
    })
    
    // 2. Determine error type and response
    if (error.name === 'ValidationError') {
      return ResponseHelper.validationError(res, 'Validation failed', error.errors)
    }
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return ResponseHelper.error(res, 'Duplicate entry', null, 409)
    }
    
    if (error.name === 'JsonWebTokenError') {
      return ResponseHelper.unauthorized(res, 'Invalid token')
    }
    
    // 3. Generic server error (don't expose internal details)
    return ResponseHelper.serverError(res, 'Internal server error')
  }
  
  static async handleUncaughtException(error) {
    logger.error('Uncaught Exception', error)
    
    // 1. Attempt graceful shutdown
    await this.gracefulShutdown()
    
    // 2. Exit process
    process.exit(1)
  }
  
  static async gracefulShutdown() {
    // 1. Stop accepting new connections
    server.close()
    
    // 2. Close database connections
    await pool.end()
    
    // 3. Close WebSocket connections
    wss.close()
    
    // 4. Finish processing current requests (with timeout)
    setTimeout(() => {
      process.exit(1)
    }, 10000)
  }
}
\`\`\`

### Health Monitoring
\`\`\`javascript
// Comprehensive health checks
const healthCheck = {
  async database() {
    try {
      const result = await pool.query('SELECT NOW()')
      return {
        status: 'healthy',
        latency: Date.now() - startTime,
        connections: pool.totalCount
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  },
  
  async memory() {
    const usage = process.memoryUsage()
    return {
      status: usage.heapUsed < 1024 * 1024 * 1024 ? 'healthy' : 'warning', // 1GB threshold
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external
    }
  },
  
  async websocket() {
    return {
      status: 'healthy',
      connections: wss.clients.size,
      activeConnections: Array.from(wss.clients).filter(ws => ws.readyState === WebSocket.OPEN).length
    }
  }
}
\`\`\`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data

## 📈 API Endpoints Reference

### Authentication Endpoints
\`\`\`
POST   /api/auth/login                    # User login
POST   /api/auth/logout                   # User logout  
POST   /api/auth/refresh-token            # Refresh access token
POST   /api/auth/forgot-password          # Request password reset
POST   /api/auth/reset-password           # Reset password with token
GET    /api/auth/me                       # Get current user info
\`\`\`

### Super Admin Endpoints
\`\`\`
# Dashboard
GET    /api/super-admin/dashboard         # System overview statistics

# Reporting Entities Management
POST   /api/super-admin/reporting-entities          # Create reporting entity
GET    /api/super-admin/reporting-entities          # List reporting entities
GET    /api/super-admin/reporting-entities/:id      # Get reporting entity
PUT    /api/super-admin/reporting-entities/:id      # Update reporting entity
DELETE /api/super-admin/reporting-entities/:id      # Delete reporting entity

# Transaction Manners Management  
POST   /api/super-admin/transaction-manners         # Create transaction manner
GET    /api/super-admin/transaction-manners         # List transaction manners
GET    /api/super-admin/transaction-manners/:id     # Get transaction manner
PUT    /api/super-admin/transaction-manners/:id     # Update transaction manner
DELETE /api/super-admin/transaction-manners/:id     # Delete transaction manner

# Crime Types Management
POST   /api/super-admin/crime-types                 # Create crime type
GET    /api/super-admin/crime-types                 # List crime types
GET    /api/super-admin/crime-types/:id             # Get crime type
PUT    /api/super-admin/crime-types/:id             # Update crime type
DELETE /api/super-admin/crime-types/:id             # Delete crime type

# User Management
POST   /api/super-admin/users                       # Create user
GET    /api/super-admin/users                       # List users
GET    /api/super-admin/users/:id                   # Get user
PUT    /api/super-admin/users/:id                   # Update user
DELETE /api/super-admin/users/:id                   # Delete user
\`\`\`

### Intermediate Admin Endpoints
\`\`\`
# Dashboard
GET    /api/intermediate-admin/dashboard            # Entity-specific dashboard

# Branch Management
POST   /api/intermediate-admin/branches             # Create branch
GET    /api/intermediate-admin/branches             # List entity branches
GET    /api/intermediate-admin/branches/:id         # Get branch details
PUT    /api/intermediate-admin/branches/:id         # Update branch
DELETE /api/intermediate-admin/branches/:id         # Delete branch
GET    /api/intermediate-admin/branches/:id/stats   # Branch statistics

# Data Encoder Management
POST   /api/intermediate-admin/data-encoders        # Create data encoder
GET    /api/intermediate-admin/data-encoders        # List data encoders
GET    /api/intermediate-admin/data-encoders/:id    # Get data encoder
PUT    /api/intermediate-admin/data-encoders/:id    # Update data encoder
POST   /api/intermediate-admin/data-encoders/:id/reset-password  # Reset password
\`\`\`

### Data Encoder Endpoints
\`\`\`
# Dashboard
GET    /api/data-encoder/dashboard                  # Personal dashboard

# STR Reports
POST   /api/data-encoder/str-reports                # Create STR report
GET    /api/data-encoder/str-reports                # List STR reports
GET    /api/data-encoder/str-reports/:id            # Get STR report
PUT    /api/data-encoder/str-reports/:id            # Update STR report
POST   /api/data-encoder/str-reports/:id/submit     # Submit STR report
DELETE /api/data-encoder/str-reports/:id            # Delete STR report

# CTR Reports  
POST   /api/data-encoder/ctr-reports                # Create CTR report
GET    /api/data-encoder/ctr-reports                # List CTR reports
GET    /api/data-encoder/ctr-reports/:id            # Get CTR report
PUT    /api/data-encoder/ctr-reports/:id            # Update CTR report
POST   /api/data-encoder/ctr-reports/:id/submit     # Submit CTR report
DELETE /api/data-encoder/ctr-reports/:id            # Delete CTR report

# File Management
POST   /api/data-encoder/reports/:reportId/:type/files     # Upload files
GET    /api/data-encoder/reports/:reportId/:type/files     # List report files
GET    /api/data-encoder/files/:fileId/download            # Download file
DELETE /api/data-encoder/files/:fileId                     # Delete file

# Bulk Operations
POST   /api/data-encoder/reports/bulk-submit               # Bulk submit reports
\`\`\`

### Workflow Management Endpoints
\`\`\`
# Report Review
GET    /api/workflow/reports/review                 # Get reports for review
GET    /api/workflow/reports/:id/:type/history      # Get workflow history

# Report Actions
POST   /api/workflow/reports/:id/:type/approve      # Approve report
POST   /api/workflow/reports/:id/:type/reject       # Reject report  
POST   /api/workflow/reports/:id/:type/return       # Return for revision

# Statistics
GET    /api/workflow/statistics                     # Workflow statistics
GET    /api/workflow/reports/analytics              # Report analytics
\`\`\`

### Notification Endpoints
\`\`\`
# Notification Management
GET    /api/notifications                           # Get user notifications
GET    /api/notifications/counts                    # Get notification counts
PATCH  /api/notifications/:id/read                  # Mark notification as read
PATCH  /api/notifications/read-all                  # Mark all as read
DELETE /api/notifications/:id                       # Delete notification
DELETE /api/notifications/clear-all                 # Clear all notifications

# System Notifications (Super Admin only)
POST   /api/notifications/system                    # Create system notification
POST   /api/notifications/broadcast                 # Broadcast to all users
\`\`\`

### Common/Shared Endpoints
\`\`\`
# Dropdown Data
GET    /api/common/reporting-entities/dropdown      # Reporting entities for dropdowns
GET    /api/common/transaction-manners/dropdown     # Transaction manners for dropdowns
GET    /api/common/crime-types/dropdown             # Crime types for dropdowns
GET    /api/common/branches/dropdown                # Branches for dropdowns

# System Information
GET    /api/common/system/health                    # System health status
GET    /api/common/system/info                      # System information
GET    /api/common/constants/countries              # Country list
GET    /api/common/constants/currencies             # Currency list
GET    /api/common/constants/id-types               # ID types list
\`\`\`

### WebSocket Connection
\`\`\`
WS     ws://localhost:5000/ws?token=JWT_TOKEN       # Real-time notifications
\`\`\`

## Project Structure

\`\`\`
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   └── app.ts           # Express app setup
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # File storage
└── logs/                # Application logs
\`\`\`

## Development

The API uses:
- **Express.js** for the web framework
- **Prisma** as the ORM
- **PostgreSQL** as the database
- **JWT** for authentication
- **Zod** for validation
- **TypeScript** for type safety

## Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation
- Password hashing with bcrypt
- JWT token authentication
- Audit logging

## Logging

Logs are written to the `logs/` directory:
- `error.log` - Error messages
- `warn.log` - Warning messages
- `info.log` - Info messages
- `debug.log` - Debug messages (development only)

## Database

The application uses PostgreSQL with Prisma ORM. The database schema includes:
- User management with role-based access
- Reporting entities and branches
- STR and CTR reports with comprehensive fields
- File attachments
- Audit logs
- System settings

## 🚀 Deployment Configuration

### Environment Variables
\`\`\`bash
# Database
DATABASE_URL=postgresql://username:password@localhost:6000/fiu_system
DB_POOL_MAX=20
DB_POOL_MIN=5

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
SESSION_TIMEOUT_HOURS=24
PASSWORD_RESET_EXPIRES_HOURS=1

# Server Configuration
PORT=5000
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379
\`\`\`

### PM2 Configuration
\`\`\`javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'fiu-backend',
    script: './src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
\`\`\`

### Docker Configuration
\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads logs

# Set permissions
RUN chown -R node:node /app
USER node

EXPOSE 5000

CMD ["npm", "start"]
\`\`\`

### Database Migration Strategy
\`\`\`bash
# Run migrations in order
psql -d fiu_system -f scripts/01-create-database.sql
psql -d fiu_system -f scripts/02-create-users-table.sql
# ... continue with all scripts in order

# For production deployments
npm run db:migrate
npm run db:seed:production
\`\`\`

## Environment Variables

See `.env.example` for all available environment variables and their descriptions.

## 📊 Performance Benchmarks

### Expected Performance Metrics
- **Authentication**: < 100ms response time
- **Report Creation**: < 500ms response time
- **File Upload**: < 2s for 10MB file
- **Database Queries**: < 50ms for simple queries, < 200ms for complex joins
- **WebSocket Messages**: < 10ms delivery time
- **Concurrent Users**: 1000+ with proper scaling

### Monitoring Recommendations
- **APM**: New Relic, DataDog, or Elastic APM
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Metrics**: Prometheus + Grafana
- **Uptime**: Pingdom, UptimeRobot
- **Error Tracking**: Sentry, Bugsnag

This technical documentation provides a comprehensive overview of the FIU backend system architecture, implementation details, and deployment considerations. The system is designed for scalability, security, and maintainability in a production environment.
