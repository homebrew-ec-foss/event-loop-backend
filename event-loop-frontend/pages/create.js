"use client"

import "@/app/globals.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {useToast} from "@/components/ui/use-toast"
import * as React from "react"

import { useState } from "react";


export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast()

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/create", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();

      if (response.ok) {
        setStatus("File processed successfully");
        setContent(text);
      } else {
        setStatus("Failed to upload file");
        setContent(text);
      }
    } catch (error) {
      setStatus("Error: " + error.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4">
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Event</CardTitle>
        <CardDescription>Please enter relevant inputs</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={() => {}}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label>Event Name</Label>
              <Input id="event-name" type="text" placeholder="Enter your event name" required/>
            </div>  
            {/* <div className="flex flex-col space-y-1.5">
              <Label>Event Date</Label>
              <Input id="event-date" type="date" placeholder="Enter event date" required/>
            </div>   */}
            <div className="flex flex-col space-y-1.5">
              <Label>Registrants CSV</Label>
              <Input type="file" accept=".csv" />
            </div>  
            <div className="flex flex-col space-y-1.5">
              <Button type="submit" onClick={() => {
                toast({
                  title: "Event Created",
                  description: "Event has been created successfully",
                  type: "success",
                });
              }}>Submit</Button>
            </div>  
          </div> 
        </form>
      </CardContent>
    </Card>

    <div>
      <h1>Upload a File</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".csv" />
        <button type="submit">Upload</button>
      </form>
      {status && <p>{status}</p>}
      {content && (
        <div>
          <h2>Response:</h2>
          <pre>{content}</pre>
        </div>
      )}
    </div>
    </main>
  );
}
