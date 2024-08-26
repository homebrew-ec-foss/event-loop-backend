"use client";

import Access from "@/components/access";
import Navbar from "@/components/navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { CircleAlert, TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useState, useEffect } from "react";

export default function Participant() {
    const searchParams = useSearchParams();
    const jwtid = searchParams.get("jwtID");
    const name = searchParams.get("name");
    const phone = searchParams.get("phone");

    const toast = useToast();

    // make request to get participant details
    // from /participants end point of processes.env.GO_BACKEND_URL endpoint

    const [participant, setParticipant] = useState(null);
    const [participantCopy, setParticipantCopy] = useState(null);
    const [respMessage, setRespMessage] = useState(null);
    const [success, setSuccess] = useState(false);

    const [editMode, setEditMode] = useState(false);

    const handleSubmit = useCallback(async (e) => {
        // new form
        form = new FormData(e.target);
        // log data to console
        for (var pair of form.entries()) {
            console.log(pair[0] + ", " + pair[1]);
        }
    });

    useEffect(() => {
        async function fetchParticipant() {
            try {
                if (jwtid) {
                    const response = await fetch(
                        `${process.env.GO_BACKEND_URL}/participant?jwtID=${jwtid}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        },
                    );

                    const json = await response.json();
                    console.log(json);

                    switch (response.status) {
                        case 200: {
                            setParticipant(json.dbParticipant);
                            setParticipantCopy(json.dbParticipant);
                            setRespMessage(json.message);
                            setSuccess(true);
                            break;
                        }
                        case 400: {
                            setRespMessage(json.message);
                            break;
                        }
                        case 500: {
                            setRespMessage(json.message);
                            break;
                        }
                    }
                } else if (name && phone) {
                    const response = await fetch(
                        `${process.env.GO_BACKEND_URL}/participant?pname=${name}&pphone=${phone}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        },
                    );

                    const json = await response.json();
                    console.log(json);

                    switch (response.status) {
                        case 200: {
                            setParticipant(json.dbParticipant);
                            setParticipantCopy(json.dbParticipant);
                            setRespMessage(json.message);
                            setSuccess(true);
                            break;
                        }
                        case 400: {
                            setRespMessage(json.message);
                            break;
                        }
                        case 500: {
                            alert("Internal server error");
                            setRespMessage(json.message);
                            break;
                        }
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchParticipant();
    }, [jwtid, name, phone]);

    return (
        <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
            <Navbar />
            <Access userRole={["admin", "organiser", "volunteer"]} />

            {success && (
                <Card>
                    <CardHeader>
                        <CardTitle>Participant Display</CardTitle>
                        <CardDescription>
                            Switch to edit mode to change the details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {
                            <div className="w-full">
                                <form
                                    className="space-y-2"
                                    onSubmit={handleSubmit}
                                >
                                    <Input
                                        className="inline"
                                        placeholder="name"
                                        value={
                                            participantCopy["Participant"].name
                                        }
                                        readOnly={!editMode}
                                        onChange={(e) =>
                                            setParticipantCopy({
                                                ...participantCopy,
                                                Participant: {
                                                    ...participantCopy[
                                                        "Participant"
                                                    ],
                                                    name: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                    <Input
                                        placeholder="email"
                                        value={
                                            participantCopy["Participant"].email
                                        }
                                        readOnly={!editMode}
                                        onChange={(e) =>
                                            setParticipantCopy({
                                                ...participantCopy,
                                                Participant: {
                                                    ...participantCopy[
                                                        "Participant"
                                                    ],
                                                    email: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                    <Input
                                        placeholder="phone"
                                        value={
                                            participantCopy["Participant"].phone
                                        }
                                        readOnly={!editMode}
                                        onChange={(e) =>
                                            setParticipantCopy({
                                                ...participantCopy,
                                                Participant: {
                                                    ...participantCopy[
                                                        "Participant"
                                                    ],
                                                    phone: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                    <Input
                                        placeholder="college"
                                        value={
                                            participantCopy["Participant"]
                                                .college
                                        }
                                        readOnly={!editMode}
                                        onChange={(e) =>
                                            setParticipantCopy({
                                                ...participantCopy,
                                                Participant: {
                                                    ...participantCopy[
                                                        "Participant"
                                                    ],
                                                    college: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                    <Input
                                        placeholder="branch"
                                        value={
                                            participantCopy["Participant"]
                                                .branch
                                        }
                                        readOnly={!editMode}
                                        onChange={(e) =>
                                            setParticipantCopy({
                                                ...participantCopy,
                                                Participant: {
                                                    ...participantCopy[
                                                        "Participant"
                                                    ],
                                                    branch: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                    {participant["Participant"].pesHostel && (
                                        <Input
                                            placeholder="hostel"
                                            value={
                                                participantCopy["Participant"]
                                                    .pesHostel
                                            }
                                            readOnly={!editMode}
                                            onChange={(e) =>
                                                setParticipantCopy({
                                                    ...participantCopy,
                                                    Participant: {
                                                        ...participantCopy[
                                                            "Participant"
                                                        ],
                                                        pesHostel:
                                                            e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    )}
                                    {!participant["Participant"].pesHostel && (
                                        <Input
                                            placeholder="No PES Hostel set"
                                            value={
                                                participantCopy["Participant"]
                                                    .pesHostel
                                            }
                                            readOnly={!editMode}
                                            onChange={(e) =>
                                                console.log(e.target.value)
                                            }
                                        />
                                    )}
                                    <h4>Checkpoints Cleared</h4>
                                    {participant["Checkpoints"].checkin &&
                                        !participant["Checkpoints"]
                                            .checkout && (
                                            <div className="space-y-2">
                                                <Alert className="bg-green-100">
                                                    <CircleAlert className="h-4 w-4" />
                                                    <AlertTitle>
                                                        Participant has checked
                                                        In
                                                    </AlertTitle>
                                                    <AlertDescription>
                                                        Participant has checked
                                                        in at{" "}
                                                        {(() => {
                                                            const entrytime =
                                                                new Date(
                                                                    participant[
                                                                        "Checkpoints"
                                                                    ].exit_time,
                                                                );
                                                            const hours =
                                                                String(
                                                                    entrytime.getHours(),
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                );
                                                            const minutes =
                                                                String(
                                                                    entrytime.getMinutes(),
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                );
                                                            const seconds =
                                                                String(
                                                                    entrytime.getSeconds(),
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                );

                                                            const formattedTime = `${hours}:${minutes}:${seconds}`;

                                                            return formattedTime;
                                                        })()}
                                                    </AlertDescription>
                                                </Alert>
                                                <Input
                                                    className={(() => {
                                                        const checkpoint =
                                                            participant[
                                                                "Checkpoints"
                                                            ].breakfast;
                                                        if (checkpoint) {
                                                            return "bg-green-300";
                                                        } else {
                                                            return "bg-gray-300";
                                                        }
                                                    })()}
                                                    type="text"
                                                    value="Breakfast"
                                                    disabled
                                                />
                                                <Input
                                                    className={(() => {
                                                        const checkpoint =
                                                            participant[
                                                                "Checkpoints"
                                                            ].dinner;
                                                        if (checkpoint) {
                                                            return "bg-green-300";
                                                        } else {
                                                            return "bg-gray-300";
                                                        }
                                                    })()}
                                                    type="text"
                                                    value="Dinner"
                                                    disabled
                                                />
                                                <Input
                                                    className={(() => {
                                                        const checkpoint =
                                                            participant[
                                                                "Checkpoints"
                                                            ].snacks;
                                                        if (checkpoint) {
                                                            return "bg-green-300";
                                                        } else {
                                                            return "bg-gray-300";
                                                        }
                                                    })()}
                                                    type="text"
                                                    value="Snacks"
                                                    disabled
                                                />
                                            </div>
                                        )}
                                    {participant["Checkpoints"].checkout && (
                                        <div className="space-y-2">
                                            <Alert className="bg-yellow-100">
                                                <TriangleAlert className="h-4 w-4" />
                                                <AlertTitle>
                                                    Participant has checked out
                                                </AlertTitle>
                                                <AlertDescription>
                                                    Participant has checked in
                                                    at{" "}
                                                    {(() => {
                                                        const entrytime =
                                                            new Date(
                                                                participant[
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
                                                </AlertDescription>
                                            </Alert>
                                            <Input
                                                className={(() => {
                                                    const checkpoint =
                                                        participant[
                                                            "Checkpoints"
                                                        ].breakfast;
                                                    if (checkpoint) {
                                                        return "bg-green-300";
                                                    } else {
                                                        return "bg-gray-300";
                                                    }
                                                })()}
                                                type="text"
                                                value="Breakfast"
                                                disabled
                                            />
                                            <Input
                                                className={(() => {
                                                    const checkpoint =
                                                        participant[
                                                            "Checkpoints"
                                                        ].dinner;
                                                    if (checkpoint) {
                                                        return "bg-green-300";
                                                    } else {
                                                        return "bg-gray-300";
                                                    }
                                                })()}
                                                type="text"
                                                value="Dinner"
                                                disabled
                                            />
                                            <Input
                                                className={(() => {
                                                    const checkpoint =
                                                        participant[
                                                            "Checkpoints"
                                                        ].snacks;
                                                    if (checkpoint) {
                                                        return "bg-green-300";
                                                    } else {
                                                        return "bg-gray-300";
                                                    }
                                                })()}
                                                type="text"
                                                value="Snacks"
                                                disabled
                                            />
                                        </div>
                                    )}
                                    {editMode && (
                                        <div className="space-y-1">
                                            <Input
                                                type="submit"
                                                value="Submit"
                                                className="text-white font-medium bg-black hover:bg-gray-800 transition-colors 150ms ease-in-out"
                                            />
                                            <Input
                                                type="reset"
                                                value="Reset"
                                                className="text-white font-medium bg-black hover:bg-gray-800 transition-colors 150ms ease-in-out"
                                            />
                                        </div>
                                    )}
                                </form>
                            </div>
                        }
                        <hr />
                        <Button
                            className="w-full"
                            onClick={() => {
                                if (participant["Checkpoints"].checkout) {
                                    toast({
                                        title: "Editing details of participant who has checked out",
                                    });
                                }
                                if (editMode) {
                                    setParticipantCopy(participant);
                                }
                                setEditMode(!editMode);
                            }}
                        >
                            {editMode ? "Cancel" : ""}
                            {/* Edit details */}
                            {!editMode ? "Edit Details" : ""}
                        </Button>
                    </CardContent>
                </Card>
            )}
            {!success && (
                <Alert>
                    <AlertTitle>Participant not found</AlertTitle>
                    <AlertDescription>{respMessage}</AlertDescription>
                </Alert>
            )}
        </main>
    );
}
