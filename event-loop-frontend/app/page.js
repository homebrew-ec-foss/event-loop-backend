'use client';

import React, { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/navbar';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
      <Navbar />
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
  );
}