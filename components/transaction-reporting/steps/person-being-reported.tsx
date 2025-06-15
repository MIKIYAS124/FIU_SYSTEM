"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface PersonBeingReportedStepProps {
  onDataChange: (data: any) => void
}

export function PersonBeingReportedStep({ onDataChange }: PersonBeingReportedStepProps) {
  const [formData, setFormData] = useState({
    personType: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    idType: "",
    idNumber: "",
    occupation: "",
    address: "",
    phoneNumber: "",
    email: "",
    suspiciousReason: "",
  })

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onDataChange(newData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Person Being Reported</h3>
        <p className="text-sm text-muted-foreground mb-6">Provide details about the person or entity being reported</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="personType">Person Type</Label>
          <Select value={formData.personType} onValueChange={(value) => handleInputChange("personType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select person type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="entity">Legal Entity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            placeholder="Enter middle name"
            value={formData.middleName}
            onChange={(e) => handleInputChange("middleName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Select value={formData.nationality} onValueChange={(value) => handleInputChange("nationality", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethiopian">Ethiopian</SelectItem>
              <SelectItem value="kenyan">Kenyan</SelectItem>
              <SelectItem value="ugandan">Ugandan</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idType">ID Type</Label>
          <Select value={formData.idType} onValueChange={(value) => handleInputChange("idType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select ID type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="national_id">National ID</SelectItem>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="driving_license">Driving License</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">ID Number</Label>
          <Input
            id="idNumber"
            placeholder="Enter ID number"
            value={formData.idNumber}
            onChange={(e) => handleInputChange("idNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            placeholder="Enter occupation"
            value={formData.occupation}
            onChange={(e) => handleInputChange("occupation", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="Enter phone number"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Enter full address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="suspiciousReason">Reason for Suspicion</Label>
          <Textarea
            id="suspiciousReason"
            placeholder="Explain why this person/entity is being reported"
            value={formData.suspiciousReason}
            onChange={(e) => handleInputChange("suspiciousReason", e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
