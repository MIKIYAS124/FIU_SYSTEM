"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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

  const [crimeTypes, setCrimeTypes] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    async function fetchCrimeTypes() {
      try {
        const response = await fetch("/api/crime-types")
        const data = await response.json()
        setCrimeTypes(data.data || [])
      } catch (error) {
        console.error("Failed to fetch crime types", error)
      }
    }

    fetchCrimeTypes()
  }, [])

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
          <Select
            value={formData.crimeType}
            onValueChange={(value) => handleInputChange("crimeType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select crime type" />
            </SelectTrigger>
            <SelectContent>
              {crimeTypes.map((crime) => (
                <SelectItem key={crime.id} value={crime.id.toString()}>
                  {crime.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Suspicious Indicators</Label>
          <div className="space-y-2">
            {suspiciousIndicatorOptions.map((indicator) => (
              <div key={indicator} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={indicator}
                  checked={formData.suspiciousIndicators.includes(indicator)}
                  onChange={(e) => handleIndicatorChange(indicator, e.target.checked)}
                  className="form-checkbox"
                />
                <Label htmlFor={indicator}>{indicator}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activityDescription">Activity Description</Label>
          <Textarea
            id="activityDescription"
            placeholder="Describe the suspicious activity"
            value={formData.activityDescription}
            onChange={(e) => handleInputChange("activityDescription", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalConcerns">Additional Concerns</Label>
          <Textarea
            id="additionalConcerns"
            placeholder="Provide any additional concerns or observations"
            value={formData.additionalConcerns}
            onChange={(e) => handleInputChange("additionalConcerns", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="riskLevel">Risk Level</Label>
          <Select
            value={formData.riskLevel}
            onValueChange={(value) => handleInputChange("riskLevel", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
