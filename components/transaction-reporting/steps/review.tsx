"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, FileText, User, Building, CreditCard } from "lucide-react"

interface ReviewProps {
  data: any
  onUpdate: (data: any) => void
  onSubmit: () => void
  onPrevious: () => void
  onSaveDraft: () => void
}

export function Review({ data, onUpdate, onSubmit, onPrevious, onSaveDraft }: ReviewProps) {
  const [certificationChecked, setCertificationChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "ETB",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString()
  }

  const handleSubmit = async () => {
    if (!certificationChecked) {
      alert("Please certify the accuracy of the information before submitting.")
      return
    }

    setSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setSubmitting(false)
    }
  }

  const getCompletionStatus = () => {
    const requiredSections = [
      { name: "Transaction Information", completed: data.transactionDate && data.transactionAmount },
      { name: "Account Information", completed: data.accountNumber && data.accountHolderName },
      { name: "Person Being Reported", completed: data.personReportedName },
      { name: "Suspicious Activity", completed: data.suspiciousActivityDescription },
    ]

    const completedCount = requiredSections.filter((section) => section.completed).length
    const totalCount = requiredSections.length

    return { completedCount, totalCount, sections: requiredSections }
  }

  const { completedCount, totalCount, sections } = getCompletionStatus()
  const isComplete = completedCount === totalCount

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            <span>Report Completion Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Progress</span>
              <Badge variant={isComplete ? "default" : "secondary"}>
                {completedCount}/{totalCount} sections completed
              </Badge>
            </div>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {section.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className={section.completed ? "text-green-700" : "text-yellow-700"}>{section.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Transaction Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Transaction Date</Label>
              <p className="font-medium">{formatDate(data.transactionDate)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Amount</Label>
              <p className="font-medium">
                {data.transactionAmount
                  ? formatCurrency(data.transactionAmount, data.transactionCurrency)
                  : "Not specified"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Transaction Type</Label>
              <p className="font-medium">{data.transactionManner || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Crime Type</Label>
              <p className="font-medium">{data.crimeType || "Not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Account Number</Label>
              <p className="font-medium">{data.accountNumber || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Account Holder</Label>
              <p className="font-medium">{data.accountHolderName || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">ID Type</Label>
              <p className="font-medium">{data.accountHolderIdType || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">ID Number</Label>
              <p className="font-medium">{data.accountHolderIdNumber || "Not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Person Being Reported */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Person Being Reported</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Name</Label>
              <p className="font-medium">{data.personReportedName || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">ID Type</Label>
              <p className="font-medium">{data.personReportedIdType || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">ID Number</Label>
              <p className="font-medium">{data.personReportedIdNumber || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Phone</Label>
              <p className="font-medium">{data.personReportedPhone || "Not specified"}</p>
            </div>
          </div>
          {data.personReportedAddress && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Address</Label>
              <p className="font-medium">{data.personReportedAddress}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspicious Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Activity Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{data.suspiciousActivityDescription || "No description provided"}</p>
        </CardContent>
      </Card>

      {/* Beneficiary Information */}
      {(data.beneficiaryName || data.beneficiaryAccount) && (
        <Card>
          <CardHeader>
            <CardTitle>Beneficiary Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Beneficiary Name</Label>
                <p className="font-medium">{data.beneficiaryName || "Not specified"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Beneficiary Account</Label>
                <p className="font-medium">{data.beneficiaryAccount || "Not specified"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Beneficiary Bank</Label>
                <p className="font-medium">{data.beneficiaryBank || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      {data.attachments && data.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Attached Documents ({data.attachments.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.attachments.map((file: any, index: number) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <Badge variant="outline">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {data.additionalDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{data.additionalDetails}</p>
          </CardContent>
        </Card>
      )}

      {/* Certification */}
      <Card>
        <CardHeader>
          <CardTitle>Certification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              By submitting this report, you certify that the information provided is true, complete, and accurate to
              the best of your knowledge. False statements may be subject to criminal penalties.
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2">
            <Checkbox id="certification" checked={certificationChecked} onCheckedChange={setCertificationChecked} />
            <Label htmlFor="certification" className="text-sm">
              I certify that the information in this report is true, complete, and accurate to the best of my knowledge
              and belief.
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onSaveDraft}>
            Save as Draft
          </Button>
          <Button onClick={handleSubmit} disabled={!isComplete || !certificationChecked || submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </div>
    </div>
  )
}
