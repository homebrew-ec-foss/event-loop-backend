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
import Access from "@/components/access";

export default function Checkin() {
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
                // Request
                const response = await fetch(
                    `${process.env.GO_BACKEND_URL}/checkout`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ jwt: data[0]["rawValue"] }),
                    },
                );

                const json = await response.json();

                switch (response.status) {
                    case 200: {
                        // Valid request from client
                        // JWT has been sent successfully

                        const entrytime = new Date(
                            json.dbParticipant["Checkpoints"]["exit_time"],
                        );

                        // Oh my god is type safety even
                        // a thing!?

                        if (json.operation && json.checkout) {
                            alert(`Suffessful checked out at ${entrytime}`);
                        } else if (json.operation && !json.checkout) {
                            alert(`Already checked out at ${entrytime}`);
                        }

                        // Append participants to rencet scans
                        // table
                        setRecentScans((prevScans) => [
                            ...prevScans,
                            json.dbParticipant,
                        ]);
                        break;
                    }
                    case 400: {
                        // Bad request by client
                        console.log(json);
                        alert(`${json.message}`);
                        break;
                    }
                    case 500: {
                        // Internal Server Error
                        alert(
                            "Seems to be there is a failed db operation. Contact operators",
                        );
                        break;
                    }
                    default: {
                        alert("Seems like this isn't handled correctly");
                    }
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

            <Access userRole={["admin", "organiser", "volunteer"]} />

            <Card className="hover:bg-slate-100 transition duration-200 ease-in-out">
                <CardHeader className="flex flex-col ">
                    <div className="flex flex-col items-center gap-4 mb-6">
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
                    <CardTitle>Checkout Participants</CardTitle>
                    <CardDescription>
                        Scan the QR code to authenticate and continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                    {scanning && (
                        <Scanner
                            onScan={(result) => handleQRCodeScan(result)}
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
                                    <TableHead>Checkout Time</TableHead>
                                    <TableHead>College</TableHead>
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
                                                {(() => {
                                                    const entrytime = new Date(
                                                        row[
                                                            "Checkpoints"
                                                        ].exit_time,
                                                    );
                                                    const hours = String(
                                                        entrytime.getHours(),
                                                    ).padStart(2, "0");
                                                    const minutes = String(
                                                        entrytime.getMinutes(),
                                                    ).padStart(2, "0");
                                                    const seconds = String(
                                                        entrytime.getSeconds(),
                                                    ).padStart(2, "0");

                                                    const formattedTime = `${hours}:${minutes}:${seconds}`;

                                                    return formattedTime;
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {row["Participant"].college}
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
