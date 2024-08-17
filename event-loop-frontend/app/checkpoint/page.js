"use client";

import "@/app/globals.css";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import QrScanner from "react-qr-scanner";

export default function Checkpoint() {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);

    const handleQRCodeScan = async (data) => {
        if (data) {
            setScanResult(data.text);
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
    };

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
                    <QrCodeIcon className="w-12 h-12 text-primary" />
                    <CardTitle>Checkpoint</CardTitle>
                    <CardDescription>Scan the QR code to authenticate and continue.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[320px] aspect-square bg-muted rounded-lg overflow-hidden">
                        <QrScanner
                            delay={300}
                            style={previewStyle}
                            onError={handleError}
                            onScan={handleQRCodeScan}
                        />
                    </div>
                    {scanResult && <Badge>QR Code Scanned: {scanResult}</Badge>}
                    {error && <Badge variant="destructive">{error}</Badge>}
                </CardContent>
            </Card>
        </main>
    );
}

function QrCodeIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <rect width="5" height="5" x="3" y="3" rx="1" />
            <rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" />
            <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            <path d="M21 21v.01" />
            <path d="M12 7v3a2 2 0 0 1-2 2H7" />
            <path d="M3 12h.01" />
            <path d="M12 3h.01" />
            <path d="M12 16v.01" />
            <path d="M16 12h1" />
            <path d="M21 12v.01" />
            <path d="M12 21v-1" />
        </svg>
    );
}
