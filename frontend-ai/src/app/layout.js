import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Thai SMS Detection",
  description: "AI SMS Detection Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="public/favicon.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
