import './dbSetup.js'; // Kör seed-koden
import express from 'express';
import cors from 'cors';
import movieRoutes from './src/routes/movies.js';
import showingRoutes from './src/routes/showings.js';
import bookingRoutes from './src/routes/bookings.js';
import authRoutes from './src/routes/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/movies', movieRoutes); // Route for movies
app.use('/api/showings', showingRoutes); // Route for showings
app.use('/api/bookings', bookingRoutes); // Route for bookings
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Filmvisarna API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servern kör på port ${PORT}`);
});