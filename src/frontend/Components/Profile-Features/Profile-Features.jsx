import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

export default function ProfileFeatures() {
  return (
    <Box
      sx={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)),url(/assets/HD-wallpaper-black-vgradient.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "grey",
        padding: "15px",
        "&::before": {
          content: '""',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,10)", // Adjust opacity as needed
        },
      }}
    >
      <Grid
        container
        rowSpacing={1}
        columnSpacing={{
          xs: 1,
          sm: 2,
          md: 3,
        }}
      >
        <Grid item xs={12} sm={6} md={4}>
          <BookmarkIcon
            fontSize="large"
            sx={{
              color: "white",
              backgroundColor: "grey",
              borderRadius: "5px",
            }}
          />
          <Typography
            sx={{
              color: "turquoise",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            Save Clothes
          </Typography>
          <Typography
            sx={{
              color: "white",
              fontFamily: "helvetica",
            }}
          >
            Save individual clothes from any search to refer back to.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ManageSearchIcon
            fontSize="large"
            sx={{
              color: "white",
              backgroundColor: "grey",
              borderRadius: "5px",
            }}
          />
          <Typography
            color="turquoise"
            sx={{
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            Save Searches
          </Typography>
          <Typography
            color="white"
            sx={{
              fontFamily: "helvetica",
            }}
          >
            Go back down the rabbit hole of those flare pants you were thinking
            about three weeks ago? We also save your searches, not just
            indiviual clothes.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AccountBoxIcon
            fontSize="large"
            sx={{
              color: "white",
              backgroundColor: "grey",
              borderRadius: "5px",
            }}
          />
          <Typography
            color="turquoise"
            sx={{
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            Profile Customization
          </Typography>
          <Typography
            color="white"
            sx={{
              fontFamily: "helvetica",
            }}
          >
            customize their profile, including uploading a profile picture and
            personal information, can make the application more engaging and
            personalized
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
