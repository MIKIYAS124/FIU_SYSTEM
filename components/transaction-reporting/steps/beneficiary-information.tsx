"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface BeneficiaryInformationStepProps {
  onDataChange: (data: any) => void
}

export function BeneficiaryInformationStep({ onDataChange }: BeneficiaryInformationStepProps) {
  const [formData, setFormData] = useState({
    hasBeneficiary: false,
    beneficiaryName: "",
    beneficiaryAccountNumber: "",
    beneficiaryBank: "",
    beneficiaryIdType: "",
    beneficiaryIdNumber: "",
    beneficiaryAddress: "",
    beneficiaryCountry: "",
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onDataChange(newData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Beneficiary Information</h3>
        <p className="text-sm text-muted-foreground mb-6">Provide details about the beneficiary if applicable</p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasBeneficiary"
          checked={formData.hasBeneficiary}
          onCheckedChange={(checked) => handleInputChange("hasBeneficiary", checked as boolean)}
        />
        <Label htmlFor="hasBeneficiary">This transaction has a beneficiary</Label>
      </div>

      {formData.hasBeneficiary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
            <Input
              id="beneficiaryName"
              placeholder="Enter beneficiary full name"
              value={formData.beneficiaryName}
              onChange={(e) => handleInputChange("beneficiaryName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiaryAccountNumber">Beneficiary Account Number</Label>
            <Input
              id="beneficiaryAccountNumber"
              placeholder="Enter account number"
              value={formData.beneficiaryAccountNumber}
              onChange={(e) => handleInputChange("beneficiaryAccountNumber", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiaryBank">Beneficiary Bank</Label>
            <Input
              id="beneficiaryBank"
              placeholder="Enter bank name"
              value={formData.beneficiaryBank}
              onChange={(e) => handleInputChange("beneficiaryBank", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiaryIdType">Beneficiary ID Type</Label>
            <Select
              value={formData.beneficiaryIdType}
              onValueChange={(value) => handleInputChange("beneficiaryIdType", value)}
            >
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
            <Label htmlFor="beneficiaryIdNumber">Beneficiary ID Number</Label>
            <Input
              id="beneficiaryIdNumber"
              placeholder="Enter ID number"
              value={formData.beneficiaryIdNumber}
              onChange={(e) => handleInputChange("beneficiaryIdNumber", e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="beneficiaryAddress">Beneficiary Address</Label>
            <Input
              id="beneficiaryAddress"
              placeholder="Enter beneficiary address"
              value={formData.beneficiaryAddress}
              onChange={(e) => handleInputChange("beneficiaryAddress", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiaryCountry">Beneficiary Country</Label>
            <Select
              value={formData.beneficiaryCountry}
              onValueChange={(value) => handleInputChange("beneficiaryCountry", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethiopia">Ethiopia</SelectItem>
                <SelectItem value="kenya">Kenya</SelectItem>
                <SelectItem value="uganda">Uganda</SelectItem>
                <SelectItem value="usa">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
