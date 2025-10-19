# 📧 Email Configuration Setup Guide

## 🚨 Current Issue
The OTP system is failing because email configuration is not set up. Here are the solutions:

## 🔧 Quick Development Solution (Recommended for Testing)

The system now has a **development mode fallback**. When email is not configured, OTPs will be logged to the console instead of being sent via email.

### How to Test:
1. Start your backend server
2. Try to register a new user
3. Check your backend console - you'll see the OTP printed there
4. Use that OTP in the verification page

**Example Console Output:**
```
🔐 DEVELOPMENT MODE - OTP for user@example.com: 123456
📧 Email configuration not set up. OTP logged to console for development.
```

## 📧 Production Email Setup (Gmail)

### Step 1: Create App Password
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to "App passwords" section
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Step 2: Create .env File
Create a `.env` file in the `backend` folder with:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/ceylonmart

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Step 3: Replace Values
- Replace `your-email@gmail.com` with your actual Gmail
- Replace `your-16-character-app-password` with the app password from Step 1
- Replace `your-super-secret-jwt-key-here` with a secure random string

## 🧪 Testing the Setup

### Development Mode (No Email Setup Required)
1. Start backend: `npm start`
2. Try registration - OTP will appear in console
3. Use console OTP for verification

### Production Mode (With Email Setup)
1. Set up `.env` file as above
2. Restart backend server
3. Try registration - OTP will be sent to email
4. Check email for OTP

## 🔍 Troubleshooting

### Common Issues:
1. **"Failed to send OTP"** - Email not configured (use development mode)
2. **"Invalid credentials"** - Wrong app password or email
3. **"Connection timeout"** - Check internet connection
4. **"Authentication failed"** - Enable 2FA and use app password

### Development Mode Benefits:
- ✅ No email setup required
- ✅ OTP visible in console
- ✅ Perfect for testing
- ✅ No external dependencies

### Production Mode Benefits:
- ✅ Real email delivery
- ✅ Professional user experience
- ✅ Production-ready
- ✅ Secure OTP delivery

## 🎯 Recommendation

For **development and testing**: Use the development mode (no setup required)
For **production deployment**: Set up proper email configuration

The system will automatically detect if email is configured and use the appropriate method.





