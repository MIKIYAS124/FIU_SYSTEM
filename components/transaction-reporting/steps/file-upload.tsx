"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, ImageIcon, File } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

export function FileUpload({ data, onUpdate, onNext, onPrevious }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(data.attachments || [])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const maxFileSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (fileList: File[]) => {
    const validFiles: UploadedFile[] = []
    const errors: string[] = []

    for (const file of fileList) {
      // Validate file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File size exceeds 10MB limit`)
        continue
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not allowed`)
        continue
      }

      // Check for duplicates
      if (files.some((f) => f.name === file.name && f.size === file.size)) {
        errors.push(`${file.name}: File already uploaded`)
        continue
      }

      validFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      })
    }

    if (errors.length > 0) {
      alert(errors.join("\n"))
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles]
      setFiles(updatedFiles)
      onUpdate({ ...data, attachments: updatedFiles })
    }
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter((f) => f.id !== fileId)
    setFiles(updatedFiles)
    onUpdate({ ...data, attachments: updatedFiles })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (type === "application/pdf") return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Upload supporting documents such as transaction records, identification copies, correspondence, or other
              relevant evidence. Maximum file size: 10MB per file.
            </AlertDescription>
          </Alert>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500">Supports: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF</p>
              <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
            </div>
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button type="button" className="mt-4">
                Select Files
              </Button>
            </Label>
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Uploaded Files ({files.length})</h4>
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Include transaction records, receipts, or statements</li>
                <li>• Attach copies of identification documents (if available)</li>
                <li>• Include any correspondence related to the suspicious activity</li>
                <li>• Add screenshots of digital transactions or communications</li>
                <li>• Ensure all documents are legible and relevant to the report</li>
                <li>• Remove or redact any unnecessary personal information</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>Next: Review & Submit</Button>
      </div>
    </div>
  )
}
