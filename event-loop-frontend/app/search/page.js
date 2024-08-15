import Navbar from "@/components/navbar";

import "@/app/globals.css";

export default function Search() {
    return (
        <main className="flex min-h-screen flex-col p-5 md:p-28 gap-4">
            <Navbar />
            <h1 className="text-4xl font-bold">Search</h1>
        </main>
    );
}

Search.getLayout = function getLayout(page) {
    return (
        <html lang="en" className='dark'>
            <body>{page}</body>
        </html>
    );
}