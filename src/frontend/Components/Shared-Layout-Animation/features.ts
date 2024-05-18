import { Feature } from "./types"

  const features: Feature[] = [
    {
      icon: "🤖",
      label: "AI-driven clothing search",
      description:
        "Our AI-powered search engine revolutionizes the way you shop for clothes online by accurately interpreting your descriptions and fetching matching items from an extensive selection of retailers.",
        imagePath: "/assets/AI-driven_clothing_search.png"
    },
    {
      icon: "🛍️",
      label: "Multi-store integration",
      description:
        "With seamless integration across multiple online stores, our platform ensures you have access to a diverse range of fashion items, empowering you to find the perfect pieces to suit your style preferences.",
        imagePath: "/assets/AI-driven_clothing_search.png"

    },
    {
      icon: "👔",
      label: "Personalized recommendations",
      description:
        "Receive personalized clothing recommendations tailored to your unique taste and browsing habits, ensuring you discover new styles that resonate with your individual fashion sense.",
        imagePath: "/assets/AI-driven_clothing_search.png"

    },
  ];
  
 export const allFeatures: Feature[ ] = features;

 const [aiDrivenSearch, multiStoreIntegration, personalizedRecommendations] = allFeatures;
export const intitalTabs = [aiDrivenSearch, multiStoreIntegration, personalizedRecommendations];

export function getNextFeature(features: Feature[]): Feature | undefined {
  const existing = new Set(features);
  return allFeatures.find((feature) => !existing.has(feature));
}