'use client';

import "@/app/globals.css";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import QrCodeIcon from "@/components/ui/icon";
import { Scanner } from "@yudiel/react-qr-scanner";
import QrScannerWithConstraints from "@/components/QrScannerWithConstraints";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function Checkpoint() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  // const [recentScans, setRecentScans] = useState([]);
  const [recentScans, setRecentScans] = useState([]);

  const handleQRCodeScan = useCallback(async (data) => {
    if (data) {
      setScanResult(data.text);
      setScanning(false); // Stop scanning when a QR code is scanned
      console.log(data[0]["rawValue"]);
      try {
        const response = await fetch(`${process.env.GO_BACKEND_URL}/checkpoint`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jwt: data[0]["rawValue"] }),
        });
        if (response.ok) {
          console.log("JWT sent successfully");
          const resp = await response.json();
          console.log("Response:", resp.claims);
          // append resp.claims json to recentScans

          // if not in recentScans, add it
          setRecentScans(prevScans => [...prevScans, resp.claims]);

          console.log("Recent Scans:", recentScans);
        } else {
          console.error("Failed to send JWT");
        }
      } catch (error) {
        console.error("Error while sending JWT:", error);
      }
    }
  }, []);

  const handleError = (err) => {
    console.error("Error with QR Scanner:", err);
    setError("Camera not accessible.");
  };

  const handleCameraChange = (event) => {
    setSelectedCamera(event.target.value);
  };

  const videoConstraints = selectedCamera ? {
    deviceId: { exact: selectedCamera },
    facingMode: 'environment', // ill set it as environment as of now wont say exact, but device can be changed
    width: 1280,
    height: 720
  } : {};

  return (
    <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
      <Navbar />

      <Card className="hover:bg-slate-100 transition duration-200 ease-in-out">
        <CardHeader className="flex flex-col items-center">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setScanning(!scanning)}
              aria-label={scanning ? "Close Scanner" : "Open Scanner"}
              className="flex items-center gap-2 p-2 bg-gray-200 rounded"
            >
              <QrCodeIcon className="w-12 h-12 text-primary" />
              <span className="text-sm">
                {scanning ? "Click to close scanner" : "Click to open scanner"}
              </span>
            </button>
          </div>
          <CardTitle>Checkpoint</CardTitle>
          <CardDescription>Scan the QR code to authenticate and continue.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          {scanning && (
            // <div className="relative w-full max-w-[320px] aspect-square bg-muted rounded-lg overflow-hidden">
            //   <QrScannerWithConstraints
            //     onError={handleError}
            //     onScan={handleQRCodeScan}
            //     facingMode="rear"
            //     // videoConstraints={videoConstraints}
            //   />
            // </div>
            <Scanner onScan={(result) => handleQRCodeScan(result)} />
          )}
          {scanResult && <Badge>QR Code Scanned: {scanResult}</Badge>}
          {error && <Badge variant="destructive">{error}</Badge>}

          {
            recentScans && (
              <Table className="">
                {/* fill table with setJsonResponse */}
                <TableCaption>Verified CSV form</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>College</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentScans &&
                    recentScans.reverse().map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.phone}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.college}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )
          }
        </CardContent>
      </Card>
    </main>
  );
}
