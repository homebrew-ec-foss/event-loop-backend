'use client';

import "@/app/globals.css";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import QrCodeIcon from "@/components/ui/icon";
import QrScannerWithConstraints from "@/components/QrScannerWithConstraints";

export default function Checkpoint() {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);

    useEffect(() => {
        const getCameras = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setCameras(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedCamera(videoDevices[0].deviceId);
                }
            } catch (err) {
                console.error("Error fetching cameras:", err);
                setError("Could not access camera devices.");
            }
        };

        getCameras();
    }, []);

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
                        {cameras.length > 0 && (
                            <select 
                                onChange={handleCameraChange} 
                                value={selectedCamera} 
                                className="mt-2 p-2 bg-gray-200 rounded"
                            >
                                {cameras.map(camera => (
                                    <option key={camera.deviceId} value={camera.deviceId}>
                                        {camera.label || `Camera ${camera.deviceId}`}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <CardTitle>Checkpoint</CardTitle>
                    <CardDescription>Scan the QR code to authenticate and continue.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                    {scanning && (
                        <div className="relative w-full max-w-[320px] aspect-square bg-muted rounded-lg overflow-hidden">
                            <QrScannerWithConstraints
                                onError={handleError}
                                onScan={handleQRCodeScan}
                                videoConstraints={videoConstraints}
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
