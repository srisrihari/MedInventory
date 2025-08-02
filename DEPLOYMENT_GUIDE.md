# 🚀 DEPLOYMENT GUIDE
## MedInventory - Free Hosting Setup

This guide will help you deploy your MedInventory application for free using:
- **Backend**: Render (Python/FastAPI)
- **Frontend**: Vercel (React/TypeScript)

---

## 📋 PREREQUISITES

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
4. **Supabase Project**: Your existing Supabase database

---

## 🔧 BACKEND DEPLOYMENT (RENDER)

### Step 1: Prepare Your Repository

Ensure your backend folder structure is correct:
```
backend/
├── app/
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── config.py
│   ├── database.py
│   └── main.py
├── requirements.txt
├── gunicorn_config.py
└── build.sh
```

### Step 2: Deploy to Render

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect Your Repository**
   - Connect your GitHub account
   - Select your MedInventory repository
   - Choose the repository

3. **Configure the Service**
   ```
   Name: medinventory-backend
   Environment: Python 3
   Build Command: cd backend && pip install -r requirements.txt
   Start Command: cd backend && gunicorn app.main:app -c gunicorn_config.py
   ```

4. **Set Environment Variables**
   Click "Environment" tab and add:
   ```
   APP_ENV=production
   SECRET_KEY=your-super-secret-key-here
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   TOGETHER_API_KEY=your-together-ai-key
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your service URL (e.g., `https://medinventory-backend.onrender.com`)

### Step 3: Test Backend

Test your deployed backend:
```bash
curl https://your-render-url.herokuapp.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "production",
  "database": "connected",
  "ai_services": "available"
}
```

---

## 🎨 FRONTEND DEPLOYMENT (VERCEL)

### Step 1: Prepare Frontend

Ensure your frontend is ready:
```
/
├── src/
├── package.json
├── vite.config.ts
├── vercel.json
└── index.html
```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Repository**
   - Connect your GitHub account
   - Select your MedInventory repository
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: ./ (leave empty)
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_API_URL=https://your-render-url.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Test Frontend

1. Visit your Vercel URL
2. Test login functionality
3. Verify API connections work

---

## 🔐 ENVIRONMENT VARIABLES

### Backend (Render) Environment Variables

```bash
# Application
APP_ENV=production
SECRET_KEY=your-super-secret-key-here

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services
TOGETHER_API_KEY=your-together-ai-key
TOGETHER_BASE_URL=https://api.together.xyz
AI_MODEL=meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8

# Optional Services
SENDGRID_API_KEY=your-sendgrid-key
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend (Vercel) Environment Variables

```bash
# API Configuration
VITE_API_URL=https://your-render-url.onrender.com
```

---

## 🧪 TESTING DEPLOYMENT

### 1. Backend Health Check
```bash
curl https://your-render-url.onrender.com/health
```

### 2. API Documentation
Visit: `https://your-render-url.onrender.com/docs`

### 3. Frontend Test
1. Open your Vercel URL
2. Try logging in with demo credentials
3. Test all major features

### 4. CORS Test
```bash
curl -H "Origin: https://your-vercel-url.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-render-url.onrender.com/health
```

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### 1. Backend Won't Start
- Check environment variables are set correctly
- Verify Supabase credentials
- Check Render logs for errors

#### 2. CORS Errors
- Ensure frontend URL is in CORS allowed origins
- Check API URL in frontend environment variables

#### 3. Database Connection Issues
- Verify Supabase URL and keys
- Check if Supabase project is active
- Ensure RLS policies are configured

#### 4. Frontend Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

### Debug Commands

#### Backend Logs (Render)
```bash
# View logs in Render dashboard
# Or use Render CLI if available
```

#### Frontend Logs (Vercel)
```bash
# View logs in Vercel dashboard
# Check build logs for errors
```

---

## 📊 MONITORING

### Render Monitoring
- **Logs**: Available in Render dashboard
- **Metrics**: CPU, memory usage
- **Uptime**: Automatic monitoring

### Vercel Monitoring
- **Analytics**: Page views, performance
- **Functions**: API call metrics
- **Builds**: Deployment history

---

## 🔄 UPDATES & MAINTENANCE

### Automatic Deployments
Both Render and Vercel will automatically deploy when you push to your main branch.

### Manual Deployments
- **Render**: Trigger redeploy from dashboard
- **Vercel**: Push to main branch or trigger from dashboard

### Environment Variable Updates
- **Render**: Update in dashboard → redeploy
- **Vercel**: Update in dashboard → redeploy

---

## 💰 COST OPTIMIZATION

### Render Free Tier
- **750 hours/month** (enough for 24/7 operation)
- **512MB RAM**
- **0.1 CPU**
- **Auto-sleep** after 15 minutes of inactivity

### Vercel Free Tier
- **Unlimited deployments**
- **100GB bandwidth/month**
- **100GB storage**
- **No auto-sleep**

### Tips to Stay Free
1. **Optimize bundle size** (already done with code splitting)
2. **Use efficient queries** (implemented)
3. **Cache responses** (AI forecasts cached)
4. **Monitor usage** in dashboards

---

## 🎉 SUCCESS CHECKLIST

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] Health check passes
- [ ] Login functionality works
- [ ] API documentation accessible
- [ ] CORS issues resolved
- [ ] Database connection working
- [ ] AI services functional
- [ ] All features tested

---

## 📞 SUPPORT

### Render Support
- [Documentation](https://render.com/docs)
- [Community](https://community.render.com)

### Vercel Support
- [Documentation](https://vercel.com/docs)
- [Community](https://github.com/vercel/vercel/discussions)

### MedInventory Support
- Check the audit report for known issues
- Review logs for specific errors
- Test locally first before deploying

---

**Happy Deploying! 🚀**

Your MedInventory app will be live and accessible from anywhere in the world! 