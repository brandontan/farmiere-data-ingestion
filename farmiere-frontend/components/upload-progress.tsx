'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload } from 'lucide-react'

interface UploadProgressProps {
  progress: number
  fileName: string
  totalRows: number
}

export function UploadProgress({ progress, fileName, totalRows }: UploadProgressProps) {
  const getStatusMessage = () => {
    if (progress < 20) return "Preparing upload..."
    if (progress < 40) return "Validating data structure..."
    if (progress < 60) return "Creating database table..."
    if (progress < 80) return "Verifying table readiness..."
    if (progress < 95) return "Inserting data..."
    return "Finalizing upload..."
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 animate-pulse" />
          Uploading Data
        </CardTitle>
        <CardDescription>
          Processing {fileName} with {totalRows} rows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="text-center space-y-1">
          <div className="text-sm font-medium">
            {progress}% complete
          </div>
          <div className="text-xs text-muted-foreground">
            {getStatusMessage()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}