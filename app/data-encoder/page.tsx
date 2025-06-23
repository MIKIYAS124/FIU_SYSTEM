"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"

export default function DataEncoderDashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalReports: 45,
    draftReports: 8,
    submittedReports: 32,
    approvedReports: 28,
    rejectedReports: 4,
    todayReports: 3,
  }

  const recentReports = [
    { id: "STR-202401-001", type: "STR", status: "SUBMITTED", date: "2024-01-15", amount: "50,000 ETB" },
    { id: "CTR-202401-002", type: "CTR", status: "APPROVED", date: "2024-01-14", amount: "75,000 ETB" },
    { id: "STR-202401-003", type: "STR", status: "DRAFT", date: "2024-01-13", amount: "25,000 ETB" },
    { id: "CTR-202401-004", type: "CTR", status: "REJECTED", date: "2024-01-12", amount: "100,000 ETB" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "SUBMITTED":
        return (
          <Badge variant="default" className="bg-blue-500">
            Submitted
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-500">
            Approved
          </Badge>
        )
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
          <p className="text-muted-foreground">Manage your STR and CTR reports</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/data-encoder/reports">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </Link>
          <Link href="/data-encoder/upload">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">All time reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Reports</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftReports}</div>
            <p className="text-xs text-muted-foreground">Pending completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedReports}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Reports</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayReports}</div>
            <p className="text-xs text-muted-foreground">Submitted today</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your latest report submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{report.id}</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.amount} • {report.date}
                    </p>
                  </div>
                </div>
                {getStatusBadge(report.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
