'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ParsedData } from '@/app/page'

interface FileUploadProps {
  onDataParsed: (data: ParsedData) => void
  disabled?: boolean
}

export function FileUpload({ onDataParsed, disabled }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dataSource, setDataSource] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)

  const dataSources = [
    { value: 'tiktok', label: 'TikTok Shop' },
    { value: 'shopee', label: 'Shopee' },
    { value: 'aipost', label: 'aiPost (Affiliate Enrollment)' },
    { value: 'goaffpro', label: 'GoAffPro' }
  ]

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
      setError(null)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setError(null)
    }
  }

  const generateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const validateCSVData = (data: Record<string, any>[], columns: string[]) => {
    const errors: string[] = []
    
    // Define bad symbols that will cause database issues
    const badSymbols = [';DROP', '--', '/*', '*/', '\\x00', '\\0']
    
    // Check column names for bad symbols
    columns.forEach((column, index) => {
      if (column.length === 0) {
        errors.push(`Column ${index + 1} has an empty name`)
      }
      // Check for null bytes or other problematic characters
      if (column.includes('\0') || column.includes('\\x00')) {
        errors.push(`Column "${column}" contains null bytes`)
      }
    })

    // Check data for bad symbols - scan first 100 rows
    const sampleSize = Math.min(100, data.length)
    for (let i = 0; i < sampleSize; i++) {
      const row = data[i]
      columns.forEach((column) => {
        const value = row[column]
        if (typeof value === 'string') {
          // Check for dangerous SQL patterns
          for (const badSymbol of badSymbols) {
            if (value.toUpperCase().includes(badSymbol)) {
              errors.push(`Row ${i + 1}, Column "${column}": Contains dangerous pattern "${badSymbol}"`)
            }
          }
          // Check for null bytes
          if (value.includes('\0')) {
            errors.push(`Row ${i + 1}, Column "${column}": Contains null bytes`)
          }
        }
      })
    }

    return errors
  }

  const checkForDuplicateFile = async (fileHash: string, fileName: string, dataSource: string) => {
    try {
      const response = await fetch('/api/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileHash,
          fileName,
          dataSource
        }),
      })

      if (response.ok) {
        const result = await response.json()
        return result
      }
      return { isDuplicate: false }
    } catch (error) {
      console.warn('Failed to check for duplicate file:', error)
      return { isDuplicate: false }
    }
  }

  const processFile = async () => {
    if (!selectedFile || !dataSource) return

    // Validate file extension
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a valid CSV file')
      return
    }

    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size too large. Maximum allowed size is 50MB')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Generate file hash for duplicate detection
      const fileHash = await generateFileHash(selectedFile)
      
      // Check for duplicate file
      const duplicateCheck = await checkForDuplicateFile(fileHash, selectedFile.name, dataSource)
      
      if (duplicateCheck.isDuplicate) {
        setError(`WARNING: This CSV has been uploaded before on ${new Date(duplicateCheck.uploadDate).toLocaleString()}`)
        setIsProcessing(false)
        return
      }

      const text = await selectedFile.text()
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          return header.trim()
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`CSV parsing failed: ${results.errors[0].message}`)
            setIsProcessing(false)
            return
          }

          const data = results.data as Record<string, any>[]
          
          if (data.length === 0) {
            setError('No data found in the CSV file')
            setIsProcessing(false)
            return
          }

          const columns = Object.keys(data[0])

          // Validate CSV data for bad symbols
          const validationErrors = validateCSVData(data, columns)
          
          if (validationErrors.length > 0) {
            setError(`VALIDATION FAILED - Bad symbols detected:\n${validationErrors.join('\n')}`)
            setIsProcessing(false)
            return
          }

          // Pass data along with file hash
          onDataParsed({
            data,
            columns,
            fileName: selectedFile.name,
            fileHash
          })
          
          setIsProcessing(false)
        },
        error: (error) => {
          setError(`Failed to parse CSV: ${error.message}`)
          setIsProcessing(false)
        }
      })
    } catch (err) {
      setError(`Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Data Source</label>
        <Select value={dataSource} onValueChange={setDataSource}>
          <SelectTrigger>
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            {dataSources.map((source) => (
              <SelectItem key={source.value} value={source.value}>
                {source.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">
              Drag and drop a CSV file here, or{' '}
              <label htmlFor="file-upload" className="text-primary cursor-pointer hover:underline">
                browse
              </label>
            </p>
          </div>
        </div>
        
        {selectedFile && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <FileText className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">{selectedFile.name}</span>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          onClick={processFile}
          disabled={!selectedFile || !dataSource || isProcessing || disabled}
          className="w-full sm:w-auto"
        >
          {isProcessing ? 'Processing...' : 'Process File'}
        </Button>
      </div>
    </div>
  )
}