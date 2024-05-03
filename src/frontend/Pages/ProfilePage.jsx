import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import Header from "../Components/Header";

const drawerWidth = 240;

export default function PermanentDrawerLeft() {
  return (
    <>
      <Box>
        <Header />
      </Box>
      <Box sx={{ display: "flex" }}>
        {" "}
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              User
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar />
          <Divider />
          <List>
            {["Profile Page", "Change Password", "", "Delete Account"].map(
              (text, index) => (
                <ListItem key={text} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              )
            )}
          </List>
          <Divider />
          <List>
            {["Save For Later", "Search History", "Spam"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
        >
          <Toolbar />
        </Box>
      </Box>
    </>
  );
}

// function ProfilePage({ userProfile, onUpdate }) {
//   const [profile, setProfile] = useState(userProfile);

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setProfile({ ...profile, [name]: value });
//   };

//   const handleSubmit = () => {
//     fetch("/api/user/profile", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(profile),
//     })
//       .then((response) => response.json())
//       .then((data) => onUpdate(data));
//   };
//   return (
//     <form>
//       <Textfield
//         name="username"
//         label="Username"
//         value={profile.username}
//         onChange={handleChange}
//         sx={{ mb: 2 }}
//       />
//       <Textfield
//         name="email"
//         label="Email"
//         value={profile.email}
//         onChange={handleChange}
//         sx={{ mb: 2 }}
//       />
//       <Button variant="contained" onClick={handleSubmit}>
//         Update Profile
//       </Button>
//     </form>
//   );
// }
