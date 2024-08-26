"use client";

import React, { useState } from "react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import jwt from "jsonwebtoken";

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userDetails, setUserDetails] = useState({});

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        console.log("Login Success:", credentialResponse);

        try {
            if (credentialResponse.credential) {
                const userObject = jwt.decode(credentialResponse.credential);
                console.log("Logged in user information:", userObject);

                // Send user info to be
                const response = await fetch(`${process.env.GO_BACKEND_URL}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: userObject.email,
                        name: userObject.name,
                        sub: userObject.sub,
                    }),
                });

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
                    setIsLoggedIn(true); // Set user as logged in
                } else {
                    localStorage.removeItem("google-oauth");
                    console.error("Failed to send user info to server");
                }
            } else {
                localStorage.removeItem("google-oauth");
                console.error("No credential found in response");
            }
        } catch (error) {
            localStorage.removeItem("google-oauth");
            console.error("Error decoding JWT token:", error);
        }
    };

    const handleGoogleLoginFailure = () => {
        console.log("Login Failed");
        // Handle the faile case
    };

    const handleLogout = () => {
        googleLogout();
        console.log("User logged out");
        localStorage.removeItem("google-oauth");
        setIsLoggedIn(false); // Set user as logged out
    };

    return (
        <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
            <Navbar />
            <Card className="hover:bg-slate-100 transition duration-200 ease-in-out">
                <CardHeader>
                    <CardTitle>Welcome to Event-Loop</CardTitle>
                    <CardDescription>
                        Get started with creating your event
                    </CardDescription>
                </CardHeader>
            </Card>
            <div className="mt-4">
                {localStorage.getItem("google-oauth") &&
                    JSON.parse(localStorage.getItem("google-oauth"))
                        .loggedIn === true && (
                        <button
                            onClick={handleLogout}
                            className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded"
                        >
                            Logout
                        </button>
                    )}
                {!localStorage.getItem("google-oauth") && (
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
