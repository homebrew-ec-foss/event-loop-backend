'use client';

import '@/app/globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const metadata = {
  title: 'Event-Loop',
  description: 'scam fe',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId="995204146791-d6c44oaq69pfcofbaod09j8p73j393gc.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
