'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/file-upload'
import { DataPreview } from '@/components/data-preview'
import { UploadProgress } from '@/components/upload-progress'
import { UploadResults } from '@/components/upload-results'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Database } from 'lucide-react'

export interface ParsedData {
  data: Record<string, any>[]
  columns: string[]
  fileName: string
  fileHash?: string
}

export interface UploadResult {
  success: boolean
  message: string
  totalRows: number
  insertedRows: number
  errors?: string[]
  columns: string[]
  tableName: string
}

export default function DataIngestionPage() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [activeTab, setActiveTab] = useState('upload')
  const [isSettingUp, setIsSettingUp] = useState(false)

  const setupTables = async () => {
    setIsSettingUp(true)
    try {
      const response = await fetch('/api/setup-tables', {
        method: 'POST',
      })
      
      if (response.ok) {
        alert('Database tables setup successfully!')
      } else {
        const error = await response.json()
        alert(`Setup failed: ${error.error}`)
      }
    } catch (error) {
      alert(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSettingUp(false)
    }
  }

  const handleDataParsed = (data: ParsedData) => {
    setParsedData(data)
    setActiveTab('preview')
    setUploadResult(null)
  }

  const handleUploadStart = () => {
    setIsUploading(true)
    setUploadProgress(0)
    setActiveTab('progress')
  }

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress)
  }

  const handleUploadComplete = (result: UploadResult) => {
    setIsUploading(false)
    setUploadResult(result)
    setActiveTab('results')
  }

  const handleUploadError = (error: string) => {
    setIsUploading(false)
    setUploadResult({
      success: false,
      message: error,
      totalRows: 0,
      insertedRows: 0,
      columns: [],
      tableName: ''
    })
    setActiveTab('results')
  }

  const handleReset = () => {
    setParsedData(null)
    setUploadResult(null)
    setUploadProgress(0)
    setActiveTab('upload')
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/farmiere.png" 
            alt="Farmière Logo" 
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Data Ingestion Portal</h1>
        <p className="text-muted-foreground mt-2">
          Upload CSV files for TikTok Shop, Shopee, aiPost, and GoAffPro data
        </p>
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={setupTables}
            disabled={isSettingUp}
            className="text-xs"
          >
            <Database className="h-3 w-3 mr-2" />
            {isSettingUp ? 'Setting up...' : 'One-time Database Setup'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="preview" disabled={!parsedData}>Preview</TabsTrigger>
          <TabsTrigger value="progress" disabled={!isUploading && uploadProgress === 0}>Progress</TabsTrigger>
          <TabsTrigger value="results" disabled={!uploadResult}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file to parse and preview before importing to your database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onDataParsed={handleDataParsed}
                disabled={isUploading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {parsedData && (
            <DataPreview
              data={parsedData}
              onUploadStart={handleUploadStart}
              onUploadProgress={handleUploadProgress}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onReset={handleReset}
            />
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <UploadProgress 
            progress={uploadProgress}
            fileName={parsedData?.fileName || ''}
            totalRows={parsedData?.data.length || 0}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {uploadResult && (
            <UploadResults 
              result={uploadResult}
              onReset={handleReset}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}