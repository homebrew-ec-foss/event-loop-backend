"use client"

import "@/app/globals.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as React from "react"

export default function ToastSimple() {


  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-10">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create a database</CardTitle>
          <CardDescription>Input your csv file of responses</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label id="ename">Event Name</Label>
                <Input id="ename" placeholder="Entire event name" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Input id="csvfile" type="file" />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
