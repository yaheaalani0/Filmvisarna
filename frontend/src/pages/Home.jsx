import React from 'react';
import { Grid, Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
  const films = [
    { id: 1, title: 'Film 2', description: 'Beskrivning av film 2' },
    { id: 2, title: 'Film 3', description: 'Beskrivning av film 3' },
    { id: 3, title: 'Film 4', description: 'Beskrivning av film 4' },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Aktuella Filmer
      </Typography>
      <Grid container spacing={2}>
        {films.map((film) => (
          <Grid item xs={12} md={4} key={film.id}>
            <Card>
              {/* CardActionArea gör kortet klickbart */}
              <CardActionArea component={Link} to={`/movies/${film.id}`}>
                <CardContent>
                  <Typography variant="h6">{film.title}</Typography>
                  <Typography variant="body2">{film.description}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default Home;