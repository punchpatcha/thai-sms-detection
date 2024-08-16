// layout.js or in the head section of your Next.js project

import Head from 'next/head';
import { Roboto } from 'next/font/google';

const mitr = Roboto({
  subsets: ['latin'],
  weights: [400, 700], // Add weights as needed
});

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Mitr:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={mitr.className}>{children}</body>
    </html>
  );
}
