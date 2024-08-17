'use client';

import "@/app/globals.css";
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import QrCodeIcon from "@/components/ui/icon";
import QrScannerWithConstraints from "@/components/QrScannerWithConstraints"; // Import custom QR Scanner component

export default function Checkpoint() {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);

    // Handle QR code scanning
    const handleQRCodeScan = useCallback(async (data) => {
        if (data) {
            setScanResult(data.text);
            setScanning(false); // Stop scanning when a QR code is scanned
            try {
                const response = await fetch('http://localhost:8080/checkpoint', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ jwt: data.text }),
                });
                if (response.ok) {
                    console.log("JWT sent successfully");
                } else {
                    console.error("Failed to send JWT");
                }
            } catch (error) {
                console.error("Error while sending JWT:", error);
            }
        }
    }, []);

    // Handle errors with QR scanner
    const handleError = (err) => {
        console.error("Error with QR Scanner:", err);
        setError("Camera not accessible.");
    };

    const previewStyle = {
        height: 240,
        width: 320,
    };

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
                        <div className="relative w-full max-w-[320px] aspect-square bg-muted rounded-lg overflow-hidden">
                            <QrScannerWithConstraints
                                style={previewStyle}
                                onError={handleError}
                                onScan={handleQRCodeScan}
                            />
                        </div>
                    )}
                    {scanResult && <Badge>QR Code Scanned: {scanResult}</Badge>}
                    {error && <Badge variant="destructive">{error}</Badge>}
                </CardContent>
            </Card>
        </main>
    );
}
