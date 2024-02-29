import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const About = () => {
  return (
    <>
      <Header />
      <Box
        sx={{
          padding: "20px",
          width: "50%",
          height: "40%",
          bgcolor: "purple",
          marginBottom: "50px",
          borderRadius: "16px",
          border: "2px solid white",
        }}
      >
        <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>
          What is Dream Closet?
        </Typography>
        <Typography variant="body1" sx={{ color: "white" }}>
          Dream Closet is an AI-driven application that helps you find clothing
          items matching your description across various onilne stores. Simply
          describe the clothing item you're looking for, and Dream Closet will
          fetch matching results from different websites.
        </Typography>
      </Box>
      <Box
        sx={{
          padding: "50px",
          bgcolor: "purple",
          borderRadius: "16px",
          border: "2px solid white",
        }}
      >
        <Typography
          variant="h3"
          sx={{ color: "white", fontWeight: "bold", marginTop: 4 }}
        >
          How Does It Work?
        </Typography>

        <Typography variant="body1" sx={{ color: "white" }}>
          Dream Closet employs advanced algorithms to understand your
          preferences. The more you use Dream Closet, the better it gets at
          understadning your taste in clothing, providing more accurate results
        </Typography>
      </Box>
      <Box
        sx={{
          padding: "50px",
          bgcolor: "purple",
          borderRadius: "16px",
          border: "2px solid white",
          marginTop: "50px",
        }}
      >
        <Typography
          variant="h3"
          sx={{ color: "white", fontWeight: "bold", marginTop: 4 }}
        >
          Features Overview
        </Typography>
        <Typography variant="body1" sx={{ color: "white" }}>
          Here are some key features of Dream Closet{" "}
        </Typography>

        <ul>
          <li>AI-driven clothing search</li>
          <li>Mutli-store integration</li>
          <li>Personalized recommendations</li>
          <li>Advanced filtering options</li>
          <li>Save favorite items</li>
        </ul>
      </Box>
      {/* FAQ Section */}
      <Box
        sx={{
          padding: "50px",
          bgcolor: "purple",
          borderRadius: "16px",
          border: "2px solid white",
        }}
      >
        <Typography
          variant="h3"
          sx={{ color: "white", fontWeight: "bold", marginTop: 4 }}
        >
          Frequently Asked Questions (FAQ)
        </Typography>
        <Accordion sx={{ marginTop: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panelia-content"
            id="panelia-header"
          >
            <Typography variant="body1" sx={{ color: "white" }}>
              How do I search for clothing items?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "white" }}>
              Simply describe the clothing item you're looking for in the search
              bar
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Footer />
    </>
  );
};

export default About;
