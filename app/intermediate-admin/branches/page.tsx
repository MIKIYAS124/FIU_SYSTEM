"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function BranchManagementPage() {
  const [activeTab, setActiveTab] = useState("add")
  const [addressType, setAddressType] = useState("known")
  const [formData, setFormData] = useState({
    branchName: "",
    branchCode: "",
    country: "",
    stateRegion: "",
    cityTown: "",
    subcityZone: "",
  })

  const [branches, setBranches] = useState<{ id: number; name: string; code: string }[]>([])

  useEffect(() => {
    async function fetchBranches() {
      try {
        const response = await fetch("/api/branches")
        const data = await response.json()
        setBranches(data.data || [])
      } catch (error) {
        console.error("Failed to fetch branches", error)
      }
    }

    fetchBranches()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to add branch")
      }

      const newBranch = await response.json()
      setBranches((prev) => [...prev, newBranch])
      setFormData({ branchName: "", branchCode: "", country: "", stateRegion: "", cityTown: "", subcityZone: "" })
    } catch (error) {
      console.error("Error adding branch", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Branch Management</h2>
        <p className="text-muted-foreground">Manage bank branches and locations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="add">Add Branch</TabsTrigger>
          <TabsTrigger value="list">Branch List</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reporting Entity Detail</CardTitle>
              <CardDescription>Add a new branch to the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input
                    id="branchName"
                    value={formData.branchName}
                    onChange={(e) => handleInputChange("branchName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch Code</Label>
                  <Input
                    id="branchCode"
                    placeholder="Enter unique branch code"
                    value={formData.branchCode}
                    onChange={(e) => handleInputChange("branchCode", e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Address Detail</Label>
                  <RadioGroup value={addressType} onValueChange={setAddressType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="known" id="known" />
                      <Label htmlFor="known">Known</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unknown" id="unknown" />
                      <Label htmlFor="unknown">Unknown</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Please Select --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ethiopia">Ethiopia</SelectItem>
                        <SelectItem value="kenya">Kenya</SelectItem>
                        <SelectItem value="uganda">Uganda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateRegion">State/Region</Label>
                    <Input
                      id="stateRegion"
                      value={formData.stateRegion}
                      onChange={(e) => handleInputChange("stateRegion", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cityTown">City/Town</Label>
                    <Input
                      id="cityTown"
                      value={formData.cityTown}
                      onChange={(e) => handleInputChange("cityTown", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcityZone">Subcity/Zone</Label>
                    <Input
                      id="subcityZone"
                      value={formData.subcityZone}
                      onChange={(e) => handleInputChange("subcityZone", e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Add Branch
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branch Name</CardTitle>
              <CardDescription>Select a branch to manage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input placeholder="Search branches..." />

                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead>Select</TableHead>
                      <TableHead>Branch_ID</TableHead>
                      <TableHead>Branch_Code</TableHead>
                      <TableHead>Branch_Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Select
                          </Button>
                        </TableCell>
                        <TableCell>{branch.id}</TableCell>
                        <TableCell>{branch.code}</TableCell>
                        <TableCell>{branch.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}