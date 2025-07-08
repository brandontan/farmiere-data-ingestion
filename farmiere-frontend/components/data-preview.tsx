'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
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
  const [dataSource, setDataSource] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const dataSources = [
    { value: 'tiktok', label: 'TikTok Shop', table: 'temp_tiktok_data' },
    { value: 'shopee', label: 'Shopee', table: 'temp_shopee_data' },
    { value: 'aipost', label: 'aiPost (Affiliate Enrollment)', table: 'temp_aipost_data' },
    { value: 'goaffpro', label: 'GoAffPro', table: 'temp_goaffpro_data' }
  ]

  const selectedSource = dataSources.find(s => s.value === dataSource)
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
      formData.append('createTable', 'false') // Only create table if it doesn't exist
      formData.append('appendMode', 'true') // Append to existing table
      formData.append('fileName', data.fileName)
      formData.append('dataSource', dataSource)
      if (data.fileHash) {
        formData.append('fileHash', data.fileHash)
      }

      // Simulate progress
      onUploadProgress(25)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      onUploadProgress(75)

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
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>
            File: {data.fileName} | Rows: {data.data.length} | Columns: {data.columns.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Data Source</label>
              <Select value={dataSource} onValueChange={setDataSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target data source" />
                </SelectTrigger>
                <SelectContent>
                  {dataSources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label} → {source.table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                First upload creates table, subsequent uploads append to existing table
              </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {data.columns.map((column, index) => (
                        <th key={index} className="px-4 py-2 text-left font-medium text-gray-900 border-b">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b">
                        {data.columns.map((column, colIndex) => (
                          <td key={colIndex} className="px-4 py-2 text-gray-700">
                            {String(row[column] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.data.length > 10 && (
                <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 border-t">
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
                disabled={!dataSource || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload to Supabase'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}