# 📰 News Portal – React + Spring Boot  

A full-stack **News Portal** built with **Spring Boot (backend)** and **React (frontend)**.  
It includes an **Admin Panel + Client Panel**, uses **PostgreSQL** as the database, and integrates **Cloudinary** for image uploads.  

---

## 🚀 Features
- 🔑 User Authentication (Login/Register)  
- 📰 News Management (Create, Edit, Delete, List)  
- 🖼️ Cloudinary integration for image storage  
- 📊 Admin panel for managing posts & users  
- 📱 Responsive React frontend (works on mobile & desktop)  
- 🗄️ PostgreSQL database  

---

## ⚙️ Requirements
Make sure you have these installed before setup:  
- [Java 17+](https://adoptium.net/)  
- [Maven 3.8+](https://maven.apache.org/)  
- [Node.js 16+](https://nodejs.org/)  
- [PostgreSQL 13+](https://www.postgresql.org/download/)  
- [Cloudinary account](https://cloudinary.com/) (Free tier works fine)  

---

## 🗄️ Backend Setup (Spring Boot)

1. Navigate to the backend folder:  
   ```bash
   cd backend

Create a PostgreSQL database:

CREATE DATABASE newsdb;


Open src/main/resources/application.properties and configure:

spring.datasource.url=jdbc:postgresql://localhost:5432/newsdb
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Cloudinary Config
cloudinary.cloud_name=YOUR_CLOUD_NAME
cloudinary.api_key=YOUR_API_KEY
cloudinary.api_secret=YOUR_API_SECRET


Run the backend:

mvn spring-boot:run


➡ Backend will be running at: http://localhost:8080

💻 Frontend Setup (React)

Navigate to the frontend folder:

cd frontend


Install dependencies:

npm install


Configure API base URL in src:

const API_URL = "http://localhost:8080/api";
export default API_BASE_URL;


Run the frontend:

npm start


➡ Frontend will be running at: http://localhost:3000

🔑 Admin Access

Default admin credentials (can be changed later in DB):

Email: admin@news.com  
Password: admin123  

📦 Build for Production
Frontend
npm run build


This creates a build/ folder for deployment.

Backend
mvn clean package


This generates a JAR file inside target/.

📸 Screenshots

