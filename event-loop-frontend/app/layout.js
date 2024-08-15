'use client';

import '@/app/globals.css';
import { useEffect } from 'react';

const metadata = {
  title: 'Event-Loop',
  description: 'scam fe',
};

export default function RootLayout({ children }) {
  // FIX: create a better solution
  // useEffect(() => {
  //   const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  //   if (isDarkMode) {
  //     document.documentElement.classList.add('dark');
  //   }
  // }, []);

  // other option conflicts with some fg colors
  // <html lang='en> className='dark'> ... </html>

  return (
    <html lang="en" className='dark'>
      <body>{children}</body>
    </html>
  );
}
