"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";  // Import useRouter from next/navigation
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { GoogleLogin, googleLogout } from "@react-oauth/google";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter(); // Initialize the router

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("google-oauth"));
        if (userData) {
            setIsLoggedIn(userData.loggedIn);
        }
    }, []);

    const handleLogout = () => {
        googleLogout();
        console.log("User logged out");
        localStorage.removeItem("google-oauth");
        setIsLoggedIn(false); // Update login state
        router.push('/'); // Redirect to homepage
    };

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Home
                        </NavigationMenuLink>
                    </Link>
                    <Link href="/ping" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Ping
                        </NavigationMenuLink>
                    </Link>
                    {(() => {
                        return typeof window !== 'undefined' ? localStorage.getItem("google-oauth") : null;
                    })() && (() => {
                        const userData = JSON.parse(localStorage.getItem("google-oauth"));
                        return userData.userRole === "admin";
                    })() && (
                        <Link href="/create" legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                Create
                            </NavigationMenuLink>
                        </Link>
                    )}
                    {(() => {
                        return typeof window !== 'undefined' ? localStorage.getItem("google-oauth") : null;
                    })() && (() => {
                        const userData = JSON.parse(localStorage.getItem("google-oauth"));
                        return (
                            userData.userRole === "admin" ||
                            userData.userRole === "volunteer"
                        );
                    })() && (
                        <div className="inline">
                            <Link href="/checkpoint" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Checkpoint
                                </NavigationMenuLink>
                            </Link>
                            <Link href="/checkin" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Checkin
                                </NavigationMenuLink>
                            </Link>
                            <Link href="/checkout" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Checkout
                                </NavigationMenuLink>
                            </Link>
                        </div>
                    )}
                </NavigationMenuItem>
            </NavigationMenuList>
            {isLoggedIn ? (
                <button
                    onClick={handleLogout}
                    className="absolute right-4 top-4 bg-red-500 text-white py-1 px-3 rounded"
                >
                    Logout
                </button>
            ) : null}
        </NavigationMenu>
    );
}
