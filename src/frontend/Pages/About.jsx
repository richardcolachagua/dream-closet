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
} from "@mui/material";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const About = () => {
  const [startIndex, setStartIndex] = useState(0);

  const updateIndex = (increment) => {
    const newStartIndex = startIndex + increment;
    if (newStartIndex >= 0 && newStartIndex <= features.length - 3) {
      setStartIndex(newStartIndex);
    }
  };

  const features = [
    {
      title: "AI-driven clothing search",
      description:
        "Our AI-powered search engine revolutionizes the way you shop for clothes online by accurately interpreting your descriptions and swiftly fetching matching items from an extensive selection of retailers.",
    },
    {
      title: "Multi-store integration",
      description:
        "With seamless integration across multiple online stores, our platform ensures you have access to a diverse range of fashion items, empowering you to find the perfect pieces to suit your style preferences.",
    },
    {
      title: "Personalized recommendations",
      description:
        "Receive personalized clothing recommendations tailored to your unique taste and browsing habits, ensuring you discover new styles that resonate with your individual fashion sense.",
    },
  ];

  return (
    <>
      <Header />
      <Box p={4}>
        <Typography
          variant="h2"
          gutterBottom
          color="white"
          sx={{ fontWeight: "bold" }}
        >
          About Us
        </Typography>
        <Typography variant="body1" paragraph color="white">
          Dream Closet is an AI-driven application that helps you find clothing
          items matching your description across various online stores. Simply
          describe the clothing item you're looking for, and Dream Closet will
          fetch matching results from different websites.
        </Typography>
        <Typography variant="body1" paragraph color="white">
          Dream Closet employs advanced algorithms to understand your
          preferences. The more you use Dream Closet, the better it gets at
          understanding your taste in clothing, providing more accurate results.
        </Typography>

        <Typography
          variant="h3"
          gutterBottom
          color="white"
          sx={{ fontWeight: "bold" }}
        >
          Features Overview
        </Typography>
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent sx={{ textAlign: "center" }} s>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1">{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h3" gutterBottom>
          Frequently Asked Questions (FAQ)
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body1">
              How do I search for clothing items?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              Simply describe the clothing item you're looking for in the search
              bar.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Footer />
    </>
  );
};

export default About;
