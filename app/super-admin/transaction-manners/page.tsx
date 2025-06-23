"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TransactionMannersPage() {
  const [manners, setManners] = useState<{ id: number; type: string }[]>([])
  const [inputType, setInputType] = useState("")
  const [selectedManner, setSelectedManner] = useState<{ id: number; type: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchManners()
  }, [])

  async function fetchManners() {
    try {
      setLoading(true)
      const response = await fetch("/api/transaction-manners")
      const data = await response.json()
      setManners(data.data || [])
    } catch (error) {
      console.error("Failed to fetch transaction manners", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputType.trim()) return
    try {
      setLoading(true)
      const response = await fetch("/api/transaction-manners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: inputType }),
      })
      if (!response.ok) throw new Error("Failed to add new transaction manner")
      const addedManner = await response.json()
      setManners((prev) => [...prev, { id: addedManner.id, type: addedManner.type }])
      setInputType("")
    } catch (error) {
      console.error("Error adding new transaction manner", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (manner: { id: number; type: string }) => {
    setSelectedManner(manner)
    setInputType(manner.type)
  }

  const handleUpdate = async () => {
    if (!selectedManner || !inputType.trim()) return
    try {
      setLoading(true)
      const response = await fetch(`/api/transaction-manners/${selectedManner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: inputType }),
      })
      if (!response.ok) throw new Error("Failed to update transaction manner")
      const updatedManner = await response.json()
      setManners((prev) =>
        prev.map((manner) =>
          manner.id === updatedManner.id ? { id: updatedManner.id, type: updatedManner.type } : manner
        )
      )
      setSelectedManner(null)
      setInputType("")
    } catch (error) {
      console.error("Error updating transaction manner", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedManner) return
    try {
      setLoading(true)
      const response = await fetch(`/api/transaction-manners/${selectedManner.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete transaction manner")
      setManners((prev) => prev.filter((manner) => manner.id !== selectedManner.id))
      setSelectedManner(null)
      setInputType("")
    } catch (error) {
      console.error("Error deleting transaction manner", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedManner(null)
    setInputType("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transaction Manner</h2>
          <p className="text-muted-foreground">Manage transaction manner categories</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Manner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={selectedManner ? (e) => { e.preventDefault(); handleUpdate(); } : handleAdd} className="space-y-2">
            <Label htmlFor="transactionManner">Transaction Manner</Label>
            <Input
              id="transactionManner"
              placeholder="Enter transaction manner"
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {selectedManner ? "Update Transaction Manner" : "Add Transaction Manner"}
            </Button>
          </form>

          <Table>
            <TableHeader className="bg-gray-600">
              <TableRow>
                <TableHead className="text-white">Action</TableHead>
                <TableHead className="text-white">Manner Id</TableHead>
                <TableHead className="text-white">Transaction Manner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manners.map((manner) => (
                <TableRow key={manner.id} className={selectedManner?.id === manner.id ? "bg-blue-100" : ""}>
                  <TableCell>
                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600" onClick={() => handleSelect(manner)}>
                      Select
                    </Button>
                  </TableCell>
                  <TableCell>{manner.id}</TableCell>
                  <TableCell>{manner.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end space-x-2">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd} disabled={loading || !inputType || selectedManner !== null}>
              Save
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpdate} disabled={loading || !selectedManner}>
              Update
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={loading || !selectedManner}>
              Delete
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleReset} disabled={loading && !selectedManner && !inputType}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 