# Carbonly 🌱

### AI-Powered Carbon Footprint Tracking Platform

Carbonly is a full-stack web application that helps individuals **track, analyze, and reduce their carbon footprint** based on their lifestyle activities.
The system collects weekly user data such as transportation distance, electricity usage, internet usage, water consumption, and air travel, then calculates estimated carbon emissions using a **machine learning model**.

The platform visualizes carbon emission trends and provides **AI-based recommendations** to encourage more sustainable lifestyle choices.

# Project Overview

Climate change is strongly influenced by individual lifestyle decisions such as transportation habits, electricity consumption, and travel patterns. However, most people lack tools that allow them to understand the **environmental impact of their daily activities**.

Carbonly addresses this problem by providing a **data-driven platform** where users can:

• Track weekly lifestyle activities
• Estimate carbon emissions using machine learning
• Visualize emission trends through graphs
• Receive recommendations for reducing emissions

The goal of the project is to **increase environmental awareness and promote sustainable behavior** through technology.


# System Architecture

The application follows a **full-stack architecture** composed of three main components:

Frontend (User Interface)
Backend (API & Authentication)
Machine Learning Model (Emission Prediction)

```
User → Frontend (HTML/CSS/JS)
        ↓
Backend API (Node.js + Express)
        ↓
Database (MongoDB)
        ↓
Machine Learning API (Python)
        ↓
Carbon Emission Prediction
        ↓
Dashboard Visualization (Chart.js)
```


# Machine Learning Model Repository

The machine learning model used for carbon emission prediction is developed and maintained in a separate repository.

Machine Learning Repository:
https://github.com/Mishti-05/Carbon-emissions

The backend communicates with this model through API calls to generate carbon emission predictions based on user input data.


# Key Features

### User Authentication

Secure user login and registration using:

• JWT (JSON Web Tokens)
• Password hashing with bcrypt

This ensures secure authentication and session management.


### Carbon Footprint Calculation

Users enter weekly activity data such as:

• Vehicle distance travelled
• TV / PC usage
• Internet usage
• Water consumption frequency
• Air travel frequency

This data is sent to the backend API which communicates with the **machine learning model** to predict carbon emissions.


### Data Visualization

Carbon emission results are displayed through an interactive dashboard using **Chart.js**, allowing users to see emission trends over multiple weeks.


### Personalized Recommendations

Based on the predicted emissions, the system provides **AI-generated sustainability recommendations** such as reducing electricity usage or optimizing travel habits.


### User Activity History

The dashboard stores weekly activity records so users can track their past data and monitor progress.

Each user only sees **their own stored history**, implemented using **JWT-based user identification**.


# Technologies Used

## Frontend

• HTML5
• CSS3
• JavaScript
• Chart.js

Used for building the interactive dashboard, login system, and visualization components.


## Backend

• Node.js
• Express.js
• JWT Authentication
• bcrypt (password hashing)

Responsible for handling API requests, authentication, and communication with the machine learning model.


## Database

• MongoDB
• Mongoose ORM

Used to store:

• User credentials
• Weekly activity data
• Carbon emission records


## Machine Learning

• Python
• Scikit-Learn

A trained ML model estimates carbon emissions based on lifestyle inputs.

The backend sends user data to the ML pipeline and retrieves emission predictions.


# Project Repository Structure

```
Carbonly
│
├── backend
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── index.html
│   ├── dashboard.html
│   ├── login.html
│   ├── signup.html
│   ├── login.css
│   ├── signup.css
│   ├── style.css
│   ├── login.js
│   ├── signup.js
│   ├── script.js
│   ├── forgot-password.html
│   └── reset-password.html
│
├── images
│
├── results
│   └── screenshots
│
├── README.md
└── .gitignore
```


# Installation & Setup

## 1 Clone the Repository

```
git clone https://github.com/yourusername/carbonly.git
cd carbonly
```


## 2 Install Backend Dependencies

```
cd backend
npm install
```


## 3 Start Backend Server

```
node server.js
```

The backend will start on:

```
http://localhost:5000
```


## 4 Run Machine Learning Service

The machine learning model is hosted in a separate repository.

Clone and run the ML service:

```
git clone https://github.com/Mishti-05/Carbon-emissions
cd Carbon-emissions
python main.py
```

This service provides the carbon emission prediction API used by the backend.

## 5 Launch Frontend

Open the frontend homepage:

```
frontend/index.html
```

in your browser.


# How the System Works

### Step 1 — User Login

The user creates an account or logs in securely using JWT authentication.


### Step 2 — Enter Weekly Data

Users input their weekly lifestyle activities on the dashboard.

Example inputs include:

• Distance traveled by vehicle
• Screen time
• Internet usage
• Water consumption habits
• Air travel frequency


### Step 3 — Emission Prediction

The frontend sends data to the backend API, which forwards it to the ML model for prediction.


### Step 4 — Visualization

The predicted carbon emissions are displayed on the dashboard using graphs.


### Step 5 — Recommendations

AI recommendations are generated to help users reduce their environmental impact.


# Screenshots

Example system outputs can be found in the **results/** folder.

These include:

• Homepage interface
• Login page
• Carbon dashboard
• Graph visualization
• Recommendation system


# Future Improvements

Potential upgrades for the system include:

• Real-time carbon emission tracking
• Mobile responsive interface improvements
• Deployment on cloud infrastructure (AWS / GCP)
• Integration with real environmental datasets
• Advanced ML models for more accurate predictions
• Gamification features to motivate sustainable behavior


# Contributors

**Dhruv Gupta**  
Backend Development, Authentication System (JWT & bcrypt), MongoDB Database Integration, Dashboard Logic Implementation, Carbon Emission Graph Integration (Chart.js)

**Akshhaya Isa**  
Frontend Development, UI/UX Design, Dynamic Animations,  Dashboard Interface, Homepage Design

**Shubhangini Mehta**  
Machine Learning Model Development for Carbon Emission Prediction


# License

This project is developed for academic and educational purposes.
