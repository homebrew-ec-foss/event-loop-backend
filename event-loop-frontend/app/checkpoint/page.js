'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import QrCodeIcon from "@/components/ui/icon";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Badge } from "@/components/ui/badge"; // Ensure this path is correct

export default function Checkpoint() {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [devices, setDevices] = useState([]);
    const [qrHistory, setQrHistory] = useState([]);

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
            const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);

            const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back'));
            if (rearCamera) {
                setSelectedDevice(rearCamera.deviceId);
            } else if (videoDevices.length > 0) {
                setSelectedDevice(videoDevices[0].deviceId);
            }
        });
    }, []);

    const handleQRCodeScan = useCallback(async (detectedCodes) => {
        if (detectedCodes.length > 0) {
            const scannedCode = detectedCodes[0].rawValue;
            setScanResult(scannedCode);
            setScanning(false);

            setQrHistory(prevHistory => {
                const updatedHistory = [scannedCode, ...prevHistory].slice(0, 5);
                return updatedHistory;
            });

            try {
                const response = await fetch('http://localhost:8080/checkpoint', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ jwt: scannedCode }),
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
        setSelectedDevice(event.target.value);
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
                        {devices.length > 0 && (
                            <select 
                                onChange={handleCameraChange} 
                                value={selectedDevice} 
                                className="mt-2 p-2 bg-gray-200 rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                {devices.map(camera => (
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
                    {scanning && selectedDevice && (
                        <div className="relative w-full max-w-[320px] aspect-square bg-muted rounded-lg overflow-hidden">
                            <Scanner
                                onScan={handleQRCodeScan}
                                onError={handleError}
                                constraints={{ video: { deviceId: selectedDevice } }}
                            />
                        </div>
                    )}
                    {scanResult && <Badge>QR Code Scanned: {scanResult}</Badge>}
                    {error && <Badge variant="destructive">{error}</Badge>}
                    
                    {/* QR Code History */}
                    <div className="mt-4 w-full max-w-md">
                        <Card className="relative p-4 bg-gray-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle>Recent QR Codes</CardTitle>
                            </CardHeader>
                            <CardContent className="relative overflow-hidden max-h-[200px]">
                                <ul className="list-none">
                                    {qrHistory.map((code, index) => (
                                        <li
                                            key={index}
                                            className="truncate overflow-hidden hover:overflow-visible hover:max-h-[unset] transition-all duration-300"
                                        >
                                            {code}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
