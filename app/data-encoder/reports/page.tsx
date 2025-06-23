"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MultiStepForm } from "@/components/transaction-reporting/multi-step-form"

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<"STR" | "CTR" | null>(null)

  if (activeReport) {
    return <MultiStepForm reportType={activeReport} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">STR & CTR Reports</h2>
        <p className="text-muted-foreground">Create and manage suspicious and currency transaction reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveReport("STR")}>
          <CardHeader>
            <CardTitle>STR Report</CardTitle>
            <CardDescription>Suspicious Transaction Report</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Report transactions that appear suspicious or unusual and may indicate money laundering or other financial
              crimes.
            </p>
            <Button className="w-full">Create STR Report</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveReport("CTR")}>
          <CardHeader>
            <CardTitle>CTR Report</CardTitle>
            <CardDescription>Currency Transaction Report</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Report currency transactions that exceed the threshold amount as required by regulatory authorities.
            </p>
            <Button className="w-full">Create CTR Report</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your recently submitted reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">STR-2024-001</div>
                <div className="text-sm text-muted-foreground">Submitted 2 hours ago</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Suspicious Transfer</div>
                <div className="text-sm text-muted-foreground">Under Review</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">CTR-2024-002</div>
                <div className="text-sm text-muted-foreground">Submitted 1 day ago</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Large Cash Deposit</div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
  