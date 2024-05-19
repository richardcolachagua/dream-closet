import "./styles.css";
import styles from './Layout.module.css';
import React, { useState } from "react";
import { intitalTabs as tabs } from "./features.ts";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <div className="window">
      <nav>
        <ul>
          {tabs.map((item) => (
            <li
              key={item.label}
              className={item === selectedTab ? "selected" : ""}
              onClick={() => setSelectedTab(item)}
            >
              {`${item.icon} ${item.label}`}
              {item === selectedTab ? (
                <motion.div className="underline" layoutId="underline" />
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab ? selectedTab.label : "empty"}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {selectedTab ? ( <>
            <img src={selectedTab.imagePath} alt={selectedTab.label} className={styles.image}/>
            <p>
              {selectedTab.description}
            </p>
            </> 
            ) : (
            "😋")}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
