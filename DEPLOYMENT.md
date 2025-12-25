# Flow Car Service Manager - Deployment Guide

This document provides instructions for deploying the Flow Car Service Manager frontend application.

## Deployment Options

### 1. Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository with the code

#### Steps
1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   In the Vercel project settings, add the following environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your application will be live at `https://your-project.vercel.app`

### 2. Docker Deployment

#### Prerequisites
- Docker installed
- Docker Compose (optional)

#### Building the Docker Image
```bash
# Build the image
docker build -t flow-car-service-frontend .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-backend-api.com/api \
  flow-car-service-frontend
```

#### Docker Compose Example
Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
      - NODE_ENV=production
    restart: unless-stopped
```

### 3. Traditional Server Deployment

#### Prerequisites
- Node.js 18+ installed
- npm or yarn

#### Steps
1. **Build the Application**
   ```bash
   npm install
   npm run build
   ```

2. **Start the Production Server**
   ```bash
   npm start
   ```

3. **Using PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "flow-car-service" -- start
   pm2 save
   pm2 startup
   ```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api` | Yes |
| `NODE_ENV` | Node environment | `development` | No |
| `PORT` | Port to run the server | `3000` | No |

## Configuration Files

### 1. `next.config.js`
- `output: 'standalone'` - Enables standalone output for Docker
- `trailingSlash: true` - Adds trailing slashes to URLs
- `images.unoptimized: true` - Disables image optimization for static export

### 2. `vercel.json`
- Vercel-specific configuration
- Defines build settings and routes

### 3. `Dockerfile`
- Multi-stage build for production
- Uses Node.js 20 Alpine base image
- Creates optimized production image

## Build Process

1. **Development**
   ```bash
   npm run dev
   ```

2. **Production Build**
   ```bash
   npm run build
   ```

3. **Production Start**
   ```bash
   npm start
   ```

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS settings on backend
   - Ensure backend is running

2. **Build Failures**
   - Clear `.next` directory: `rm -rf .next`
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version`

3. **Docker Issues**
   - Increase Docker memory allocation
   - Use `--no-cache` flag: `docker build --no-cache -t flow-car-service-frontend .`

### Logs

- **Vercel**: Check deployment logs in Vercel dashboard
- **Docker**: `docker logs <container-id>`
- **PM2**: `pm2 logs flow-car-service`

## Monitoring

### Health Check
The application has a built-in health check at:
```
GET /
```
Returns HTTP 200 when healthy.

### Performance Monitoring
Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [Vercel Analytics](https://vercel.com/analytics) for performance insights
- Custom logging with Winston or Pino

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use `.env.example` as a template
   - Rotate secrets regularly

2. **Dependencies**
   - Regularly run `npm audit`
   - Update dependencies: `npm update`
   - Use `npm ci` for reproducible builds

3. **Network Security**
   - Use HTTPS in production
   - Configure proper CORS headers
   - Implement rate limiting if needed

## Backup and Recovery

### Regular Backups
1. **Code**: GitHub repository
2. **Environment Variables**: Store in password manager
3. **Database**: Follow backend backup procedures

### Recovery Steps
1. Restore from latest Git commit
2. Recreate environment variables
3. Rebuild and redeploy

## Support

For issues or questions:
1. Check this documentation
2. Review application logs
3. Contact development team

---

**Last Updated**: December 2024
**Version**: 1.0.0