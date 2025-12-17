import PolaroidGallery from "./PolaroidGallery";

// Manually define images and their captions
const polaroidItems = [
  {
    src: "/home_gallery/Asian Delights @ AgentVerse Hackathon.JPG",
    caption: "Asian Delights @ AgentVerse Hackathon",
  },
  { src: "/home_gallery/oakberry.jpg", caption: "Oakberry Matcha Rave" },
  { src: "/home_gallery/banhMiBay.png", caption: "Banh Mi Bay" },
  {
    src: "/home_gallery/Hiba - Great Agent Hack.jpg",
    caption: "Hiba @ Great Agent Hack",
  },
  {
    src: "/home_gallery/hiba_rl again.jpeg",
    caption: "Hiba @ Iterate’s London RL Hackathon",
  },
  {
    src: "/home_gallery/icco_agentverse.JPG",
    caption: "Icco @ AgentVerse Hackathon",
  },
  { src: "/home_gallery/oakberry2.jpg", caption: "Oakberry Matcha Rave" },
  {
    src: "/home_gallery/hiba_RL Hackathon again.JPG",
    caption: "Hiba @ Iterate’s London RL Hackathon",
  },
  {
    src: "/home_gallery/icco_alsoagentverse.JPG",
    caption: "Icco @ Agent Verse Hackathon",
  },
  {
    src: "/home_gallery/hiba_RL Hackathon.JPG",
    caption: "Hiba @ Iterate’s London RL Hackathon",
  },
  { src: "/home_gallery/oakberry3.jpg", caption: "Oakberry Matcha Rave" },
  {
    src: "/home_gallery/hiba_rl once more.JPG",
    caption: "Hiba @ Iterate’s London RL Hackathon",
  },
  { src: "/home_gallery/oakberry4.jpg", caption: "Oakberry Matcha Rave" },
  {
    src: "/home_gallery/Hiba - Great Agent Hack2.jpg",
    caption: "Hiba @ Great Agent Hack",
  },
  {
    src: "/home_gallery/sandwich_Rl.jpg",
    caption: "Sandwich Sandwich @ Iterate's London RL Hackkathon",
  },
];

export default function HomeGallerySection() {
  return (
    <PolaroidGallery items={polaroidItems} title="ORDER. DELIVER. ENJOY." />
  );
}
