import React, { useState } from "react";
import { intitalTabs as tabs } from "./features.ts";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.css";

export default function Layout() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <div className="window">
      <nav>
        <ul>
      {/* Map over the tabs and render a list item for each */}
          {tabs.map((item) => (
            <li
              key={item.label}
              className={item === selectedTab ? "selected" : ""}
              onClick={() => setSelectedTab(item)}
            >
          {/* Display the icon and label for each tab */}
              {`${item.icon} ${item.label}`}
          {/* If the tab is selected, render an underline */}
              {item === selectedTab ? (
                <motion.div className="underline" layoutId="underline" />
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <AnimatePresence mode="wait">
       {/* Render the selected tab's content */}
          <motion.div
            key={selectedTab ? selectedTab.label : "empty"}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {selectedTab ? ( <>
            {selectedTab.description && ( 
            <p className="text text-large text-margin text-center text-bold">
              {selectedTab.description}
            </p>
            )}
            </> 
            ) : (
            "😋")}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
