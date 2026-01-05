# Security Configuration and Best Practices

## Important Security Notes

### 1. JWT Secret
- **CRITICAL**: Change the `JWT_SECRET` in `.env` file before deployment
- Generate a strong random secret using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### 2. Password Security
- Passwords are hashed using bcryptjs with salt rounds of 10
- Minimum password length: 6 characters (enforced in validation)
- Never store plain text passwords

### 3. Database Security
- SQLite database file is stored in `Backend/data/timetable.db`
- Auto-saves every 5 seconds to prevent data loss
- Foreign key constraints enabled
- Input validation on all user inputs

### 4. API Security
- JWT token authentication required for protected routes
- Tokens expire after 7 days
- CORS enabled with configurable origins
- Rate limiting recommended (not implemented - add if needed)

### 5. Electron Security
- Node integration disabled
- Context isolation enabled
- Remote module disabled
- External navigation blocked
- New window creation prevented

### 6. User Permissions
- Two roles: 'student' and 'admin'
- Users can only access their own tasks
- Admin features can be extended as needed

### 7. Data Validation
- Input sanitization on all endpoints
- express-validator used for validation
- SQL injection prevention (parameterized queries)

## Recommended Additional Security (for OS Integration)

1. **File System Permissions**: 
   - Restrict database file access to application user only
   - Set proper file permissions: `chmod 600 Backend/data/timetable.db`

2. **Network Isolation**:
   - Server runs on localhost only by default
   - No external network access required

3. **AppArmor/SELinux Profile** (Linux):
   - Create security profile for the application
   - Restrict file system and network access

4. **Sandboxing**:
   - Consider running in a containerized environment
   - Use systemd service with security restrictions

## Security Checklist Before Deployment

- [ ] Changed JWT_SECRET to a strong random value
- [ ] Set proper file permissions on database directory
- [ ] Reviewed and configured CORS origins
- [ ] Disabled development mode (NODE_ENV=production)
- [ ] Tested authentication and authorization
- [ ] Verified database encryption if needed
- [ ] Set up regular backups of database file
- [ ] Configured firewall rules (if applicable)
- [ ] Reviewed all API endpoints for vulnerabilities
- [ ] Tested input validation on all forms

## Vulnerability Reporting

If you discover a security vulnerability, please report it to your security team immediately.
