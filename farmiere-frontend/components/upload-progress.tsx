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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Uploading Data
        </CardTitle>
        <CardDescription>
          Processing {fileName} with {totalRows} rows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="text-center text-sm text-muted-foreground">
          {progress}% complete
        </div>
      </CardContent>
    </Card>
  )
}