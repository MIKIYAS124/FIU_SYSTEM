"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, FileText, MapPin, Clock } from "lucide-react"

export default function IntermediateAdminDashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalBranches: 12,
    totalEncoders: 45,
    totalReports: 234,
    pendingReports: 8,
    thisMonthReports: 67,
    avgProcessingTime: "2.3 days",
  }

  const branchPerformance = [
    { name: "Main Branch", reports: 45, encoders: 8, status: "Active" },
    { name: "Downtown Branch", reports: 32, encoders: 6, status: "Active" },
    { name: "Airport Branch", reports: 28, encoders: 5, status: "Active" },
    { name: "Mall Branch", reports: 19, encoders: 4, status: "Active" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Entity Dashboard</h2>
        <p className="text-muted-foreground">Monitor your entity's branches and reporting activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBranches}</div>
            <p className="text-xs text-muted-foreground">Active branches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Encoders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEncoders}</div>
            <p className="text-xs text-muted-foreground">Active encoders</p>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProcessingTime}</div>
            <p className="text-xs text-muted-foreground">Processing time</p>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Performance</CardTitle>
          <CardDescription>Overview of branch activities and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {branchPerformance.map((branch, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Building2 className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{branch.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {branch.encoders} encoders • {branch.reports} reports
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500">
                  {branch.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
