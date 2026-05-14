"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { FolderOpen, Loader2, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { listDocuments, type DocumentSummary } from "@/app/actions/documents"

interface LoadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (documentId: string) => void
}

export function LoadDocumentDialog({
  open,
  onOpenChange,
  onSelect,
}: LoadDocumentDialogProps) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    listDocuments()
      .then((result) => {
        setDocuments(result.documents)
      })
      .finally(() => setLoading(false))
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Documentos salvos
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <FileText className="w-8 h-8 opacity-40" />
            <p className="text-sm">Nenhum documento salvo ainda.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-1 pr-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.page_count} {doc.page_count === 1 ? "página" : "páginas"} ·{" "}
                      {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-3 shrink-0 h-7 text-xs"
                    onClick={() => onSelect(doc.id)}
                  >
                    Carregar
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
