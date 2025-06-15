"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CrimeTypesPage() {
  const [newCrimeType, setNewCrimeType] = useState("")

  // Mock data
  const crimeTypes = [
    { id: 1, type: "Terrorism And Terrorist Financing" },
    { id: 2, type: "Corruption" },
    { id: 3, type: "Tax Evasion" },
    { id: 4, type: "Human Trafficking" },
    { id: 5, type: "Goods and Cash Smuggling(Contraband)" },
    { id: 6, type: "Illegal Hawala" },
    { id: 7, type: "Fraud" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("New crime type:", newCrimeType)
    setNewCrimeType("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Crime Type</h2>
          <p className="text-muted-foreground">Manage financial crime categories</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">Add Crime Type</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crime Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="crimeType">Crime Type</Label>
            <Input
              id="crimeType"
              placeholder="Enter new crime type"
              value={newCrimeType}
              onChange={(e) => setNewCrimeType(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader className="bg-gray-600">
              <TableRow>
                <TableHead className="text-white">Action</TableHead>
                <TableHead className="text-white">Crime Id</TableHead>
                <TableHead className="text-white">Crime Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crimeTypes.map((crime) => (
                <TableRow key={crime.id}>
                  <TableCell>
                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                      Select
                    </Button>
                  </TableCell>
                  <TableCell>{crime.id}</TableCell>
                  <TableCell>{crime.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end space-x-2">
            <Button className="bg-blue-600 hover:bg-blue-700">Save</Button>
            <Button className="bg-green-600 hover:bg-green-700">Update</Button>
            <Button className="bg-red-600 hover:bg-red-700">Delete</Button>
            <Button className="bg-orange-500 hover:bg-orange-600">Reset</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
