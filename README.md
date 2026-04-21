# JanMitra - Civic Issue Reporting & Resolution System

🏆 **Ranked 6th out of 520 teams at Smart India Hackathon 2025 (Internal Round)**

JanMitra is a scalable, full-stack civic engagement platform designed to empower citizens to report, track, and resolve civic issues in their communities. By bridging the gap between citizens and local authorities, JanMitra ensures better community engagement, transparency, and faster resolution of public problems like potholes, water supply disruptions, broken streetlights, and more.

## 🚀 Features

- **Issue Reporting:** Citizens can easily report civic issues by providing details, exact locations, and uploading photos.
- **Location & Mapping Integration:** Powered by Mapbox, allowing users to pinpoint issue locations on an interactive map and search for nearby issues using their current location or address.
- **Real-Time Tracking:** Track the status of reported issues (Pending, In Progress, Resolved).
- **Interactive Dashboard:** View overall statistics, including total issues raised, resolved issues, pending issues, and active citizens.
- **Search & Filter:** Search for issues based on area, city, or pincode. Find issues near you within a specific radius.
- **User Authentication:** Secure signup and login system using Passport.js with distinct roles (Citizen, Admin).
- **Admin Panel:** A dedicated dashboard for administrators to manage and update the status of reported issues.
- **Community Engagement:** Users can comment on issues to provide updates, context, or community feedback.

## 🛠️ Tech Stack

- **Frontend:**
  - React.js
  - Tailwind CSS for responsive, cross-device design

- **Backend:**
  - Node.js
  - Express.js (Web framework)
  - RESTful API integration

- **Database:**
  - MongoDB (NoSQL Database)

- **Mapping & Location:**
  - Mapbox
  - Leaflet.js for interactive mapping

- **Version Control & Management:**
  - Git for version control

## 📋 Prerequisites

Make sure you have the following installed on your local machine:
- Node.js (v14 or higher)
- MongoDB (Local instance or MongoDB Atlas account)
- Mapbox Account (for API Token)
- Cloudinary Account (for image storage API keys)

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SayanDcodeR/SIHReportSystem.git
   cd JanMitra
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:
   ```env
   NODE_ENV=development
   PORT=8000
   ATLASDB_URL=your_mongodb_connection_string
   MAP_TOKEN=your_mapbox_access_token
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the application:**
   ```bash
   node app.js
   # Or using nodemon for development
   npx nodemon app.js
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:8000`

## 📁 Project Structure

```
JanMitra/
├── models/             # Mongoose database models (User, Issue, Comment)
├── public/             # Static assets (CSS, JS, Images)
├── routes/             # Express route handlers
├── views/              # EJS templates and layouts
│   ├── layouts/        # Boilerplate layout files
│   └── ...             # View pages (home, report, login, signup, etc.)
├── app.js              # Main application entry point
├── cloudConfig.js      # Cloudinary configuration
├── middleware.js       # Custom Express middlewares (Authentication, Authorization)
├── package.json        # Project metadata and dependencies
└── .env                # Environment variables (Ignored in Git)
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/SayanDcodeR/SIHReportSystem/issues) if you want to contribute.

## 📝 License

This project is licensed under the ISC License.
