import { Feature } from "./types";

const features: Feature[] = [
  {
    icon: "🤖",
    label: "AI-driven clothing search",
    description:
      "Our AI-powered search engine revolutionizes the way you shop online by accurately interpreting your descriptions & fetching matching items from an extensive selection of retailers.",
    imagePath: "/assets/1-AI-Driven-Clothing-Search_v.jpg",
  },
  {
    icon: "🛍️",
    label: "Multi-store integration",
    description:
      "With seamless integration across multiple online stores, our platform ensures you have access to a diverse range of fashion items, empowering you to find the perfect pieces to suit your style preferences.",
    imagePath: "/assets/2-Multi-Store-Integration_v.jpg",
  },
  {
    icon: "👔",
    label: "Personalized recommendations",
    description:
      "Receive personalized clothing recommendations tailored to your unique taste and browsing habits, ensuring you discover new styles that resonate with your individual fashion sense.",
    imagePath: "/assets/3-Personalized-Recommendations.jpg",
  },
];

export const allFeatures: Feature[] = features;

// Destructure the features array into individual variables
const [aiDrivenSearch, multiStoreIntegration, personalizedRecommendations] =
  allFeatures;

// Define the initial tabs
export const intitalTabs = [
  aiDrivenSearch,
  multiStoreIntegration,
  personalizedRecommendations,
];

// Define a function to get the next feature
export function getNextFeature(features: Feature[]): Feature | undefined {
  const existing = new Set(features);
  return allFeatures.find((feature) => !existing.has(feature));
}
