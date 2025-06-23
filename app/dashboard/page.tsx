"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Report {
  id: number
  transaction_date: string
  transaction_amount: number
  account_number: string
  account_holder_name: string
  suspicious_activity: string
  status: string
  created_at: string
  user_id: number
}

interface User {
  id: number
  username: string
  email: string
  role: string
}

interface Branch {
  id: number
  name: string
  code: string
  address: string
}

interface ReportingEntity {
  id: number
  name: string
  type: string
  license_number: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [reportingEntities, setReportingEntities] = useState<ReportingEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showBranchForm, setShowBranchForm] = useState(false)
  const [showEntityForm, setShowEntityForm] = useState(false)

  const [formData, setFormData] = useState({
    transaction_date: "",
    transaction_amount: "",
    account_number: "",
    account_holder_name: "",
    suspicious_activity: "",
    entity_id: "",
    branch_id: "",
    beneficiary_name: "",
    additional_info: ""
  })

  const [userFormData, setUserFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "DATA_ENCODER",
    full_name: ""
  })

  const [branchFormData, setBranchFormData] = useState({
    name: "",
    code: "",
    address: "",
    entity_id: "",
    manager_name: "",
    phone: "",
    email: ""
  })

  const [entityFormData, setEntityFormData] = useState({
    name: "",
    type: "BANK",
    license_number: "",
    contact_email: "",
    contact_phone: "",
    address: ""
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch reports
      const reportsResponse = await fetch("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData)
      }

      // Fetch users (for admins)
      const usersResponse = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Fetch branches (for intermediate admin)
      const branchesResponse = await fetch("http://localhost:5000/api/branches", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (branchesResponse.ok) {
        const branchesData = await branchesResponse.json()
        setBranches(branchesData)
      }

      // Fetch reporting entities (for super admin)
      const entitiesResponse = await fetch("http://localhost:5000/api/reporting-entities", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (entitiesResponse.ok) {
        const entitiesData = await entitiesResponse.json()
        setReportingEntities(entitiesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          transaction_amount: Number.parseFloat(formData.transaction_amount),
        }),
      })

      if (response.ok) {
        setSuccess("Report created successfully!")
        setShowCreateForm(false)
        setFormData({
          transaction_date: "",
          transaction_amount: "",
          account_number: "",
          account_holder_name: "",
          suspicious_activity: "",
          entity_id: "",
          branch_id: "",
          beneficiary_name: "",
          additional_info: ""
        })
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create report")
      }
    } catch (error) {
      console.error("Error creating report:", error)
      setError("An error occurred while creating the report")
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userFormData),
      })

      if (response.ok) {
        setSuccess("User created successfully!")
        setShowUserForm(false)
        setUserFormData({ username: "", email: "", password: "", role: "DATA_ENCODER", full_name: "" })
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create user")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      setError("An error occurred while creating the user")
    }
  }

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(branchFormData),
      })

      if (response.ok) {
        setSuccess("Branch created successfully!")
        setShowBranchForm(false)
        setBranchFormData({ name: "", code: "", address: "", entity_id: "", manager_name: "", phone: "", email: "" })
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create branch")
      }
    } catch (error) {
      console.error("Error creating branch:", error)
      setError("An error occurred while creating the branch")
    }
  }

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/reporting-entities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(entityFormData),
      })

      if (response.ok) {
        setSuccess("Reporting entity created successfully!")
        setShowEntityForm(false)
        setEntityFormData({ name: "", type: "BANK", license_number: "", contact_email: "", contact_phone: "", address: "" })
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create reporting entity")
      }
    } catch (error) {
      console.error("Error creating reporting entity:", error)
      setError("An error occurred while creating the reporting entity")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const canManageUsers = user?.role === "SUPER_ADMIN" || user?.role === "INTERMEDIATE_ADMIN"
  const canManageBranches = user?.role === "INTERMEDIATE_ADMIN"
  const canManageEntities = user?.role === "SUPER_ADMIN"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">FIU Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username} ({user?.role})
              </span>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reports">Reports</TabsTrigger>
              {canManageUsers && <TabsTrigger value="users">Users</TabsTrigger>}
              {canManageBranches && <TabsTrigger value="branches">Branches</TabsTrigger>}
              {canManageEntities && <TabsTrigger value="entities">Entities</TabsTrigger>}
            </TabsList>

            <TabsContent value="reports" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Suspicious Transaction Reports</h2>
                <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                  {showCreateForm ? "Cancel" : "Create New Report"}
                </Button>
              </div>

              {showCreateForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Create New Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
                    {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}
                    <form onSubmit={handleCreateReport} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="transaction_date">Transaction Date</Label>
                          <Input
                            id="transaction_date"
                            type="date"
                            value={formData.transaction_date}
                            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="transaction_amount">Transaction Amount</Label>
                          <Input
                            id="transaction_amount"
                            type="number"
                            step="0.01"
                            value={formData.transaction_amount}
                            onChange={(e) => setFormData({ ...formData, transaction_amount: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="account_number">Account Number</Label>
                          <Input
                            id="account_number"
                            value={formData.account_number}
                            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="account_holder_name">Account Holder Name</Label>
                          <Input
                            id="account_holder_name"
                            value={formData.account_holder_name}
                            onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="entity_id">Reporting Entity</Label>
                          <Select
                            value={formData.entity_id}
                            onValueChange={(value) => setFormData({ ...formData, entity_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select entity" />
                            </SelectTrigger>
                            <SelectContent>
                              {reportingEntities.map((entity) => (
                                <SelectItem key={entity.id} value={entity.id.toString()}>
                                  {entity.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="branch_id">Branch</Label>
                          <Select
                            value={formData.branch_id}
                            onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="beneficiary_name">Beneficiary Name</Label>
                        <Input
                          id="beneficiary_name"
                          value={formData.beneficiary_name}
                          onChange={(e) => setFormData({ ...formData, beneficiary_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="suspicious_activity">Suspicious Activity Description</Label>
                        <Textarea
                          id="suspicious_activity"
                          value={formData.suspicious_activity}
                          onChange={(e) => setFormData({ ...formData, suspicious_activity: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="additional_info">Additional Information</Label>
                        <Textarea
                          id="additional_info"
                          value={formData.additional_info}
                          onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <Button type="submit">Create Report</Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>{loading ? "Loading..." : `${reports.length} report(s) found`}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-gray-500">Loading reports...</p>
                  ) : reports.length === 0 ? (
                    <p className="text-gray-500">No reports found. Create your first report above.</p>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div key={report.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">Report #{report.id}</h3>
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">{report.status}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Date:</strong> {new Date(report.transaction_date).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Amount:</strong> ${report.transaction_amount.toLocaleString()}
                            </div>
                            <div>
                              <strong>Account:</strong> {report.account_number}
                            </div>
                            <div>
                              <strong>Holder:</strong> {report.account_holder_name}
                            </div>
                          </div>
                          <div className="mt-2">
                            <strong>Suspicious Activity:</strong>
                            <p className="text-sm text-gray-600 mt-1">{report.suspicious_activity}</p>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Created: {new Date(report.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {canManageUsers && (
              <TabsContent value="users" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <Button onClick={() => setShowUserForm(!showUserForm)}>
                    {showUserForm ? "Cancel" : "Create New User"}
                  </Button>
                </div>

                {showUserForm && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Create New User</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
                      {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}
                      <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={userFormData.username}
                              onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={userFormData.email}
                              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={userFormData.password}
                              onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Select
                              value={userFormData.role}
                              onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DATA_ENCODER">Data Encoder</SelectItem>
                                {user?.role === "SUPER_ADMIN" && (
                                  <SelectItem value="INTERMEDIATE_ADMIN">Intermediate Admin</SelectItem>
                                )}
                                {user?.role === "SUPER_ADMIN" && (
                                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={userFormData.full_name}
                            onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit">Create User</Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>{loading ? "Loading..." : `${users.length} user(s) found`}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-gray-500">Loading users...</p>
                    ) : (
                      <div className="space-y-4">
                        {users.map((u) => (
                          <div key={u.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold">{u.username}</h3>
                                <p className="text-sm text-gray-600">{u.email}</p>
                              </div>
                              <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">{u.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {canManageBranches && (
              <TabsContent value="branches" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Branch Management</h2>
                  <Button onClick={() => setShowBranchForm(!showBranchForm)}>
                    {showBranchForm ? "Cancel" : "Create New Branch"}
                  </Button>
                </div>

                {showBranchForm && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Create New Branch</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
                      {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}
                      <form onSubmit={handleCreateBranch} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Branch Name</Label>
                            <Input
                              id="name"
                              value={branchFormData.name}
                              onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="code">Branch Code</Label>
                            <Input
                              id="code"
                              value={branchFormData.code}
                              onChange={(e) => setBranchFormData({ ...branchFormData, code: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={branchFormData.address}
                            onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="entity_id">Reporting Entity</Label>
                          <Select
                            value={branchFormData.entity_id}
                            onValueChange={(value) => setBranchFormData({ ...branchFormData, entity_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select entity" />
                            </SelectTrigger>
                            <SelectContent>
                              {reportingEntities.map((entity) => (
                                <SelectItem key={entity.id} value={entity.id.toString()}>
                                  {entity.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="manager_name">Manager Name</Label>
                            <Input
                              id="manager_name"
                              value={branchFormData.manager_name}
                              onChange={(e) => setBranchFormData({ ...branchFormData, manager_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={branchFormData.phone}
                              onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={branchFormData.email}
                            onChange={(e) => setBranchFormData({ ...branchFormData, email: e.target.value })}
                          />
                        </div>
                        <Button type="submit">Create Branch</Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Branches</CardTitle>
                    <CardDescription>{loading ? "Loading..." : `${branches.length} branch(es) found`}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-gray-500">Loading branches...</p>
                    ) : (
                      <div className="space-y-4">
                        {branches.map((branch) => (
                          <div key={branch.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{branch.name}</h3>
                                <p className="text-sm text-gray-600">Code: {branch.code}</p>
                                <p className="text-sm text-gray-600">{branch.address}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {canManageEntities && (
              <TabsContent value="entities" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Reporting Entities</h2>
                  <Button onClick={() => setShowEntityForm(!showEntityForm)}>
                    {showEntityForm ? "Cancel" : "Create New Entity"}
                  </Button>
                </div>

                {showEntityForm && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Create New Reporting Entity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
                      {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}
                      <form onSubmit={handleCreateEntity} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Entity Name</Label>
                            <Input
                              id="name"
                              value={entityFormData.name}
                              onChange={(e) => setEntityFormData({ ...entityFormData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="type">Type</Label>
                            <Select
                              value={entityFormData.type}
                              onValueChange={(value) => setEntityFormData({ ...entityFormData, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BANK">Bank</SelectItem>
                                <SelectItem value="INSURANCE">Insurance</SelectItem>
                                <SelectItem value="MICROFINANCE">Microfinance</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="license_number">License Number</Label>
                            <Input
                              id="license_number"
                              value={entityFormData.license_number}
                              onChange={(e) => setEntityFormData({ ...entityFormData, license_number: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="contact_email">Contact Email</Label>
                            <Input
                              id="contact_email"
                              type="email"
                              value={entityFormData.contact_email}
                              onChange={(e) => setEntityFormData({ ...entityFormData, contact_email: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="contact_phone">Contact Phone</Label>
                            <Input
                              id="contact_phone"
                              value={entityFormData.contact_phone}
                              onChange={(e) => setEntityFormData({ ...entityFormData, contact_phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={entityFormData.address}
                              onChange={(e) => setEntityFormData({ ...entityFormData, address: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button type="submit">Create Entity</Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Reporting Entities</CardTitle>
                    <CardDescription>{loading ? "Loading..." : `${reportingEntities.length} entit(ies) found`}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-gray-500">Loading reporting entities...</p>
                    ) : (
                      <div className="space-y-4">
                        {reportingEntities.map((entity) => (
                          <div key={entity.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{entity.name}</h3>
                                <p className="text-sm text-gray-600">Type: {entity.type}</p>
                                <p className="text-sm text-gray-600">License: {entity.license_number}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
