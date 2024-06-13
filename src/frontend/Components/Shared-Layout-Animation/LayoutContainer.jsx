import React from "react";
import Layout from "./Layout.tsx";

const LayoutContainer = () => {
  // Define the container style
  const containerStyle = {
    "--accent": "##8855ff",
    background: "var(--accent",
    padding: 0,
    margin: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "70vh",
  };
  return (
    <div style={containerStyle}>
      <Layout />
    </div>
  );
};

export default LayoutContainer;
