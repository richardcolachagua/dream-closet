import React from "react";
import { Typography, Box, TextField, Button, Grid } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const ContactPage = () => {
  return (
    <>
      <Header />
      <Box sx={{ padding: "50px" }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "white" }}>
          Contact Us
        </Typography>
        <Box sx={{ marginTop: 4 }}>
          <Grid container spaceing={2}>
            <Grid item xs={12}>
              <TextField label="Your Name" variant="outlined" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Your Email" variant="outlined" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Your Message"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <Button variant="contained" color="primary">
            Send Message
          </Button>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default ContactPage;
