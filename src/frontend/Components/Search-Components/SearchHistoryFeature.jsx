import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemText } from "@mui/material";

function SearchHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory([" red dress"]);
  }, []);

  return (
    <List>
      {history.map((search, index) => (
        <ListItem key={index}>
          <ListItemText primary={search} />
        </ListItem>
      ))}
    </List>
  );
}
export default SearchHistory;
