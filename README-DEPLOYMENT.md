# Flow Car Service Manager - Deployment Setup

This project has been configured for multiple deployment options. Below is a quick reference guide.

## 🚀 Quick Start

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 📦 Deployment Options

### 1. Vercel (Recommended)
- Push code to GitHub
- Connect repository to Vercel
- Set environment variables:
  - `NEXT_PUBLIC_API_URL`: Your backend API URL
- Deploy!

### 2. Docker
```bash
# Build
npm run docker:build

# Run
npm run docker:run

# Test
npm run docker:test
```

### 3. Traditional Server
```bash
./build-and-test.sh
cd dist
npm start
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Docker build configuration |
| `docker-compose.yml` | Docker Compose setup |
| `vercel.json` | Vercel deployment config |
| `next.config.js` | Next.js configuration |
| `.env.example` | Environment variables template |

## 🌐 Environment Variables

Create a `.env.local` file for development:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

For production, set these in your deployment platform.

## 🧪 Testing Deployment

### Docker Test
```bash
./test-docker.sh
```

### Build Test
```bash
./build-and-test.sh
```

## 📊 Health Check

The application includes a health check endpoint:
```
GET /api/health
```

Returns:
```json
{
  "uptime": 123.45,
  "message": "OK",
  "timestamp": "2024-12-26T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container |
| `npm run docker:test` | Test Docker deployment |
| `npm run deploy:build` | Full build and test |
| `npm run lint` | Run ESLint |

## 🔒 Security Notes

1. Never commit `.env` files
2. Use `.env.example` as a template
3. Rotate secrets regularly
4. Run `npm audit` regularly

## 📞 Support

For deployment issues:
1. Check the `DEPLOYMENT.md` file
2. Review container logs
3. Test health endpoint
4. Verify environment variables

---

**Next.js Version**: 15.5.9  
**React Version**: 18.2.0  
**Build Output**: Standalone  
**Health Check**: Enabled  
**Docker Support**: Yes  
**Vercel Support**: Yes