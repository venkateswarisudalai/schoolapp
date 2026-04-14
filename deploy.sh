#!/bin/bash

# Mayuri Playschool App - Quick Deployment Script
# This script builds and deploys your app to Firebase Hosting

echo "🚀 Mayuri Playschool App - Deployment Script"
echo "=============================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI found"
echo ""

# Check if logged in
echo "🔐 Checking Firebase login..."
firebase projects:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase"
    echo "🔑 Please login..."
    firebase login
fi

echo "✅ Logged in to Firebase"
echo ""

# Build the app
echo "🏗️  Building production app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "🌐 Your app is live!"
echo "📱 Visit: https://school-c0203.web.app"
echo ""
echo "🎉 Done!"
