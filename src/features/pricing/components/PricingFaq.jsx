import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqItems = [
  {
    question: "Can I start on the free plan?",
    answer:
      "Yes. Dream Closet supports a free starting point so users can explore the product before deciding whether Pro is worth it.",
  },
  {
    question: "Can I cancel Pro anytime?",
    answer:
      "Yes. Billing should be manageable through your account billing flow, and the product should make cancellation straightforward rather than hidden.",
  },
  {
    question: "What does Pro unlock?",
    answer:
      "Pro is designed for broader search access, premium search experiences, stronger filtering, and future member features like richer personalization.",
  },
  {
    question: "Will billing work in every environment?",
    answer:
      "Not always. In development or preview environments, billing can be disabled while the pricing UI is still reviewed.",
  },
  {
    question: "Will Dream Closet add more features later?",
    answer:
      "Yes. The roadmap already points toward expanded retailer coverage, improved personalization, stronger account controls, and future AI-driven member experiences.",
  },
];

function PricingFaq() {
  return (
    <Box sx={{ mt: { xs: 5, md: 7 } }}>
      <Typography
        sx={{
          color: "white",
          fontWeight: 850,
          fontSize: { xs: "1.5rem", md: "2rem" },
          lineHeight: 1.1,
          mb: 1,
        }}
      >
        Pricing questions
      </Typography>

      <Typography
        sx={{
          color: "rgba(255,255,255,0.68)",
          maxWidth: 760,
          lineHeight: 1.65,
          mb: 2.5,
        }}
      >
        Clear billing language and easy cancellation build trust, especially for
        subscription products. [web:82][web:88]
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 1.25,
        }}
      >
        {faqItems.map((item) => (
          <Accordion
            key={item.question}
            disableGutters
            elevation={0}
            sx={{
              borderRadius: "18px !important",
              overflow: "hidden",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "white",
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
              sx={{
                px: 2.25,
                py: 0.4,
              }}
            >
              <Typography sx={{ fontWeight: 750 }}>{item.question}</Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                px: 2.25,
                pt: 0,
                pb: 2.25,
              }}
            >
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.74)",
                  lineHeight: 1.7,
                }}
              >
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}

export default PricingFaq;
