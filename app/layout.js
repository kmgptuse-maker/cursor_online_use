import "./globals.css";

export const metadata = {
  title: "SkillPath L&D",
  description: "AI-powered L&D: assessments, learning paths, and HR approval.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
