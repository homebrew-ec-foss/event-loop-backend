'use client';

import { useRouter } from 'next/navigation';
import Router from 'next/router';
import { useEffect } from 'react';

export default function Access({ userRole }) {
    // const navigate = useNavigation();
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem("google-oauth");

            if (!userData) {
                router.push("/");
            } else {
                const parsedUserData = JSON.parse(userData);
                if (parsedUserData.loggedIn && userRole.includes(parsedUserData.userRole)) {
                    console.log("User is authorised");
                } else {
                    router.push("/");
                }
            }
        }
    }, [userRole, router]);

    return null;
}
