import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

const ConfirmDialog = ({ title, open, setOpen, onConfirm, children }) => (
  <Dialog open={open} onClose={() => setOpen(false)}>
    <DialogTitle>{title} </DialogTitle>
    <DialogContent>{children}</DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          setOpen(false);
          onConfirm();
        }}
        color="secondary"
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          setOpen(false);
          onConfirm();
        }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
