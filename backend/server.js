import express from 'express';
import cors from 'cors';
import movieRoutes from './routes/movies.js';
import showingRoutes from './routes/showings.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/movies', movieRoutes);
app.use('/api/showings', showingRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server körs på http://localhost:${PORT}`);
});