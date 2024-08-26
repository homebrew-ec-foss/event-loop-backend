"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { GoogleLogin } from "@react-oauth/google";
import jwt from "jsonwebtoken";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Home() {
    const [alert, setAlert] = useState({ visible: false, message: "", variant: "default" });

    useEffect(() => {
        if (alert.visible) {
            const timer = setTimeout(() => setAlert({ visible: false, message: "", variant: "default" }), 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        console.log("Login Success:", credentialResponse);

        try {
            if (credentialResponse.credential) {
                const userObject = jwt.decode(credentialResponse.credential);
                console.log("Logged in user information:", userObject);

                // Send user info to backend
                const response = await fetch(
                    `${process.env.GO_BACKEND_URL}/login`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: userObject.email,
                            name: userObject.name,
                            sub: userObject.sub,
                        }),
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    console.log(data["dbAuthUser"].UserRole);
                    console.log("Server response:", data);
                    localStorage.setItem(
                        "google-oauth",
                        JSON.stringify({
                            sub: userObject.sub,
                            email: userObject.email,
                            userRole: data["dbAuthUser"].UserRole,
                            loggedIn: true,
                        }),
                    );
                    setAlert({
                        visible: true,
                        message: `You have successfully logged in as ${data["dbAuthUser"].UserRole}`,
                        variant: "success",
                    });
                } else {
                    setAlert({
                        visible: true,
                        message: "Invalid user login. Please contact admin.",
                        variant: "destructive",
                    });
                    localStorage.removeItem("google-oauth");
                    console.error("Failed to send user info to server");
                }
            } else {
                localStorage.removeItem("google-oauth");
                console.error("No credential found in response");
            }
        } catch (error) {
            setAlert({
                visible: true,
                message: "Error decoding JWT token. Please try again.",
                variant: "destructive",
            });
            localStorage.removeItem("google-oauth");
            console.error("Error decoding JWT token:", error);
        }
    };

    const handleGoogleLoginFailure = () => {
        setAlert({
            visible: true,
            message: "Login Failed. Please try again.",
            variant: "destructive",
        });
        console.log("Login Failed");
    };

    return (
        <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
            <Navbar />
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
                <CardHeader>
                    <CardTitle>Welcome to Event-Loop</CardTitle>
                    <CardDescription>
                        Get started with creating your event
                    </CardDescription>
                </CardHeader>
            </Card>
            <div className="mt-4">
                {!(() => {
                    return typeof window !== "undefined" ? localStorage.getItem("google-oauth") : null;
                })() && (
                    <div className="mt-4">
                        <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={handleGoogleLoginFailure}
                        />
                    </div>
                )}
            </div>
            <footer>
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                    &copy; JS Hate.
                </p>
            </footer>
        </main>
    );
}
