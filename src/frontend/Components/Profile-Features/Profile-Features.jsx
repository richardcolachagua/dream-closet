import Grid2 from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import Card from "@mui/material/Card";
import { Button } from "@mui/material";

export default function ProfileFeatures() {
  return (
    <Box
      sx={{
        // backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)),url(/assets/HD-wallpaper-black-vgradient.jpg)`,
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: 6,
      }}
    >
      <Grid2
        container
        spacing={3}
        justifyContent="center" // centers the row
        alignItems="stretch" // makes all cards same height
      >
        <Grid2>
          <Card
            sx={{
              width: 300,
              height: "100%",
              backgroundColor: "black",
              border: "0.5px solid white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 6,
            }}
          >
            <Button
              disabled
              sx={{
                backgroundColor: "black",
                border: "1px solid white",
                borderRadius: "40px",
                p: 2,
                mb: 2,
              }}
            >
              <BookmarkIcon fontSize="large" sx={{ color: "white" }} />
            </Button>
            <Typography
              gutterBottom
              variant="h5"
              component="div"
              align="center"
              sx={{
                color: "white",
                fontWeight: "bold",
              }}
            >
              Save Clothes
            </Typography>
            <Typography
              variant="body2"
              align="center"
              sx={{ color: "lightgray" }}
            >
              Save individual clothes from any search to refer back to.
            </Typography>
          </Card>
        </Grid2>

        <Grid2>
          <Card
            sx={{
              width: 300,
              height: "100%",
              backgroundColor: "black",
              border: "0.5px solid white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 6,
            }}
          >
            <Button
              disabled
              sx={{
                backgroundColor: "black",
                border: "1px solid white",
                borderRadius: "50%",
                p: 2,
                mb: 2,
              }}
            >
              <ManageSearchIcon fontSize="large" sx={{ color: "white" }} />
            </Button>
            <Typography
              gutterBottom
              variant="h6"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Save Searches
            </Typography>
            <Typography variant="body2" sx={{ color: "lightgray" }}>
              Go back down the rabbit hole of those flare pants you were
              thinking about three weeks ago? We also save your searches, not
              just individual clothes.
            </Typography>
          </Card>
        </Grid2>

        <Grid2>
          <Card
            sx={{
              width: 300,
              height: "100%",
              backgroundColor: "black",
              border: "0.5px solid white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              p: 6,
            }}
          >
            <Button
              disabled
              sx={{
                backgroundColor: "black",
                border: "1px solid white",
                borderRadius: "50%",
                p: 2,
                mb: 2,
              }}
            >
              <AccountBoxIcon fontSize="large" sx={{ color: "white" }} />
            </Button>
            <Typography
              gutterBottom
              variant="h6"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Profile Customization
            </Typography>
            <Typography variant="body2" sx={{ color: "lightgray" }}>
              Customize your profile, including uploading a profile picture and
              personal information.
            </Typography>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
