# Filmvisarna

Filmvisarna is a full-stack cinema booking application where users can browse movies, view details, and book tickets with seat selection. The app features user authentication, an admin dashboard, and a modern dark-themed interface.

---

## Features

- **Browse Movies:** See all available movies with posters, details, and trailers.
- **Book Tickets:** Select movie, date, time, ticket types (adult, child, student), and seats. The system ensures you select the correct number of seats for your tickets.
- **User Authentication:** Register and log in to manage your bookings.
- **My Bookings:** View, edit, or delete your bookings. Each booking gets a unique reference.
- **Admin Dashboard:** Admins can view and manage all bookings.
- **Responsive Design:** Works well on both desktop and mobile.
- **Dark Theme:** Consistent black background and white text for a cinematic feel.

---

## Tech Stack

- **Frontend:** React, Material-UI, React Router
- **Backend:** Node.js, Express, better-sqlite3 (SQLite)
- **Authentication:** JWT-based
- **Database:** SQLite (file-based, persistent)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/yaheaalani0/Filmvisarna.git
cd Filmvisarna
```

### 2. Install dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Start the application

#### Start the backend server

```bash
cd backend
npm start
```
- The backend will start on [http://localhost:5000](http://localhost:5000)
- On first run, the database and tables will be created automatically.

#### Start the frontend

```bash
cd ../frontend
npm run dev
```
- The frontend will start on [http://localhost:5173](http://localhost:5173) (or similar, depending on your setup)

---

## Usage

- **Register** a new user or log in.
- **Browse** movies and select a showtime.
- **Choose** ticket types and select your seats.
- **View** your bookings under "Mina Bokningar".
- **Admins** can access the admin dashboard for all bookings.

---

## Development Notes

- If you change the database schema, you may need to delete `backend/database.db` to reset tables and reseed data.
- All styling is handled globally via `App.css` and Material-UI theming.
- The backend uses SQLite for simplicity and local persistence.

---

