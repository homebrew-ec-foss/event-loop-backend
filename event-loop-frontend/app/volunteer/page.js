'use client';

import Navbar from "@/components/navbar";
import Head from "next/head";
import React from "react";

export default function Home() {

    var isVolunteer = true;
    const [data, setData] = React.useState("Not Found");

    return (
        <>
            <Head>Volunteer page</Head>
            <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
                <Navbar />
                <h1 className="text-2xl font-bold">Volunteer Methods</h1>

                {isVolunteer &&
                    <div className="p-0 md:ps-28 pe-28">
                    </div>
                }
                <p>{data}</p>

                {!isVolunteer &&
                    // Not authenticated
                    <h1>Please authenticate</h1>
                }
            </main>
        </>
    );
}