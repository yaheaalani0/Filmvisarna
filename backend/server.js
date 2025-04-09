import express from 'express';
import cors from 'cors';
import movieRoutes from './src/routes/movies.js';
import showingRoutes from './src/routes/showings.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/movies', movieRoutes); // Route for movies
app.use('/api/showings', showingRoutes); // Route for showings

app.get('/', (req, res) => {
  res.send('Welcome to the Filmvisarna API!');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});