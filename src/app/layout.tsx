// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Save Froggo',
  description: 'A decision-making game to save froggo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Carter+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
