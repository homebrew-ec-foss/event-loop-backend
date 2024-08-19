"use client";

import "@/app/globals.css";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import RootLayout from "@/app/layout";

export default function Ping() {
  const [response, setResponse] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${process.env.GO_BACKEND_URL}/ping`, {
          method: 'GET',
        });
        if (res.ok) {
          const text = await res.text();
          setResponse(text);
        } else {
          throw new Error('Failed to fetch');
        }
      } catch (error) {
        // console.log("Error while fetching ping response: ", error);
        setResponse(null, error);
      }
    }
    // setInterval(fetchData, 10000);
    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
      <Navbar></Navbar>

      <Card className="hover:bg-slate-100 transition duration-200 ease-in-out">
        <CardHeader>
          <CardTitle>Server Status</CardTitle>
          <CardDescription>Eventloop GO backend status</CardDescription>
        </CardHeader>
        <CardContent>
          {
            response ? (
              // <p className="text-2xl font-mono">{response}</p>
              <Badge>Alive</Badge>
            ) : (
              <Badge variant="destructive">Not responsive</Badge>
            )
          }
        </CardContent>
      </Card>

      {/* <p className={`text-3xl font-regular underline`}>{response}</p> */}
    </main>
  );
}
