// src/app/layout.js
import { Mitr } from 'next/font/google';
import './globals.css'; // Ensure this path is correct

const mitr = Mitr({
  weight: ['400', '700'], // Specify the required weights
  subsets: ['thai'], // Specify the subsets
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={mitr.className}>
      <body>{children}</body>
    </html>
  );
}
