"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TransactionInformationStepProps {
  onDataChange: (data: any) => void
  reportType: "STR" | "CTR"
}

export function TransactionInformationStep({ onDataChange, reportType }: TransactionInformationStepProps) {
  const [formData, setFormData] = useState({
    transactionDate: "",
    transactionAmount: "",
    transactionCurrency: "ETB",
    transactionManner: "",
    transactionLocation: "",
    description: "",
  })

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onDataChange(newData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Transaction Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Provide details about the {reportType === "STR" ? "suspicious" : "currency"} transaction
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transactionDate">Transaction Date</Label>
          <Input
            id="transactionDate"
            type="date"
            value={formData.transactionDate}
            onChange={(e) => handleInputChange("transactionDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionAmount">Transaction Amount</Label>
          <Input
            id="transactionAmount"
            type="number"
            placeholder="Enter amount"
            value={formData.transactionAmount}
            onChange={(e) => handleInputChange("transactionAmount", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionCurrency">Currency</Label>
          <Select
            value={formData.transactionCurrency}
            onValueChange={(value) => handleInputChange("transactionCurrency", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ETB">Ethiopian Birr (ETB)</SelectItem>
              <SelectItem value="USD">US Dollar (USD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionManner">Transaction Manner</Label>
          <Select
            value={formData.transactionManner}
            onValueChange={(value) => handleInputChange("transactionManner", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transaction manner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
              <SelectItem value="account_transfer">Account Transfer</SelectItem>
              <SelectItem value="telegram_transfer">Telegram Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="transactionLocation">Transaction Location</Label>
          <Input
            id="transactionLocation"
            placeholder="Enter transaction location"
            value={formData.transactionLocation}
            onChange={(e) => handleInputChange("transactionLocation", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Provide additional details about the transaction"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
