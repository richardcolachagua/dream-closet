import { Typography, Stack, Box } from "@mui/material";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <Stack
        direction="row"
        spacing={5}
        sx={{
          justifyContent: "center",
          backgroundColor: "black",
          margin: "30px",
        }}
      >
        <Link to="/TOSPage" style={{ textDecoration: "none" }}>
          <Typography
            variant="h6"
            color="white"
            align="center"
            sx={{
              fontWeight: "bold",
              fontFamily: "Helvetica Neue",
            }}
          >
            Terms of Use
          </Typography>
        </Link>
        <Link to="/ContactPage" style={{ textDecoration: "none" }}>
          <Typography
            variant="h6"
            color="white"
            align="center"
            sx={{
              fontWeight: "bold",
              fontFamily: "Helvetica Neue",
            }}
          >
            Contact Us
          </Typography>
        </Link>
        <Link to="/privacypolicypage" style={{ textDecoration: "none" }}>
          <Typography
            variant="h6"
            color="white"
            align="center"
            sx={{
              fontWeight: "bold",
              fontFamily: "Helvetica Neue",
            }}
          >
            Privacy Policy
          </Typography>
        </Link>
      </Stack>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "black",
          justifyContent: "center",
          marginBottom: "10px",
          marginTop: "5px",
        }}
      >
        <Typography
          variant="h6"
          color="white"
          align="center"
          sx={{
            fontWeight: "bold",
            fontFamily: "helvetica",
          }}
        >
          A Sixth Sense Production
        </Typography>
      </Box>
    </>
  );
};

export default Footer;
