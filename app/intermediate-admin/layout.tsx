import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function IntermediateAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole="intermediate_admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Intermediate Admin Dashboard" userName="Admin User" userRole="Intermediate Admin" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">{children}</main>
      </div>
    </div>
  )
}
