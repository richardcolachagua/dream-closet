import React, { useState } from "react";
import { intitalTabs as tabs } from "../../types/featuresFlags.ts";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Stack, Typography } from "@mui/material";
import { colors } from "../../ui/theme/designTokens";
import "../../../styles/styles.css";
import styles from "./Layout.module.css";

export default function Layout() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 980,
        mx: "auto",
        p: { xs: 2, md: 3 },
        borderRadius: "28px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography
            sx={{
              color: colors.textPrimary,
              fontWeight: 850,
              fontSize: { xs: "1.4rem", md: "1.8rem" },
              mb: 0.75,
            }}
          >
            Explore product features
          </Typography>
          <Typography
            sx={{
              color: colors.textSecondary,
              lineHeight: 1.7,
            }}
          >
            Browse the Dream Closet experience through key product views and UI
            states.
          </Typography>
        </Box>

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
                {selectedTab ? (
                  <div className={styles.featureContainer}>
                    <img
                      src={selectedTab.imagePath}
                      alt={selectedTab.label}
                      className={styles.image}
                    />
                  </div>
                ) : (
                  "😋"
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </Stack>
    </Box>
  );
}
