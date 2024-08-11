import "./globals.css";
import { isPrime } from "mathjs";
import React, { useState, useEffect } from "react";

export default function Ping() {
    const [response, setResponse] = useState("Waiting for server...");

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('http://localhost:8080/ping', {
                    method: 'GET',
                });
                if (res.ok) {
                    const text = await res.text();
                    setResponse(text);
                } else {
                    throw new Error('Failed to fetch');
                }
            } catch (error) {
                console.error("Error while fetching ping response: ", error);
                setResponse("Couldnt fetch response", error);
            }
        }
        fetchData();
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <p className={`text-3xl font-regular underline`}>{response}</p>
        </main>
    );
}
