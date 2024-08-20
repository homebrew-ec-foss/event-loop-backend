"use client";

import "@/app/globals.css";
import React, { useState, useEffect, useCallback } from "react";
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
import { Button } from "@/components/ui/button";

export default function Checkpoint() {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);

    // checkpoint states
    const [checkpointOption, setCheckpointOption] = useState(null);

    const checkpoints = ["Breakfast", "Dinner", "Snacks"];

    // const [recentScans, setRecentScans] = useState([]);
    const [recentScans, setRecentScans] = useState([]);

    const handleQRCodeScan = useCallback(async (data, checkpoint) => {
        if (data) {
            setScanResult(data.text);
            setScanning(false); // Stop scanning when a QR code is scanned
            console.log(data[0]["rawValue"]);
            console.log(checkpoint);

            try {
                const response = await fetch(
                    `${process.env.GO_BACKEND_URL}/checkpoint`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            jwt: data[0]["rawValue"],
                            checkpoint: checkpoint,
                        }),
                    },
                );
                // if (response.ok) {
                //     console.log("JWT sent successfully");
                //     const resp = await response.json();
                //     console.log("Response:", resp.claims);
                //     // append resp.claims json to recentScans

                //     // if not in recentScans, add it
                //     setRecentScans((prevScans) => [...prevScans, resp.claims]);

                //     console.log("Recent Scans:", recentScans);
                // } else {
                //     console.error("Failed to send JWT");
                // }

                const json = await response.json();

                switch (response.status) {
                    case 200: {
                        if (json.operation && json.checkpointCleared) {
                            console.log("Already had some stuff")
                            alert(`Successful checkpoint(${checkpoint}) update!`)
                        } else if (json.operation && !json.checkpointCleared) {
                            console.log("Already had some stuff")
                            alert(`Participant has already cleared the checkpoint ${checkpoint}`)
                        }
                        setRecentScans((prevScans) => [
                            ...prevScans,
                            json.dbParticipant,
                        ]);
                        break;
                    }

                    case 400: {
                        alert(`${json.message}`);
                        break;
                    }

                    case 500: {
                        alert(`Server side error: ${json.message}`);
                        break;
                    }
                }

            } catch (error) {
                console.error("Error while sending JWT:", error);
            }
        }
    }, []);

    const videoConstraints = selectedCamera
        ? {
              deviceId: { exact: selectedCamera },
              facingMode: "environment", // ill set it as environment as of now wont say exact, but device can be changed
              width: 1280,
              height: 720,
          }
        : {};

    return (
        <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
            <Navbar />

            <Card className="hover:bg-slate-100 transition duration-200 ease-in-out">
                <CardHeader className="flex flex-col items-center">
                    {checkpointOption != null && (
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={() => setScanning(!scanning)}
                                aria-label={
                                    scanning ? "Close Scanner" : "Open Scanner"
                                }
                                className="flex items-center gap-2 p-2 bg-gray-200 rounded"
                            >
                                <QrCodeIcon className="w-12 h-12 text-primary" />
                                <span className="text-sm">
                                    {scanning
                                        ? "Click to close scanner"
                                        : "Click to open scanner"}
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
                            onClick={() => {
                                setCheckpointOption(null);
                            }}
                            className="w-full mb-3"
                        >
                            Change {checkpointOption}
                        </Button>
                    )}
                    {checkpointOption == null && (
                        <div className="flex flex-col gap-3 w-full">
                            <Button
                                onClick={() => {
                                    setCheckpointOption("Breakfast");
                                }}
                                className="w-full"
                            >
                                Breakfast
                            </Button>
                            <Button
                                onClick={() => {
                                    setCheckpointOption("Dinner");
                                }}
                                className="w-full"
                            >
                                Dinner
                            </Button>
                            <Button
                                onClick={() => {
                                    setCheckpointOption("Snacks");
                                }}
                                className="w-full"
                            >
                                Snacks
                            </Button>
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

                    {recentScans && (
                        <Table className="">
                            {/* fill table with setJsonResponse */}
                            <TableCaption>Verified CSV form</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Team</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentScans &&
                                    recentScans.reverse().map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {row["Participant"].name}
                                            </TableCell>
                                            <TableCell>
                                                {row["Participant"].phone}
                                            </TableCell>
                                            <TableCell>
                                                {row["Participant"].team}
                                            </TableCell>
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
