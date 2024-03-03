import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from "@mui/material";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const features = [
  {
    title: "AI-driven clothing search",
    description: "Description for AI-driven clothing search",
  },
  {
    title: "Multi-store integration",
    description: "Description for Multi-store integration",
  },
  {
    title: "Personalized recommendations",
    description: "Description for Personalized recommendations.",
  },
  {
    title: "Advanced filtering options",
    description: "Description for Advanced filtering options.",
  },
  {
    title: "Save favorite items",
    description: "Description for Save favorite items.",
  },
];

const cardStyle = {
  bgcolor: " black",
  color: "white",
  fontWeight: "bold",
  marginTop: 4,
};

const About = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateIndex = (newIndex) => {
    setCurrentIndex(
      (prevIndex) => (prevIndex + newIndex + features.length) % features.length
    );
  };

  const cardOne = (
    <React.Fragment>
      <CardContent
        sx={{
          bgcolor: "black",
        }}
      >
        {" "}
        <Typography
          variant="h3"
          sx={{ color: "white", fontWeight: "bold", marginTop: 4 }}
        >
          What is Dream Closet?
        </Typography>
        <Typography variant="body1" sx={{ color: "white" }}>
          Dream Closet is an AI-driven application that helps you find clothing
          items matching your description across various onilne stores. Simply
          describe the clothing item you're looking for, and Dream Closet will
          fetch matching results from different websites.
        </Typography>
      </CardContent>
    </React.Fragment>
  );

  const cardTwo = (
    <React.Fragment>
      <CardContent
        sx={{
          bgcolor: "black",
        }}
      >
        {" "}
        <Typography
          variant="h3"
          sx={{ color: "white", fontWeight: "bold", marginTop: 4 }}
        >
          How Does It Work?
        </Typography>
        <Typography variant="body1" sx={{ color: "white" }}>
          Dream Closet employs advanced algorithms to understand your
          preferences. The more you use Dream Closet, the better it gets at
          understanding your taste in clothing, providing more accurate results
        </Typography>
      </CardContent>
    </React.Fragment>
  );

  const cardThree = (
    <React.Fragment>
      <CardContent
        sx={{
          bgcolor: "black",
        }}
      >
        <Typography
          variant="h3"
          sx={{ color: "white", fontWeight: "bold", marginTop: 4 }}
        >
          Features Overview
        </Typography>
        <Typography variant="body1" sx={{ color: "white" }}>
          Dream Closet employs advanced algorithms to understand your
          preferences. The more you use Dream Closet, the better it gets at
          understadning your taste in clothing, providing more accurate results
        </Typography>
      </CardContent>
    </React.Fragment>
  );

  return (
    <>
      <Header />
      <Grid container spacing={2} sx={{ padding: 2 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined" sx={{ bgcolor: "white" }}>
              <CardContent sx={cardStyle}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", marginTop: 4 }}
                >
                  {features.title}
                </Typography>
                <Typography variant="body1">{features.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: 4,
        }}
      >
        <IconButton
          onClick={() => updateIndex(-1)}
          aria-label="Go to previous feature"
        >
          <ArrowBackIosNewIcon />
        </IconButton>
        <IconButton
          onClick={() => updateIndex(1)}
          aria-label=" Go to next feature"
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      {/* FAQ Section */}
      <Box
        sx={{
          padding: "50px",
          bgcolor: "black",
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
