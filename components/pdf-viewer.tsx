"use client"

import type { RefObject } from "react"
import { Loader2 } from "lucide-react"

interface PdfViewerProps {
  viewerRef: RefObject<HTMLDivElement | null>
  loading: boolean
  error: string | null
}

export function PdfViewer({ viewerRef, loading }: PdfViewerProps) {
  return (
    <div className="border-r border-border bg-muted/30 flex flex-col overflow-hidden">
      <div className="h-10 border-b border-border bg-card flex items-center px-4 shrink-0">
        <span className="text-sm font-medium text-muted-foreground">Visualização do PDF</span>
      </div>

      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Renderizando...</span>
            </div>
          </div>
        )}
        <div ref={viewerRef} className="flex flex-col items-center gap-4" />
      </div>
    </div>
  )
}
