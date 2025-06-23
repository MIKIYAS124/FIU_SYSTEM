"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CrimeTypesPage() {
  const [crimeTypes, setCrimeTypes] = useState<{ id: number; type: string }[]>([])
  const [inputType, setInputType] = useState("")
  const [selectedCrimeType, setSelectedCrimeType] = useState<{ id: number; type: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCrimeTypes()
  }, [])

  async function fetchCrimeTypes() {
    try {
      setLoading(true)
      const response = await fetch("/api/crime-types")
      const data = await response.json()
      setCrimeTypes(data.data || [])
    } catch (error) {
      console.error("Failed to fetch crime types", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputType.trim()) return
    try {
      setLoading(true)
      const response = await fetch("/api/crime-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: inputType }),
      })
      if (!response.ok) throw new Error("Failed to add new crime type")
      const addedCrimeType = await response.json()
      setCrimeTypes((prev) => [...prev, { id: addedCrimeType.id, type: addedCrimeType.type }])
      setInputType("")
    } catch (error) {
      console.error("Error adding new crime type", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (crime: { id: number; type: string }) => {
    setSelectedCrimeType(crime)
    setInputType(crime.type)
  }

  const handleUpdate = async () => {
    if (!selectedCrimeType || !inputType.trim()) return
    try {
      setLoading(true)
      const response = await fetch(`/api/crime-types/${selectedCrimeType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: inputType }),
      })
      if (!response.ok) throw new Error("Failed to update crime type")
      const updatedCrimeType = await response.json()
      setCrimeTypes((prev) =>
        prev.map((crime) =>
          crime.id === updatedCrimeType.id ? { id: updatedCrimeType.id, type: updatedCrimeType.type } : crime
        )
      )
      setSelectedCrimeType(null)
      setInputType("")
    } catch (error) {
      console.error("Error updating crime type", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCrimeType) return
    try {
      setLoading(true)
      const response = await fetch(`/api/crime-types/${selectedCrimeType.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete crime type")
      setCrimeTypes((prev) => prev.filter((crime) => crime.id !== selectedCrimeType.id))
      setSelectedCrimeType(null)
      setInputType("")
    } catch (error) {
      console.error("Error deleting crime type", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedCrimeType(null)
    setInputType("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Crime Type</h2>
          <p className="text-muted-foreground">Manage financial crime categories</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crime Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={selectedCrimeType ? (e) => { e.preventDefault(); handleUpdate(); } : handleAdd} className="space-y-2">
            <Label htmlFor="crimeType">Crime Type</Label>
            <Input
              id="crimeType"
              placeholder="Enter crime type"
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {selectedCrimeType ? "Update Crime Type" : "Add Crime Type"}
            </Button>
          </form>

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
                <TableRow key={crime.id} className={selectedCrimeType?.id === crime.id ? "bg-blue-100" : ""}>
                  <TableCell>
                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600" onClick={() => handleSelect(crime)}>
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
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd} disabled={loading || !inputType || selectedCrimeType !== null}>
              Save
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpdate} disabled={loading || !selectedCrimeType}>
              Update
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={loading || !selectedCrimeType}>
              Delete
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleReset} disabled={loading && !selectedCrimeType && !inputType}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}