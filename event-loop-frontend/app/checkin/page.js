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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Checkin() {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [recentScans, setRecentScans] = useState([]);
    const [alert, setAlert] = useState({ visible: false, message: "", variant: "default" });

    useEffect(() => {
        if (alert.visible) {
            const timer = setTimeout(() => setAlert({ visible: false, message: "", variant: "default" }), 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    const handleQRCodeScan = useCallback(async (data) => {
        if (data) {
            setScanResult(data.text);
            setScanning(false); // Stop scanning when a QR code is scanned
            console.log(data[0]["rawValue"]);
            try {
                const userData = localStorage.getItem("google-oauth");
                if (!userData) {
                    console.error("Local storage is empty");
                }

                const parsedUserData = JSON.parse(userData);

                const response = await fetch(
                    `${process.env.GO_BACKEND_URL}/${parsedUserData.userRole}/checkin`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            jwt: data[0]["rawValue"],
                            sub: parsedUserData.sub,
                        }),
                    },
                );

                const json = await response.json();
                console.log(json);

                switch (response.status) {
                    case 200: {
                        const entrytime = new Date(
                            json.dbParticipant["Checkpoints"]["entry_time"],
                        );

                        const checkinMessage = json.checkin
                            ? `Successful Check-in at ${entrytime}`
                            : `Already checked in at ${entrytime}`;

                        setAlert({
                            visible: true,
                            message: checkinMessage,
                            variant: "success",
                        });

                        setRecentScans((prevScans) => [
                            ...prevScans,
                            json.dbParticipant,
                        ]);
                        break;
                    }
                    case 400: {
                        console.log(json);
                        setAlert({
                            visible: true,
                            message: json.message,
                            variant: "destructive",
                        });
                        break;
                    }
                    case 500: {
                        setAlert({
                            visible: true,
                            message: "Failed DB operation. Contact operators.",
                            variant: "destructive",
                        });
                        break;
                    }
                    default: {
                        setAlert({
                            visible: true,
                            message: "Unexpected error occurred.",
                            variant: "destructive",
                        });
                    }
                }
            } catch (error) {
                console.error("Error while sending JWT:", error);
                setAlert({
                    visible: true,
                    message: "Error while processing the check-in.",
                    variant: "destructive",
                });
            }
        }
    }, []);

    const handleError = (err) => {
        console.error("Error with QR Scanner:", err);
        setError("Camera not accessible.");
    };

    return (
        <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
            <Navbar />

            <Access userRole={["admin", "organiser", "volunteer"]} />

            {alert.visible && (
                <div
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs p-3 rounded-lg shadow-lg
                    ${alert.variant === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}
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
                    <CardTitle>Checkin</CardTitle>
                    <CardDescription>
                        Scan the QR code to authenticate and continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                    {scanning && (
                        <Scanner
                            onScan={(result) => handleQRCodeScan(result)}
                            onError={handleError}
                        />
                    )}
                    {scanResult && <Badge>QR Code Scanned: {scanResult}</Badge>}
                    {error && <Badge variant="destructive">{error}</Badge>}

                    {recentScans.length > 0 && (
                        <Table>
                            <TableCaption>Verified Participants</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Check-in Time</TableHead>
                                    <TableHead>College</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Team</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentScans
                                    .slice()
                                    .reverse()
                                    .map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {row["Participant"].name}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const entrytime = new Date(
                                                        row[
                                                            "Checkpoints"
                                                        ].entry_time,
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
