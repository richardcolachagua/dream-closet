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
  {
    title: "Advanced filtering options",
    description:
      "Utilize our advanced filtering options to refine your search results based on specific criteria such as size, color, brand, and price range, allowing you to quickly pinpoint the exact items you're looking for.",
  },
  {
    title: "Save favorite items",
    description:
      "Easily bookmark your favorite clothing items with our convenient save feature, enabling you to create curated collections and revisit them later for effortless shopping and outfit planning.",
  },
];

const cardStyle = {
  bgcolor: "red",
  color: "white",
  fontWeight: "bold",
  marginTop: 4,
  width: 200,
  height: 350,
};

const About = () => {
  const [startIndex, setStartIndex] = useState(0);

  const updateIndex = (increment) => {
    const newStartIndex = startIndex + increment;
    if (newStartIndex >= 0 && newStartIndex <= features.length - 3) {
      setStartIndex(newStartIndex);
    }
  };

  const cardOne = (
    <CardContent
      sx={{
        bgcolor: "black",
      }}
    >
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
  );

  const cardTwo = (
    <CardContent
      sx={{
        bgcolor: "black",
      }}
    >
      <Typography
        variant="h3"
        sx={{ color: "white", fontWeight: "bold", marginTop: 4 }}
      >
        How Does It Work?
      </Typography>
      <Typography variant="body1" sx={{ color: "white" }}>
        Dream Closet employs advanced algorithms to understand your preferences.
        The more you use Dream Closet, the better it gets at understanding your
        taste in clothing, providing more accurate results
      </Typography>
    </CardContent>
  );

  const cardThree = (
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
        Dream Closet employs advanced algorithms to understand your preferences.
        The more you use Dream Closet, the better it gets at understadning your
        taste in clothing, providing more accurate results
      </Typography>
    </CardContent>
  );

  return (
    <>
      <Header />
      <Grid
        container
        direction="column"
        alignContent="center"
        spacing={2}
        sx={{ padding: 2 }}
      >
        <Grid item sx={{ width: 400, height: 350 }}>
          <Card variant="outlined">{cardOne}</Card>
        </Grid>

        <Grid item sx={{ width: 400, height: 350 }}>
          <Card variant="outlined">{cardTwo}</Card>
        </Grid>
        <Grid item sx={{ width: 400, height: 350 }}>
          <Card variant="outlined">{cardThree}</Card>
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        spacing={2}
        justifyContent="center"
        sx={{ padding: 2 }}
      >
        <Box
          sx={{
            display: "flex",
            alignContent: "center",
            margin: 8,
          }}
        >
          <IconButton
            onClick={() => updateIndex(-1)}
            aria-label="Go to previous features"
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        </Box>
        {features.slice(startIndex, startIndex + 3).map((feature, index) => (
          <Grid item key={index}>
            <Card variant="outlined" sx={{ bgcolor: "white" }}>
              <CardContent sx={cardStyle}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", marginTop: 4 }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body1">{feature.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: 4,
          }}
        >
          <IconButton
            onMouseEnter={() => updateIndex(1)}
            onMouseLeave={() => setStartIndex(startIndex)}
            aria-label="Go to next features"
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Grid>
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
