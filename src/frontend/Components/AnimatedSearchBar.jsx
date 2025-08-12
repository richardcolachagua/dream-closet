import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const AnimatedSearchBar = () => {
  const [prompt, setPrompt] = useState("");
  const prompts = [
    "I'm searching for a velour blue t-shirt",
    "I'm searching for high waisted black shorts",
    "I'm searching for a yellow sundress",
    "I'm searching for a big black puffer",
  ];

  // "Search for products",
  //     "Find what you need",
  //     "Explore clothes in a new way",

  useEffect(() => {
    const interval = setInterval(() => {
      setPrompt((prevPrompt) => {
        const currentIndex = prompts.indexOf(prevPrompt);
        const nextIndex = (currentIndex + 1) % prompts.length;
        return prompts[nextIndex];
      });
    }, 900);
    return () => clearInterval(interval);
  }, [prompts]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 2 }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "30vh",
      }}
    >
      <input
        type="text"
        placeholder={prompt}
        style={{
          padding: "15px",
          fontSize: "20px",
          fontFamily: "helvetica",
          border: "10px",
          borderBottom: "2px solid #ccc",
          width: "500px",
          backgroundColor: "white",
          borderRadius: "10px",
        }}
      />
    </motion.div>
  );
};

export default AnimatedSearchBar;
