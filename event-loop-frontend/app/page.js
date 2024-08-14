'use client';

import Link from 'next/link';
import styles from './page.module.css';

import React, { useState, useEffect } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from "@radix-ui/react-navigation-menu"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Navbar from '@/components/navbar';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    // <div className={styles.container}>
    //   <header className={styles.header}>
    //     <div className={styles.logo}>Event-Loop</div>
    //     <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
    //       <div className={styles.bar}></div>
    //       <div className={styles.bar}></div>
    //       <div className={styles.bar}></div>
    //     </div>
    //   </header>

    //   {menuOpen && (
    //     <div className={styles.overlay}>
    //       <div className={styles.menuContainer}>
    //         <nav className={styles.menu}>
    //           <Link href="/ping" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
    //             Ping
    //           </Link>
    //           <Link href="/create" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
    //             Create
    //           </Link>
    //         </nav>
    //       </div>
    //     </div>
    //   )}

    <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
        <Navbar />

        {/* <div className={styles.card}>
          <h1 className={styles.title}>Welcome to Event-Loop</h1>
          <p className={styles.description}>
            Some Waffle.
          </p>
        </div> */}
        <Card className="hover:bg-slate-100 transition duration-200 ease-in-out">
          <CardHeader>
            <CardTitle>Welcome to Event-Loop</CardTitle>
            <CardDescription>Get started with creating your event</CardDescription>
          </CardHeader>
        </Card>
        <footer>
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; JS Hate.
          </p>
        </footer>
        
    </main>

    //   <footer className={styles.footer}>
    //     <p>&copy; JS Hate.</p>
    //   </footer>
    // </div>
  );
}