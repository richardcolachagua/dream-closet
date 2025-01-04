import React from "react";
import { Typography, Box, CssBaseline, Container } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Header from "../../Components/Headers/Header";
import Footer from "../../Components/Footer";

const TOSPage = () => {
  const defaultTheme = createTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <Header />
        <CssBaseline />
        <Container
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            padding: "30px",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "turquoise",
              fontFamily: "Times New Roman",
            }}
          >
            Terms of Service
          </Typography>
          <Box sx={{ marginTop: 2, padding: "10px" }}>
            <Typography
              variant="h5"
              sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
            >
              1. Acceptance of Terms
            </Typography>
            <Typography sx={{ color: "white", marginBottom: "30px" }}>
              By accessing and using Dream Closet, you accept and agree to be
              bound by the terms and provision of this agreement. In addition,
              when using Dream Closet's particular services, you shall be
              subject to any posted guidelines or rules applicable to such
              services. Any participation in this service will constitute
              acceptance of this agreement. If you do not agree to abide by the
              above, please do not use this service.
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
            >
              2. Desscription of Service
            </Typography>
            <Typography sx={{ color: "white", marginBottom: "30px" }}>
              Dream Closet is a web application that allows users to search for
              clothing items and manage their virtual closet. The service
              includes, but is not limited to, searching for items, saving
              favorite items, and managing personal wardrobe collections.
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
            >
              3. User Conduct
            </Typography>
            <Typography sx={{ color: "white", marginBottom: "30px" }}>
              As a condition of use, you promise not to use the service for any
              purpose that is unlawful or prohibited by these Terms of Service,
              or any other purpose not reasonably intended by Dream Closet. By
              way of example, and not as a limitation, you agree not to use the
              service:
            </Typography>
            <Typography sx={{ color: "white", marginBottom: "30px" }}>
              To abuse, harass, threaten, impersonate or intimidate any person;
              To post or transmit, or cause to be posted or transmitted, any
              content that is libelous, defamatory, obscene, pornographic,
              abusive, offensive, profane, or that infringes any copyright or
              other right of any person; For any purpose (including posting or
              viewing content) that is not permitted under the laws of the
              jurisdiction where you use the service; To post or transmit, or
              cause to be posted or transmitted, any communication or
              solicitation designed or intended to obtain password, account, or
              private information from any Dream Closet user; To create or
              transmit unwanted spam to any person or any URL; To create
              multiple accounts for the purpose of voting for or against users'
              photographs or images; To post copyrighted content which does not
              belong to you.
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
            >
              4. Privacy Policy
            </Typography>
            <Typography sx={{ color: "white", marginBottom: "30px" }}>
              The service and its original content, features, and functionality
              are and will remain the exclusive property of Dream Closet and its
              licensors. The service is protected by copyright, trademark, and
              other laws of both the United States and foreign countries. Our
              trademarks and trade dress may not be used in connection with any
              product or service without the prior written consent of Dream
              Closet.
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
            >
              5. Intellectual Property
            </Typography>
            <Typography sx={{ color: "white", marginBottom: "30px" }}>
              The service and its original content, features, and functionality
              are and will remain the exclusive property of Dream Closet and its
              licensors. The service is protected by copyright, trademark, and
              other laws of both the United States and foreign countries. Our
              trademarks and trade dress may not be used in connection with any
              product or service without the prior written consent of Dream
              Closet.
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
            >
              6. Termination
            </Typography>
            <Typography sx={{ color: "white", marginBottom: "30px" }}>
              We may terminate or suspend access to our service immediately,
              without prior notice or liability, for any reason whatsoever,
              including without limitation if you breach the Terms. All
              provisions of the Terms which by their nature should survive
              termination shall survive termination, including, without
              limitation, ownership provisions, warranty disclaimers, indemnity,
              and limitations of liability.
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: "white", marginBottom: "10px", fontWeight: "bold" }}
            >
              7. Changes to the Terms of Service
            </Typography>
            <Typography sx={{ color: "white", marginBottom: "30px" }}>
              Dream Closet reserves the right, at its sole discretion, to modify
              or replace these Terms at any time. If a revision is material, we
              will try to provide at least 30 days' notice prior to any new
              terms taking effect. What constitutes a material change will be
              determined at our sole discretion.
            </Typography>
          </Box>
        </Container>
        <Footer />
      </ThemeProvider>
    </Box>
  );
};

export default TOSPage;
