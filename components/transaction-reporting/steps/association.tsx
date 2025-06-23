"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AssociationStepProps {
  onDataChange: (data: any) => void
}

export function AssociationStep({ onDataChange }: AssociationStepProps) {
  const [formData, setFormData] = useState({
    associationType: "",
    associationName: "",
    associationRegistrationNumber: "",
    associationAddress: "",
    associationContactPerson: "",
    associationContactPhone: "",
    associationDescription: "",
  })

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onDataChange(newData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Association Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Provide details about any associated organizations or entities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="associationType">Association Type</Label>
          <Select
            value={formData.associationType}
            onValueChange={(value) => handleInputChange("associationType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select association type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">Business Entity</SelectItem>
              <SelectItem value="ngo">NGO</SelectItem>
              <SelectItem value="government">Government Agency</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="associationName">Association Name</Label>
          <Input
            id="associationName"
            placeholder="Enter association name"
            value={formData.associationName}
            onChange={(e) => handleInputChange("associationName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="associationRegistrationNumber">Registration Number</Label>
          <Input
            id="associationRegistrationNumber"
            placeholder="Enter registration number"
            value={formData.associationRegistrationNumber}
            onChange={(e) => handleInputChange("associationRegistrationNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="associationContactPerson">Contact Person</Label>
          <Input
            id="associationContactPerson"
            placeholder="Enter contact person name"
            value={formData.associationContactPerson}
            onChange={(e) => handleInputChange("associationContactPerson", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="associationAddress">Address</Label>
          <Input
            id="associationAddress"
            placeholder="Enter association address"
            value={formData.associationAddress}
            onChange={(e) => handleInputChange("associationAddress", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="associationContactPhone">Contact Phone</Label>
          <Input
            id="associationContactPhone"
            placeholder="Enter contact phone number"
            value={formData.associationContactPhone}
            onChange={(e) => handleInputChange("associationContactPhone", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="associationDescription">Description</Label>
          <Textarea
            id="associationDescription"
            placeholder="Provide additional details about the association"
            value={formData.associationDescription}
            onChange={(e) => handleInputChange("associationDescription", e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
