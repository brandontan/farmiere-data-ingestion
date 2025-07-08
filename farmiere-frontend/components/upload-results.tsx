'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { UploadResult } from '@/app/page'

interface UploadResultsProps {
  result: UploadResult
  onReset: () => void
}

export function UploadResults({ result, onReset }: UploadResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          Upload {result.success ? 'Successful' : 'Failed'}
        </CardTitle>
        <CardDescription>
          {result.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.success && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Rows:</span> {result.totalRows}
            </div>
            <div>
              <span className="font-medium">Inserted:</span> {result.insertedRows}
            </div>
            <div>
              <span className="font-medium">Table:</span> {result.tableName}
            </div>
            <div>
              <span className="font-medium">Columns:</span> {result.columns.length}
            </div>
          </div>
        )}

        {result.errors && result.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Errors encountered:</div>
                {result.errors.map((error, index) => (
                  <div key={index} className="text-sm">{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button onClick={onReset}>
            Upload Another File
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}