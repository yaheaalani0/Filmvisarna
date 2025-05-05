import React from "react";
import { Box, Container, Typography, Link } from "@mui/material";

function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: "#1c1c1c",
        color: "white",
        py: 3,
        mt: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ textAlign: "center" }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} Filmvisarna. Alla rättigheter förbehållna.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;