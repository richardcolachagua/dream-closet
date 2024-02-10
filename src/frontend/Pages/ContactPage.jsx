import React from "react";
import { Typography, Box, TextField, Button, Grid } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const ContactPage = () => {
  return (
    <>
      <Header />
      <Grid container direction="column" justify="center" alignItems="center">
        <Typography
          variant="h3"
          marginTop={"70px"}
          marginLeft={"15px"}
          align="left"
          sx={{
            fontWeight: "bold",
            color: "white",
            fontFamily: "Helvetica",
          }}
        >
          Contact us
        </Typography>
        <Box>
          <EmailIcon />
          <Typography
            variant="h6"
            marginLeft={"15px"}
            sx={{
              fontFamily: "Helvetica",
              color: "white",
            }}
          >
            For support, contact us at dreamcloset@gmail.com
          </Typography>
          <TextField
            variant="filled"
            id="contact"
            margin="normal"
            type="contact"
            fullWidth
            required
            sx={{
              width: "100%",
              height: "500%",
              maxWidth: "500px",
              backgroundColor: "grey",
            }}
          />
          <Button variant="contained">Submit</Button>
        </Box>
        <Footer />
      </Grid>
    </>
  );
};

export default ContactPage;
