"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

interface SuspiciousActivityStepProps {
  onDataChange: (data: any) => void
}

export function SuspiciousActivityStep({ onDataChange }: SuspiciousActivityStepProps) {
  const [formData, setFormData] = useState({
    crimeType: "",
    suspiciousIndicators: [] as string[],
    activityDescription: "",
    additionalConcerns: "",
    riskLevel: "",
  })

  const suspiciousIndicatorOptions = [
    "Large cash transactions",
    "Unusual transaction patterns",
    "Transactions with high-risk countries",
    "Structuring transactions to avoid reporting",
    "Transactions inconsistent with customer profile",
    "Use of multiple accounts",
    "Rapid movement of funds",
    "Transactions with no apparent business purpose",
  ]

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onDataChange(newData)
  }

  const handleIndicatorChange = (indicator: string, checked: boolean) => {
    const newIndicators = checked
      ? [...formData.suspiciousIndicators, indicator]
      : formData.suspiciousIndicators.filter(i => i !== indicator)
    
    const newData = { ...formData, suspiciousIndicators: newIndicators }
    setFormData(newData)
    onDataChange(newData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Suspicious Activity Details</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Provide details about the suspicious activity and indicators
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="crimeType">Crime Type</Label>
          <Select value={formData.crimeType} onValueChange={(value) =>\
