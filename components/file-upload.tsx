"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  id: string
  label: string
  value: File | null
  onChange: (file: File | null) => void
  accept?: string
  helpText?: string
}

export function FileUpload({ id, label, value, onChange, accept = "image/*", helpText }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Create a preview when a file is selected
  useEffect(() => {
    if (!value) {
      setPreview(null)
      return
    }

    // Create a local object URL for the file
    const objectUrl = URL.createObjectURL(value)
    setPreview(objectUrl)

    // Clean up the object URL when the component unmounts or when the file changes
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [value])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      onChange(file)
    }
  }

  const handleClear = () => {
    onChange(null)
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-200">
        {label}
      </Label>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="bg-[#1e293b] border-gray-700 text-white hover:bg-gray-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose File
        </Button>

        {preview && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            className="bg-[#1e293b] border-gray-700 text-white hover:bg-red-900/20 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <span className="text-sm text-gray-400">{value ? value.name : "No file selected"}</span>
      </div>

      <Input ref={inputRef} id={id} type="file" accept={accept} onChange={handleFileChange} className="hidden" />

      {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}

      {preview && (
        <div className="mt-2">
          <p className="text-sm text-gray-400 mb-2">Preview:</p>
          <div className="relative h-40 w-full border border-gray-700 rounded bg-[#0f1623]">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
