"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface EntityIndividualStepProps {
  onDataChange: (data: any) => void
}

export function EntityIndividualStep({ onDataChange }: EntityIndividualStepProps) {
  const [formData, setFormData] = useState({
    reportingFor: "individual", // individual or entity
    entityName: "",
    entityType: "",
    registrationNumber: "",
    taxId: "",
    businessAddress: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    businessDescription: "",
    individualName: "",
    individualRole: "",
    individualPhone: "",
    individualEmail: "",
  })

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onDataChange(newData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Entity/Individual Details</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Specify whether you're reporting for an entity or individual
        </p>
      </div>

      <div className="space-y-4">
        <Label>Reporting For</Label>
        <RadioGroup value={formData.reportingFor} onValueChange={(value) => handleInputChange("reportingFor", value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual">Individual</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="entity" id="entity" />
            <Label htmlFor="entity">Legal Entity</Label>
          </div>
        </RadioGroup>
      </div>

      {formData.reportingFor === "entity" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="entityName">Entity Name</Label>
            <Input
              id="entityName"
              placeholder="Enter entity name"
              value={formData.entityName}
              onChange={(e) => handleInputChange("entityName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityType">Entity Type</Label>
            <Select value={formData.entityType} onValueChange={(value) => handleInputChange("entityType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corporation">Corporation</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="llc">Limited Liability Company</SelectItem>
                <SelectItem value="ngo">Non-Governmental Organization</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              placeholder="Enter registration number"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID</Label>
            <Input
              id="taxId"
              placeholder="Enter tax identification number"
              value={formData.taxId}
              onChange={(e) => handleInputChange("taxId", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              placeholder="Enter contact person name"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange("contactPerson", e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Input
              id="businessAddress"
              placeholder="Enter business address"
              value={formData.businessAddress}
              onChange={(e) => handleInputChange("businessAddress", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              placeholder="Enter contact phone"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange("contactPhone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="Enter contact email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange("contactEmail", e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea
              id="businessDescription"
              placeholder="Describe the nature of business"
              value={formData.businessDescription}
              onChange={(e) => handleInputChange("businessDescription", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="individualName">Individual Name</Label>
            <Input
              id="individualName"
              placeholder="Enter individual full name"
              value={formData.individualName}
              onChange={(e) => handleInputChange("individualName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="individualRole">Role/Position</Label>
            <Input
              id="individualRole"
              placeholder="Enter role or position"
              value={formData.individualRole}
              onChange={(e) => handleInputChange("individualRole", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="individualPhone">Phone Number</Label>
            <Input
              id="individualPhone"
              placeholder="Enter phone number"
              value={formData.individualPhone}
              onChange={(e) => handleInputChange("individualPhone", e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="individualEmail">Email Address</Label>
            <Input
              id="individualEmail"
              type="email"
              placeholder="Enter email address"
              value={formData.individualEmail}
              onChange={(e) => handleInputChange("individualEmail", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
