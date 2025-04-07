import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Funktion för att hämta film från OMDb API
export async function fetchMovie(title) {
  try {
    const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}&plot=full&r=json`;
    const response = await axios.get(url);
    if (response.data.Response === 'True') {
      return response.data;
    } else {
      throw new Error(`Filmen kunde inte hittas: ${response.data.Error}`);
    }
  } catch (error) {
    console.error('Fel vid hämtning av film:', error.message);
    throw new Error('Kunde inte hämta filmdata från OMDb API');
  }
}
