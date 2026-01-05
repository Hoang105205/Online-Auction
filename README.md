# 🔨 AUCTIFY - ONLINE AUCTION SYSTEM

**Auctify** is a modern online auction platform connecting Bidders and Sellers in a transparent, secure, and real-time environment. The project is built using the **MERN Stack** architecture (MongoDB, Express, React, Node.js).

---

## 🌟 OVERVIEW

The project focuses on solving e-commerce challenges through an auction model, allowing users to place bids on favorite items or list their own products for sale. The system integrates high-security features such as OTP verification, Google OAuth, and anti-spam protection using reCAPTCHA.

---

## 🚀 KEY FEATURES

### 1. Account Management & Security
* **Registration/Login:** Supports quick login via Google OAuth.
* **2-Factor Authentication:** Account activation and password recovery via OTP sent to Email.
* **User Roles:** Clear role-based authorization (Admin, Seller, Bidder).
* **Protection:** Integrated Google reCAPTCHA for anti-spam bot protection.

### 2. Auction Floor
* **Real-time Bidding:** Instantly updates bid amounts and the highest bidder.
* **Auto-extension:** Automatically extends the auction time if a bid is placed in the final minutes (prevents "sniping").
* **Bid History:** Detailed tracking of bid logs.

### 3. Product Management (Seller)
* **Product Listing:** Create listings with rich text descriptions using TinyMCE and multi-image upload via Cloudinary.
* **Category Management:** Classify products by Category and Sub-category.

### 4. User Utilities
* **Watchlist:** Save favorite products to track their status.
* **Feedback System:** Reputation rating system between buyers and sellers.
* **Search & Filter:** Smart search and multi-criteria product filtering.

---

## 💻 TECH STACK

### Frontend (Client)
* **Core:** ReactJS, Vite.
* **UI/UX:** Tailwind CSS (Responsive Design).
* **Libraries:** Axios, React-Router-Dom.

### Backend (Server)
* **Runtime:** Node.js.
* **Framework:** Express.js.
* **Authentication:** Passport.js (Google Strategy), JWT (JSON Web Token).
* **Email Service:** Nodemailer (SMTP Gmail).
* **Security:** Bcrypt, Cors.

### Database & Cloud
* **Database:** MongoDB.
* **Storage:** Cloudinary (Image storage).

---

## 👥 TEAM MEMBERS

| No. | Full Name |
|:---:|:---|
| 1 | **Lưu Huy Hoàng** | 
| 2 | **Dương Gia Huy** | 
| 3 | **Nguyễn Hiếu Thuận** | 
| 4 | **Nguyễn Chí Đức** | 

---

## ⚙️ SETUP GUIDE

> **⚠️ IMPORTANT NOTE:**
>
> For detailed instructions on setting up the environment, configuring environment variables (`.env`), seeding the database, and running the project, please refer to the accompanying guide file:
>
> 👉 **`readme.txt`**

---
*© 2026 Auctify Project.*