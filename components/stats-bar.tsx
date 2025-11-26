"use client"

import { FileText, ListOrdered, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StatsBarProps {
  pageCount: number
  clauseCount: number
  loading: boolean
  onExport: () => void
  hasClauses: boolean
}

export function StatsBar({ pageCount, clauseCount, loading, onExport, hasClauses }: StatsBarProps) {
  return (
    <div className="h-12 border-b border-border bg-card/50 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Páginas:</span>
          <span className="font-medium">{pageCount}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <ListOrdered className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Cláusulas:</span>
          <span className="font-medium">
            {loading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : clauseCount}
          </span>
        </div>
      </div>

      {hasClauses && (
        <Button variant="outline" size="sm" onClick={onExport} className="h-8 bg-transparent">
          <Download className="w-3 h-3 mr-1.5" />
          Exportar
        </Button>
      )}
    </div>
  )
}
