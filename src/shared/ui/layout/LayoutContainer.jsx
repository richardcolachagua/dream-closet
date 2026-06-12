import React from "react";
import Layout from "./Layout.tsx";

const LayoutContainer = () => {
  // Define the container style
  const containerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    minHeight: "100vh",
  };

  return (
    <div style={containerStyle}>
      <Layout />
    </div>
  );
};

export default LayoutContainer;
