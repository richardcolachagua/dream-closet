import { useScroll, useSpring, useTransform, motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function SmoothScroll({ children }) {
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    mass: 0.1,
    stiffness: 60,
    damping: 20,
  });

  // Measure content height for spacer div
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.getBoundingClientRect().height);
    }
  }, [children]);

  // Transform progress to Y translate

  const y = useTransform(
    smoothProgress,
    [0, 1],
    [0, -contentHeight + window.innerHeight]
  );

  return (
    <>
      <div style={{ height: contentHeight }} />
      <motion.div
        ref={contentRef}
        style={{ y, position: "fixed", top: 0, left: 0, right: 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
