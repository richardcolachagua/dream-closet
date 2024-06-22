import React from "react";
import Layout from "./Layout.tsx";

const LayoutContainer = () => {
  // Define the container style
  const containerStyle = {
    "--accent": "##8855ff",
    background: "var(--accent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
  };

  return (
    <div style={containerStyle}>
      <Layout />
    </div>
  );
};

export default LayoutContainer;
