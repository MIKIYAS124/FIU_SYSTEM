"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StepIndicator } from "@/components/user-registration/step-indicator"
import { ArrowLeft, ArrowRight } from "lucide-react"

// Import step components
import { TransactionInformationStep } from "./steps/transaction-information"
import { AccountInformationStep } from "./steps/account-information"
import { BeneficiaryInformationStep } from "./steps/beneficiary-information"
import { AssociationStep } from "./steps/association"
import { PersonBeingReportedStep } from "./steps/person-being-reported"
import { EntityIndividualStep } from "./steps/entity-individual"
import { SuspiciousActivityStep } from "./steps/suspicious-activity"
import { AdditionalInformationStep } from "./steps/additional-information"
import { FileUploadStep } from "./steps/file-upload"
import { ReviewStep } from "./steps/review"

interface MultiStepFormProps {
  reportType: "STR" | "CTR"
}

export function MultiStepForm({ reportType }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})

  const totalSteps = 10

  const stepTitles = [
    "Transaction Information",
    "Account Information",
    "Beneficiary Information",
    "Association Information",
    "Person Being Reported",
    "Entity/Individual Details",
    "Suspicious Activity",
    "Additional Information",
    "File Upload",
    "Review & Submit",
  ]

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepData = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <TransactionInformationStep onDataChange={handleStepData} reportType={reportType} />
      case 2:
        return <AccountInformationStep onDataChange={handleStepData} />
      case 3:
        return <BeneficiaryInformationStep onDataChange={handleStepData} />
      case 4:
        return <AssociationStep onDataChange={handleStepData} />
      case 5:
        return <PersonBeingReportedStep onDataChange={handleStepData} />
      case 6:
        return <EntityIndividualStep onDataChange={handleStepData} />
      case 7:
        return <SuspiciousActivityStep onDataChange={handleStepData} />
      case 8:
        return <AdditionalInformationStep onDataChange={handleStepData} />
      case 9:
        return <FileUploadStep onDataChange={handleStepData} />
      case 10:
        return <ReviewStep formData={formData} reportType={reportType} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{reportType} Report</h2>
        <p className="text-muted-foreground">
          {reportType === "STR" ? "Suspicious Transaction Report" : "Currency Transaction Report"}
        </p>
      </div>

      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>{stepTitles[currentStep - 1]}</CardTitle>
        </CardHeader>
        <CardContent>
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

          <div className="mt-8">{renderStep()}</div>

          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={currentStep === totalSteps}
              className={currentStep === totalSteps ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {currentStep === totalSteps ? "Submit Report" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
