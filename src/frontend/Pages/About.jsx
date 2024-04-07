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
  Stack,
} from "@mui/material";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const About = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

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
        <Typography sx={{ justifyContent: "right" }}>FAQ</Typography>
        <Stack direction="row" p={4} spacing={4}>
          <img
            src="/assets/AI-driven_clothing_search.png"
            width="400"
            height="300"
            alt="ai-driven-clothing"
          />
          <div>
            <Accordion
              expanded={expanded === "panel1"}
              onChange={handleChange("panel1")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography fontWeight="bold">
                  Is this a paid service?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
                  feugiat. Aliquam eget maximus est, id dignissim quam.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === "panel2"}
              onChange={handleChange("panel2")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2bh-content"
                id="panel2bh-header"
              >
                <Typography fontWeight="bold">Users</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Donec placerat, lectus sed mattis semper, neque lectus feugiat
                  lectus, varius pulvinar diam eros in elit. Pellentesque
                  convallis laoreet laoreet.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === "panel3"}
              onChange={handleChange("panel3")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3bh-content"
                id="panel3bh-header"
              >
                <Typography fontWeight="bold">Advanced settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Nunc vitae orci ultricies, auctor nunc in, volutpat nisl.
                  Integer sit amet egestas eros, vitae egestas augue. Duis vel
                  est augue.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === "panel4"}
              onChange={handleChange("panel4")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel4bh-content"
                id="panel4bh-header"
              >
                <Typography fontWeight="bold">Personal data</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Nunc vitae orci ultricies, auctor nunc in, volutpat nisl.
                  Integer sit amet egestas eros, vitae egestas augue. Duis vel
                  est augue.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </div>
        </Stack>
      </Box>
      <Footer />
    </>
  );
};

export default About;
