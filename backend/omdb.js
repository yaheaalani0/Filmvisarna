import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Funktion för att hämta film från OMDb API
export async function fetchMovie(title) {
  const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${process.env.OMDB_API_KEY}&plot=full&r=json`;
  const response = await axios.get(url);

  if (response.data.Response === 'True') {
    return {
      title: response.data.Title,
      year: response.data.Year,
      genre: response.data.Genre,
      runtime: response.data.Runtime,
      poster: response.data.Poster,
      trailer: null, // Lägg till en giltig trailer manuellt om OMDb inte ger en
      plot: response.data.Plot, // Fullständig beskrivning
    };
  } else {
    throw new Error(`Movie not found: ${response.data.Error}`);
  }
}
