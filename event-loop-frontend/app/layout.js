import './globals.css';

export const metadata = {
  title: 'Event-Loop',
  description: 'scam fe',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
