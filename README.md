# 🏠 Vacanzy - Premium Vacation Rental Platform

A complete full-stack vacation rental booking platform with real payment processing, email confirmations, and comprehensive dashboard management.

## ✨ Key Features

- 🏠 **Property Management** - Full CRUD operations for vacation rentals
- 👤 **User Authentication** - Secure login/register with Passport.js
- 💳 **Payment Processing** - Real payment integration with Razorpay
- 📧 **Email Confirmations** - Automated booking confirmations via EmailJS
- 📊 **Dual Dashboard** - Separate guest and host management interfaces  
- 🖼️ **Image Upload** - Cloudinary integration for property photos
- ⭐ **Review System** - User ratings and feedback for properties
- 📱 **Responsive Design** - Mobile-optimized Bootstrap interface

## 🚀 Technical Implementation

### **Frontend Architecture**
- **Technologies**: HTML5, CSS3, JavaScript ES6, Bootstrap 5, EJS
- **Features**: 
  - Responsive design across all devices
  - Interactive booking calendar
  - Real-time payment processing UI
  - Dynamic dashboard with guest/host toggle
  - Professional email templates

### **Backend Architecture** 
- **Technologies**: Node.js, Express.js, MongoDB, Mongoose
- **Features**:
  - RESTful API architecture
  - Secure authentication with Passport.js
  - Session management with MongoDB store
  - File upload handling with Multer
  - Payment webhook processing

### **Database Design**
- **Platform**: MongoDB Atlas (Cloud Database)
- **Models**: Users, Listings, Reservations, Reviews
- **Features**:
  - Optimized schema design
  - Data validation with Joi
  - Automated booking ID generation
  - Payment tracking and history

### **Payment Integration**
- **Service**: Razorpay Payment Gateway
- **Features**:
  - Secure payment processing
  - Order creation and verification
  - Payment signature validation
  - Automated confirmation workflow

### **Email System**
- **Service**: EmailJS
- **Features**:
  - Professional booking confirmations
  - Automated email templates
  - Real-time delivery status
  - Mobile-responsive email design

## 🌐 Live Deployment

**Live Application**: [https://vacanzy.onrender.com](https://vacanzy.onrender.com)

- **Hosting**: Render (Cloud Platform)
- **Database**: MongoDB Atlas
- **CDN**: Cloudinary for images
- **SSL**: Secure HTTPS encryption

## 🛠️ Technologies & Packages

**Core Stack:**
- Node.js & Express.js
- MongoDB & Mongoose
- EJS Templating
- Bootstrap 5

**Authentication & Security:**
- Passport.js
- Express Session
- Connect Flash
- Cookie Parser

**Payment & Email:**
- Razorpay Integration
- EmailJS Service

**File Management:**
- Multer
- Cloudinary

**Validation & Environment:**
- Joi Validation
- Dotenv

## 🚀 Getting Started

1. **Clone Repository**
   ```bash
   git clone https://github.com/Nk-dir/Vacanzy.git
   cd Vacanzy
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env` file with required variables

4. **Run Application**
   ```bash
   npm start
   ```

## 👨‍💻 Developer

**Created by**: [Nk-dir](https://github.com/Nk-dir)

This project demonstrates advanced full-stack development skills including real payment processing, email automation, and production deployment. Built as a complete vacation rental platform ready for real-world usage.

---

**⭐ Star this repository if you found it helpful!**