"use client"

import { useState, useEffect } from "react"
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
    entityId: "",
    branchId: "",
    transactionDate: "",
    transactionAmount: "",
    transactionCurrency: "ETB",
    transactionManner: "",
    transactionLocation: "",
    description: "",
  })

  const [entities, setEntities] = useState<{ id: number; name: string }[]>([])
  const [branches, setBranches] = useState<{ id: number; name: string; entity_id: number }[]>([])
  const [transactionManners, setTransactionManners] = useState<{ id: number; type: string }[]>([])

  useEffect(() => {
    async function fetchEntities() {
      try {
        const response = await fetch("/api/reporting-entities")
        const data = await response.json()
        setEntities(data)
      } catch (error) {
        console.error("Failed to fetch reporting entities", error)
      }
    }
    async function fetchBranches() {
      try {
        const response = await fetch("/api/branches")
        const data = await response.json()
        setBranches(data)
      } catch (error) {
        console.error("Failed to fetch branches", error)
      }
    }
    async function fetchTransactionManners() {
      try {
        const response = await fetch("/api/transaction-manners")
        const data = await response.json()
        setTransactionManners(data.data || [])
      } catch (error) {
        console.error("Failed to fetch transaction manners", error)
      }
    }
    fetchEntities()
    fetchBranches()
    fetchTransactionManners()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    // Reset branchId if entityId changes
    if (field === "entityId") {
      newData.branchId = ""
    }
    setFormData(newData)
    onDataChange(newData)
  }

  // Filter branches by selected entity
  const filteredBranches = formData.entityId
    ? branches.filter((b) => b.entity_id === Number(formData.entityId))
    : []

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
          <Label htmlFor="entityId">Reporting Entity</Label>
          <Select
            value={formData.entityId}
            onValueChange={(value) => handleInputChange("entityId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select reporting entity" />
            </SelectTrigger>
            <SelectContent>
              {entities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id.toString()}>
                  {entity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="branchId">Branch</Label>
          <Select
            value={formData.branchId}
            onValueChange={(value) => handleInputChange("branchId", value)}
            disabled={!formData.entityId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {filteredBranches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              {transactionManners.map((manner) => (
                <SelectItem key={manner.id} value={manner.id.toString()}>
                  {manner.type}
                </SelectItem>
              ))}
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
