"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AccountInformationStepProps {
  onDataChange: (data: any) => void
}

export function AccountInformationStep({ onDataChange }: AccountInformationStepProps) {
  const [formData, setFormData] = useState({
    accountNumber: "",
    accountType: "",
    accountHolderName: "",
    accountHolderIdType: "",
    accountHolderIdNumber: "",
    accountOpenDate: "",
    branchName: "",
  })

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onDataChange(newData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Provide details about the account involved in the transaction
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            placeholder="Enter account number"
            value={formData.accountNumber}
            onChange={(e) => handleInputChange("accountNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountType">Account Type</Label>
          <Select value={formData.accountType} onValueChange={(value) => handleInputChange("accountType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="savings">Savings Account</SelectItem>
              <SelectItem value="current">Current Account</SelectItem>
              <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
              <SelectItem value="loan">Loan Account</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="accountHolderName">Account Holder Name</Label>
          <Input
            id="accountHolderName"
            placeholder="Enter account holder full name"
            value={formData.accountHolderName}
            onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountHolderIdType">ID Type</Label>
          <Select
            value={formData.accountHolderIdType}
            onValueChange={(value) => handleInputChange("accountHolderIdType", value)}
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
          <Label htmlFor="accountHolderIdNumber">ID Number</Label>
          <Input
            id="accountHolderIdNumber"
            placeholder="Enter ID number"
            value={formData.accountHolderIdNumber}
            onChange={(e) => handleInputChange("accountHolderIdNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountOpenDate">Account Open Date</Label>
          <Input
            id="accountOpenDate"
            type="date"
            value={formData.accountOpenDate}
            onChange={(e) => handleInputChange("accountOpenDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branchName">Branch Name</Label>
          <Input
            id="branchName"
            placeholder="Enter branch name"
            value={formData.branchName}
            onChange={(e) => handleInputChange("branchName", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
