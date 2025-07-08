'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ParsedData, UploadResult } from '@/app/page'

interface DataPreviewProps {
  data: ParsedData
  onUploadStart: () => void
  onUploadProgress: (progress: number) => void
  onUploadComplete: (result: UploadResult) => void
  onUploadError: (error: string) => void
  onReset: () => void
}

export function DataPreview({
  data,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onReset
}: DataPreviewProps) {
  const [isUploading, setIsUploading] = useState(false)

  const dataSources = [
    { value: 'tiktok', label: 'TikTok Shop', table: 'temp_tiktok_data' },
    { value: 'shopee', label: 'Shopee', table: 'temp_shopee_data' },
    { value: 'aipost', label: 'aiPost (Affiliate Enrollment)', table: 'temp_aipost_data' },
    { value: 'goaffpro', label: 'GoAffPro', table: 'temp_goaffpro_data' }
  ]

  const selectedSource = dataSources.find(s => s.value === data.dataSource)
  const previewData = data.data.slice(0, 10)

  const handleUpload = async () => {
    if (!selectedSource) return

    setIsUploading(true)
    onUploadStart()

    try {
      // Create FormData with file content
      const csvContent = [
        data.columns.join(','),
        ...data.data.map(row => 
          data.columns.map(col => {
            const value = row[col]
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value || ''
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const file = new File([blob], data.fileName, { type: 'text/csv' })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('tableName', selectedSource.table)
      formData.append('createTable', 'false') // Never create tables
      formData.append('appendMode', 'true') // Always append to existing table
      formData.append('fileName', data.fileName)
      formData.append('dataSource', data.dataSource || '')
      if (data.fileHash) {
        formData.append('fileHash', data.fileHash)
      }

      // Simulate progress during upload
      onUploadProgress(10)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      onUploadProgress(90)

      const result = await response.json()

      onUploadProgress(100)

      if (response.ok) {
        onUploadComplete(result)
      } else {
        onUploadError(result.error || 'Upload failed')
      }
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preview Data</CardTitle>
          <CardDescription>
            {selectedSource?.label} | File: {data.fileName} | {data.data.length} rows, {data.columns.length} columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/20">
                    <tr>
                      {data.columns.map((column, index) => (
                        <th key={index} className="px-4 py-2 text-left font-medium text-foreground border-b border-border">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border hover:bg-secondary/10">
                        {data.columns.map((column, colIndex) => (
                          <td key={colIndex} className="px-4 py-2 text-slate-200">
                            {String(row[column] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.data.length > 10 && (
                <div className="px-4 py-2 bg-secondary/20 text-sm text-muted-foreground border-t border-border">
                  Showing first 10 rows of {data.data.length} total rows
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onReset}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={!selectedSource || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}