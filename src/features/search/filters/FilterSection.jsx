import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function FilterSection({
  title,
  children,
  onClear,
  hasActiveValues = false,
  defaultExpanded = false,
}) {
  return (
    <Accordion
      disableGutters
      defaultExpanded={defaultExpanded}
      sx={{
        bgcolor: "transparent",
        color: "white",
        boxShadow: "none",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        "&::before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
        sx={{
          px: 0,
          minHeight: "unset",
          "& .MuiAccordionSummary-content": {
            my: 1.5,
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "0.95rem",
            }}
          >
            {title}
          </Typography>

          {hasActiveValues && onClear && (
            <Button
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              sx={{
                minWidth: "auto",
                px: 1,
                color: "turquoise",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          px: 0,
          pb: 2,
          pt: 0,
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

export default FilterSection;
