import "./globals.css";
import { isPrime } from "mathjs";
import React, { useState, useEffect } from "react";

export default function Ping() {
    const [response, setResponse] = useState("Waiting for server...");
    const [file, setFile] = useState(null);

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
                setResponse("Couldn't fetch response", error);
            }
        }
        fetchData();
    }, []);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async () => {
        if (file) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('http://localhost:8080/create', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const text = await res.text();
                    console.log("File created successfully:", text);
                } else {
                    throw new Error('Failed to create file');
                }
            } catch (error) {
                console.error("Error while creating file: ", error);
            }
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <p className={`text-3xl font-regular underline`}>{response}</p>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleSubmit}>Submit</button>
        </main>
    );
}
