"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"

export default function ReportingEntitiesPage() {
  const [activeTab, setActiveTab] = useState("list")
  const [formData, setFormData] = useState({
    entityName: "",
    taxId: "",
    businessType: "",
    issuingCountry: "",
    registrationNumber: "",
    countryOfOrigin: "",
    country: "",
    stateRegion: "",
    cityTown: "",
    subcityZone: "",
    woreda: "",
    kebele: "",
    houseNumber: "",
    postalAddress: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission
  }

  const handleReset = () => {
    setFormData({
      entityName: "",
      taxId: "",
      businessType: "",
      issuingCountry: "",
      registrationNumber: "",
      countryOfOrigin: "",
      country: "",
      stateRegion: "",
      cityTown: "",
      subcityZone: "",
      woreda: "",
      kebele: "",
      houseNumber: "",
      postalAddress: "",
    })
  }

  // Mock data for the table
  const entities = [
    {
      id: 1,
      name: "Commercial Bank of Ethiopia",
      taxId: "TIN001234567",
      businessType: "Commercial Bank",
      country: "Ethiopia",
      status: "Active",
    },
    {
      id: 2,
      name: "Dashen Bank S.C.",
      taxId: "TIN001234568",
      businessType: "Commercial Bank",
      country: "Ethiopia",
      status: "Active",
    },
    {
      id: 3,
      name: "Bank of Abyssinia",
      taxId: "TIN001234569",
      businessType: "Commercial Bank",
      country: "Ethiopia",
      status: "Inactive",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reporting Entities</h2>
          <p className="text-muted-foreground">Manage financial institutions and reporting entities</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Entity List</TabsTrigger>
          <TabsTrigger value="add">Add New Entity</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reporting Entity List</CardTitle>
              <CardDescription>View and manage all registered reporting entities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity Name</TableHead>
                    <TableHead>Tax ID</TableHead>
                    <TableHead>Business Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell>{entity.taxId}</TableCell>
                      <TableCell>{entity.businessType}</TableCell>
                      <TableCell>{entity.country}</TableCell>
                      <TableCell>
                        <Badge variant={entity.status === "Active" ? "default" : "secondary"}>{entity.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reporting Entity Detail</CardTitle>
              <CardDescription>Add a new reporting entity to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entityName">Reporting Entity Name</Label>
                    <Input
                      id="entityName"
                      placeholder="Enter Reporting Entity Name"
                      value={formData.entityName}
                      onChange={(e) => handleInputChange("entityName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax Identification Number</Label>
                    <Input
                      id="taxId"
                      placeholder="Enter Tax Identification Number"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange("taxId", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Type Of Business</Label>
                    <Input
                      id="businessType"
                      placeholder="Enter Type Of Business"
                      value={formData.businessType}
                      onChange={(e) => handleInputChange("businessType", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issuingCountry">Issuing Country</Label>
                    <Input
                      id="issuingCountry"
                      placeholder="Enter Issuing Country"
                      value={formData.issuingCountry}
                      onChange={(e) => handleInputChange("issuingCountry", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      placeholder="Enter Registration Number"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countryOfOrigin">Country Of Origin</Label>
                    <Input
                      id="countryOfOrigin"
                      placeholder="Enter Country Of Origin"
                      value={formData.countryOfOrigin}
                      onChange={(e) => handleInputChange("countryOfOrigin", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Reporting Entity Detail</h3>
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
                        placeholder="Enter Tax Identification Number"
                        value={formData.stateRegion}
                        onChange={(e) => handleInputChange("stateRegion", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cityTown">City/Town</Label>
                      <Input
                        id="cityTown"
                        placeholder="Enter City/Town"
                        value={formData.cityTown}
                        onChange={(e) => handleInputChange("cityTown", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subcityZone">Subcity/Zone</Label>
                      <Input
                        id="subcityZone"
                        placeholder="Enter Subcity/Zone"
                        value={formData.subcityZone}
                        onChange={(e) => handleInputChange("subcityZone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="woreda">Woreda</Label>
                      <Input
                        id="woreda"
                        placeholder="Enter Woreda"
                        value={formData.woreda}
                        onChange={(e) => handleInputChange("woreda", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kebele">Kebele</Label>
                      <Input
                        id="kebele"
                        placeholder="Enter Kebele"
                        value={formData.kebele}
                        onChange={(e) => handleInputChange("kebele", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="houseNumber">House Number</Label>
                      <Input
                        id="houseNumber"
                        placeholder="Enter HouseNo"
                        value={formData.houseNumber}
                        onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalAddress">Postal Address</Label>
                      <Input
                        id="postalAddress"
                        placeholder="Enter Postal Address"
                        value={formData.postalAddress}
                        onChange={(e) => handleInputChange("postalAddress", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button type="submit">Save and Continue</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
