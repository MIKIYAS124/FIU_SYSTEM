"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"

export default function TransactionMannerPage() {
  const [newTransactionManner, setNewTransactionManner] = useState("")

  // Mock data
  const transactionManners = [
    { id: 1, manner: "Telegram Transfer" },
    { id: 2, manner: "Account To Account" },
    { id: 3, manner: "Cash" },
    { id: 4, manner: "International Transaction" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("New transaction manner:", newTransactionManner)
    setNewTransactionManner("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transaction Manner</h2>
        <p className="text-muted-foreground">Manage transaction types and methods</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Transaction Manner</CardTitle>
            <CardDescription>Create a new transaction manner type</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionManner">Transaction Manner</Label>
                <Input
                  id="transactionManner"
                  placeholder="Enter new transaction manner"
                  value={newTransactionManner}
                  onChange={(e) => setNewTransactionManner(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Add Transaction Manner
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Manner List</CardTitle>
            <CardDescription>View and manage existing transaction manners</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Id</TableHead>
                  <TableHead>Transaction Manner</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionManners.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.manner}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end space-x-2 mt-4">
              <Button>Save</Button>
              <Button variant="secondary">Update</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="outline">Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
