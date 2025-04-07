import React from 'react';
import { useParams } from 'react-router-dom';

function MovieDetails() {
  const { id } = useParams();
  return (
    <div>
      <h1>Film {id}</h1>
      <p>Information om film {id}...</p>
    </div>
  );
}

export default MovieDetails;