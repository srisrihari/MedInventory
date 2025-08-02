# 🚨 IMMEDIATE FIX - Run These Commands

## Step 1: Install Missing Package
```bash
sudo apt update
sudo apt install python3-venv
```

## Step 2: Clean Setup
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-minimal.txt
```

## Step 3: Start Server
```bash
python3 start_server.py
```

## Expected Output
```
🚀 Starting MedInventory Backend API...
📝 Environment: Development
🌐 API Documentation: http://localhost:8000/docs
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## ✅ Success Check
Open http://localhost:8000/docs - you should see the API documentation.

**These 3 steps will fix all the errors you encountered!** 🎉