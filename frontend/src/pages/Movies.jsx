import React from 'react';
import { Link } from 'react-router-dom';

function Movies() {
  // Exempeldata
  const filmList = [{ id: 1 }, { id: 2 }, { id: 3 }];

  return (
    <div>
      <h1>Filmer</h1>
      <ul>
        {filmList.map((film) => (
          <li key={film.id}>
            <Link to={`/movies/${film.id}`}>Film {film.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Movies;