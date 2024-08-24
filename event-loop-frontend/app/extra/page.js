'use client';

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function Extra() {
    const [fetchedParticipant, setFetchedParticipant] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [searchMode, setSearchMode] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [scanResultCopy, setScanResultCopy] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form[0].value;
        const email = form[1].value;
        const phone = form[2].value;
        const college = form[3].value;

        try {
            const response = await fetch(
                `${process.env.GO_BACKEND_URL}/search`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, email, phone, college }),
                }
            )
            const json = await response.json();
            console.log(json);

            switch (response.status) {
                case 200: {
                    break;
                }
                case 400: {
                    break;
                }
                case 500: {
                    break;
                }
            }

        } catch (err) {
            console.error(err);
        }
    });

    const handleQrScan = useCallback(async (data) => {
        setScanResult(data.text);
        setScanning(!scanning);

        try {
            const response = await fetch(
                `${process.env.GO_BACKEND_URL}/qrsearch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ type: "jwt", jwt: data[0]["rawValue"] }),
            })

            const json = await response.json();
            console.log(json);

            switch (response.status) {
                case 200: {
                    // alert("Sucessful");
                    setFetchedParticipant(json.dbParticipant);
                    setScanResultCopy(json.dbParticipant);
                    break;
                } case 400 : {
                    alert("Failed Client Side");
                } case 500: {
                    alert("Failed Server Side");
                    break;
                } default: {
                    alert("Not handled");
                }
            }
        } catch (err) {
            console.error(err);
        }
    })

    return (
        <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
            <Navbar />
            <div className="w-full mb-5 items-center">
                {/* <Card className="w-[500px] md:w-[350px] ml-auto mr-auto"> */}
                <Card className="w-[350px] ml-auto mr-auto md:w-[500px]">
                    <CardHeader>
                        <CardTitle>Fetch Participants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {fetchedParticipant && (
                            <div className="flex flex-col gap-2">
                                <Button className="w-full" onClick={() => {
                                    setFetchedParticipant(null);
                                    setScanResult(null);
                                    setScanResultCopy(null);
                                    scanning(false);
                                    setSearchMode(false);
                                }}>Fetch Another</Button>
                                <Button onClick={() => setEditMode(!editMode)} className="w-full">Edit Details</Button>
                            </div>
                        )}
                        {!fetchedParticipant && (
                            <div className="w-full">
                                {!scanning && !searchMode && (
                                    <div className="space-y-3">
                                        <Button className="w-full" onClick={() => setScanning(!scanning)}>Scan QR<QrCode className="ml-5"></QrCode></Button>
                                        <Button className="w-full" onClick={() => setSearchMode(!searchMode)}>Search Participant<UserRound className="ml-5" /></Button>
                                    </div>
                                )}
                                {!scanning && searchMode && (
                                    <div className="space-y-3">
                                        <Button className="w-full" onClick={() => setSearchMode(!searchMode)}>Change Search</Button>
                                    </div>
                                )}
                                {scanning && !searchMode && (
                                    <div className="pt-5 space-y-5">
                                        <Button className="w-full" onClick={() => { setSearchMode(!scanning) }}>Change Search</Button>
                                        <Scanner onScan={(result) => handleQrScan(result)}></Scanner>
                                    </div>
                                )}
                                {searchMode && (
                                    <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                                        <div>
                                            <Label>Participant Name</Label>
                                            <Input type="text" placeholder="Name" required />
                                        </div>

                                        <div>
                                            <Label>Participant Email</Label>
                                            <Input placeholder="Email" type="email" required />
                                        </div>

                                        <div>
                                            <Label>Participant Phone</Label>
                                            <Input type="tel" placeholder="Phone" pattern="[6-9]\d{9}" />
                                        </div>

                                        <div>
                                            <Label>Participant College</Label>
                                            <Input placeholder="College Name" />
                                        </div>

                                        <div className="space-y-3">
                                            <Input type="submit" className="w-full text-white bg-black hover:bg-gray-800" />
                                            <Input type="reset" className="w-full text-white bg-black hover:bg-gray-800" />
                                            {/* <Button type="submit" className="w-full text-center">Submit</Button>
                                            <Button type="submit" className="w-full">Cancel</Button> */}
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {fetchedParticipant && !editMode && (
                    <div className="mt-5">
                        <Label>Name: {fetchedParticipant["Participant"].name}</Label>
                        <br></br>
                        <Label>Email: {fetchedParticipant["Participant"].email}</Label>
                        <br></br>
                        <Label>Phone: {fetchedParticipant["Participant"].phone}</Label>
                        <br></br>
                        <Label>College: {fetchedParticipant["Participant"].college}</Label>
                        {fetchedParticipant["Participant"].pesHostel.length > 0 && (
                            <Label>{fetchedParticipant["Participant"].pesHostel}</Label>
                        )}
                        {fetchedParticipant["Participant"].pesHostel.length == 0 && (
                            <p>Not part of pes hostel</p>
                        )}
                    </div>
                )}

                {fetchedParticipant && editMode && (
                    <form className="mt-5 space-y-3">
                        <div>
                            <Label>Participant Name</Label>
                            <Input placeholder="Name" value={fetchedParticipant["Participant"].name} onChange={(e) => setFetchedParticipant({ ...fetchedParticipant, Participant: { ...fetchedParticipant["Participant"], name: e.target.value } })} />
                        </div>

                        <div>
                            <Label>Participant Email</Label>
                            <Input placeholder="Email" value={fetchedParticipant["Participant"].email} onChange={(e) => setFetchedParticipant({ ...fetchedParticipant, Participant: { ...fetchedParticipant["Participant"], email: e.target.value } })} />
                        </div>

                        <div>
                            <Label>Participant Phone</Label>
                            <Input placeholder="Phone Number" value={fetchedParticipant["Participant"].phone} onChange={(e) => setFetchedParticipant({ ...fetchedParticipant, Participant: { ...fetchedParticipant["Participant"], phone: e.target.value } })} />
                        </div>

                        <div>
                            <Label>Participant Phone</Label>
                            <Input placeholder="College" value={fetchedParticipant["Participant"].college} onChange={(e) => setFetchedParticipant({ ...fetchedParticipant, Participant: { ...fetchedParticipant["Participant"], college: e.target.value } })} />
                        </div>

                        <div>
                            <Button type="submit" className="w-full">Submit</Button>
                            <Button type="submit" className="w-full">Cancel</Button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    )
}