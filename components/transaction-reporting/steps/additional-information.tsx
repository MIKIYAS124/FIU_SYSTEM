"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface AdditionalInformationProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

export function AdditionalInformation({ data, onUpdate, onNext, onPrevious }: AdditionalInformationProps) {
  const [formData, setFormData] = useState({
    additionalDetails: data.additionalDetails || "",
    lawEnforcementContacted: data.lawEnforcementContacted || false,
    lawEnforcementAgency: data.lawEnforcementAgency || "",
    lawEnforcementContactDate: data.lawEnforcementContactDate || "",
    lawEnforcementOfficer: data.lawEnforcementOfficer || "",
    priorSARs: data.priorSARs || false,
    priorSARsDetails: data.priorSARsDetails || "",
    correctionToPriorSAR: data.correctionToPriorSAR || false,
    correctionDetails: data.correctionDetails || "",
    institutionNotes: data.institutionNotes || "",
    supervisoryContactName: data.supervisoryContactName || "",
    supervisoryContactTitle: data.supervisoryContactTitle || "",
    supervisoryContactPhone: data.supervisoryContactPhone || "",
    supervisoryContactDate: data.supervisoryContactDate || "",
  })

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    onUpdate(updatedData)
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="additionalDetails">Additional Details</Label>
            <Textarea
              id="additionalDetails"
              placeholder="Provide any additional information that may be relevant to this report..."
              value={formData.additionalDetails}
              onChange={(e) => handleInputChange("additionalDetails", e.target.value)}
              rows={4}
            />
          </div>

          {/* Law Enforcement Contact */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lawEnforcementContacted"
                checked={formData.lawEnforcementContacted}
                onCheckedChange={(checked) => handleInputChange("lawEnforcementContacted", checked)}
              />
              <Label htmlFor="lawEnforcementContacted">
                Law enforcement has been contacted regarding this suspicious activity
              </Label>
            </div>

            {formData.lawEnforcementContacted && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="lawEnforcementAgency">Agency Name</Label>
                  <Input
                    id="lawEnforcementAgency"
                    value={formData.lawEnforcementAgency}
                    onChange={(e) => handleInputChange("lawEnforcementAgency", e.target.value)}
                    placeholder="Enter agency name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lawEnforcementContactDate">Contact Date</Label>
                  <Input
                    id="lawEnforcementContactDate"
                    type="date"
                    value={formData.lawEnforcementContactDate}
                    onChange={(e) => handleInputChange("lawEnforcementContactDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lawEnforcementOfficer">Contact Officer</Label>
                  <Input
                    id="lawEnforcementOfficer"
                    value={formData.lawEnforcementOfficer}
                    onChange={(e) => handleInputChange("lawEnforcementOfficer", e.target.value)}
                    placeholder="Officer name and badge number"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Prior SARs */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="priorSARs"
                checked={formData.priorSARs}
                onCheckedChange={(checked) => handleInputChange("priorSARs", checked)}
              />
              <Label htmlFor="priorSARs">Prior SARs have been filed on this subject or activity</Label>
            </div>

            {formData.priorSARs && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="priorSARsDetails">Prior SAR Details</Label>
                <Textarea
                  id="priorSARsDetails"
                  value={formData.priorSARsDetails}
                  onChange={(e) => handleInputChange("priorSARsDetails", e.target.value)}
                  placeholder="Provide details about prior SARs including dates and reference numbers"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Correction to Prior SAR */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="correctionToPriorSAR"
                checked={formData.correctionToPriorSAR}
                onCheckedChange={(checked) => handleInputChange("correctionToPriorSAR", checked)}
              />
              <Label htmlFor="correctionToPriorSAR">This SAR is a correction to a previously filed SAR</Label>
            </div>

            {formData.correctionToPriorSAR && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="correctionDetails">Correction Details</Label>
                <Textarea
                  id="correctionDetails"
                  value={formData.correctionDetails}
                  onChange={(e) => handleInputChange("correctionDetails", e.target.value)}
                  placeholder="Describe what is being corrected and provide the original SAR reference"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Institution Notes */}
          <div className="space-y-2">
            <Label htmlFor="institutionNotes">Institution Notes</Label>
            <Textarea
              id="institutionNotes"
              value={formData.institutionNotes}
              onChange={(e) => handleInputChange("institutionNotes", e.target.value)}
              placeholder="Internal notes for institutional use (not included in regulatory filing)"
              rows={3}
            />
          </div>

          {/* Supervisory Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supervisory Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisoryContactName">Contact Name</Label>
                  <Input
                    id="supervisoryContactName"
                    value={formData.supervisoryContactName}
                    onChange={(e) => handleInputChange("supervisoryContactName", e.target.value)}
                    placeholder="Supervisor name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisoryContactTitle">Title</Label>
                  <Input
                    id="supervisoryContactTitle"
                    value={formData.supervisoryContactTitle}
                    onChange={(e) => handleInputChange("supervisoryContactTitle", e.target.value)}
                    placeholder="Supervisor title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisoryContactPhone">Phone Number</Label>
                  <Input
                    id="supervisoryContactPhone"
                    value={formData.supervisoryContactPhone}
                    onChange={(e) => handleInputChange("supervisoryContactPhone", e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisoryContactDate">Contact Date</Label>
                  <Input
                    id="supervisoryContactDate"
                    type="date"
                    value={formData.supervisoryContactDate}
                    onChange={(e) => handleInputChange("supervisoryContactDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>Next: File Upload</Button>
      </div>
    </div>
  )
}
