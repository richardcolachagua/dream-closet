import React from "react";
import Layout from "./Layout";

const LayoutContainer = () => {
  const containerStyle = {
    "--accent": "##8855ff",
    background: "var(--accent",
    padding: 0,
    margin: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };
  return (
    <div style={containerStyle}>
      <Layout />
    </div>
  );
};

export default LayoutContainer;
