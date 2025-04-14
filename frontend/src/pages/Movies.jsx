import React, { useEffect, useState } from 'react';

function Movies() {
  const [filmList, setFilmList] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const response = await fetch('http://localhost:5000/api/movies'); // Din backendroute för att hämta filmer
    const data = await response.json();
    setFilmList(data);
  };

  return (
    <div>
      <h1>Filmer</h1>
      <ul>
        {filmList.map((film) => (
          <li key={film.id}>{film.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Movies;
