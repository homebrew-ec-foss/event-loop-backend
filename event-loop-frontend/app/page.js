'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>Event-Loop</div>
        <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </div>
      </header>

      {menuOpen && (
        <div className={styles.overlay}>
          <div className={styles.menuContainer}>
            <nav className={styles.menu}>
              <Link href="/ping" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                Ping
              </Link>
              <Link href="/create" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                Create
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome to Event-Loop</h1>
          <p className={styles.description}>
            Some Waffle.
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; JS Hate.</p>
      </footer>
    </div>
  );
}
