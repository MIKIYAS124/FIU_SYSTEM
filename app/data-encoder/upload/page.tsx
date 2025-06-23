"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"

export default function UploadPage() {
  const [formData, setFormData] = useState({
    whoIsConducting: "",
    selectedFile: null as File | null,
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, selectedFile: file }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Upload form submitted:", formData)
  }

  const handleReset = () => {
    setFormData({
      whoIsConducting: "",
      selectedFile: null,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload CTR Reports</h2>
        <p className="text-muted-foreground">Bulk upload currency transaction reports</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>To Upload CTR Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="whoIsConducting">Who is Conducting The Transaction</Label>
              <Select
                value={formData.whoIsConducting}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, whoIsConducting: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Please Select --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileUpload">All Transaction Data File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="fileUpload" className="cursor-pointer">
                    <Input
                      id="fileUpload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline">
                      Choose Files
                    </Button>
                  </Label>
                  <p className="mt-2 text-sm text-gray-500">
                    {formData.selectedFile ? formData.selectedFile.name : "No file chosen"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Load to Database
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
