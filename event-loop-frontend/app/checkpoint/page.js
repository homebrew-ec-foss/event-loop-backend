"use client";

import "@/app/globals.css";
import React, { useState, useCallback, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import QrCodeIcon from "@/components/ui/icon";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import Access from "@/components/access";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Checkpoint() {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [checkpointOption, setCheckpointOption] = useState(null);
    const [recentScans, setRecentScans] = useState([]);
    const [alert, setAlert] = useState({ visible: false, message: "", variant: "default" });

    const checkpoints = ["Breakfast", "Dinner", "Snacks"];

    const handleQRCodeScan = useCallback(async (data, checkpoint) => {
        if (data) {
            setScanResult(data.text);
            setScanning(false); // Stop scanning when a QR code is scanned

            try {
                const userData = localStorage.getItem("google-oauth");
                if (!userData) {
                    throw new Error("Local storage is empty");
                }

                const parsedUserData = JSON.parse(userData);

                const response = await fetch(
                    `${process.env.GO_BACKEND_URL}/${parsedUserData.userRole}/checkpoint`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            jwt: data[0]["rawValue"],
                            checkpoint: checkpoint,
                            sub: parsedUserData.sub,
                        }),
                    },
                );

                const json = await response.json();

                switch (response.status) {
                    case 200:
                        if (json.operation && json.checkpointCleared) {
                            setAlert({
                                visible: true,
                                message: `Successful checkpoint (${checkpoint}) update!`,
                                variant: "success",
                            });
                        } else if (json.operation && !json.checkpointCleared) {
                            setAlert({
                                visible: true,
                                message: `Participant has already cleared the checkpoint ${checkpoint}`,
                                variant: "info",
                            });
                        }
                        setRecentScans((prevScans) => [
                            ...prevScans,
                            json.dbParticipant,
                        ]);
                        break;

                    case 400:
                        setAlert({
                            visible: true,
                            message: json.message,
                            variant: "destructive",
                        });
                        break;

                    case 500:
                        setAlert({
                            visible: true,
                            message: `Server side error: ${json.message}`,
                            variant: "destructive",
                        });
                        break;

                    default:
                        setAlert({
                            visible: true,
                            message: "Unexpected error.",
                            variant: "destructive",
                        });
                }
            } catch (error) {
                setAlert({
                    visible: true,
                    message: `Error: ${error.message}`,
                    variant: "destructive",
                });
            }
        }
    }, []);

    useEffect(() => {
        if (alert.visible) {
            const timer = setTimeout(() => setAlert({ visible: false, message: "", variant: "default" }), 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    const videoConstraints = selectedCamera
        ? {
              deviceId: { exact: selectedCamera },
              facingMode: "environment",
              width: 1280,
              height: 720,
          }
        : {};

    return (
        <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
            <Navbar />
            <Access userRole={["admin", "organiser", "volunteer"]} />

            {alert.visible && (
                <div
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs p-3 rounded-lg shadow-lg
                    ${alert.variant === "success" ? "bg-green-500 text-white" : alert.variant === "destructive" ? "bg-red-500 text-white" : "bg-blue-500 text-white"}
                    animate-slide-down`}
                    onClick={() => setAlert({ visible: false, message: "", variant: "default" })}
                >
                    <AlertTitle className="text-sm font-bold">
                        {alert.variant === "success" ? "Success" : "Error"}
                    </AlertTitle>
                    <AlertDescription className="text-xs">
                        {alert.message}
                    </AlertDescription>
                </div>
            )}

            <Card className="hover:bg-slate-100 transition duration-200 ease-in-out">
                <CardHeader className="flex flex-col items-center">
                    {checkpointOption != null && (
                        <div className="flex flex-col items-center gap-4 mb-6">
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
                    )}
                    <CardTitle>Checkpoint</CardTitle>
                    <CardDescription>
                        Scan the QR code to authenticate and continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                    {checkpointOption != null && (
                        <Button
                            onClick={() => setCheckpointOption(null)}
                            className="w-full mb-3"
                        >
                            Change {checkpointOption}
                        </Button>
                    )}
                    {checkpointOption == null && (
                        <div className="flex flex-col gap-3 w-full">
                            {checkpoints.map((checkpoint) => (
                                <Button
                                    key={checkpoint}
                                    onClick={() => setCheckpointOption(checkpoint)}
                                    className="w-full"
                                >
                                    {checkpoint}
                                </Button>
                            ))}
                        </div>
                    )}

                    {scanning && (
                        <Scanner
                            onScan={(result) =>
                                handleQRCodeScan(result, checkpointOption)
                            }
                        />
                    )}
                    {scanResult && <Badge>QR Code Scanned: {scanResult}</Badge>}
                    {error && <Badge variant="destructive">{error}</Badge>}

                    {recentScans.length > 0 && (
                        <Table>
                            <TableCaption>Verified CSV form</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Team</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentScans.reverse().map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row["Participant"].name}</TableCell>
                                        <TableCell>{row["Participant"].phone}</TableCell>
                                        <TableCell>{row["Participant"].team}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
