
import "./globals.css";



export const metadata = {
  title: "Thai SMS Detection",
  description: "AI SMS Detection Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
