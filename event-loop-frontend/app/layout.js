'use client';

import '@/app/globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const metadata = {
  title: 'Event-Loop',
  description: 'scam fe',
};
//everything needs to be wrapped in the GoogleOAuthProvider so that it has context, we could only wrap the pages that need it but this is easier, if we doing fe protected route
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId="include ur client id here ples">
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
