"use client"

import type React from "react"

import { Upload, FileText, Loader2, AlertCircle } from "lucide-react"
import { type ChangeEvent, type RefObject, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  loading: boolean
  error: string | null
  fileInputRef: RefObject<HTMLInputElement | null>
}

export function UploadZone({ onFileChange, loading, error, fileInputRef }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0 && files[0].type === "application/pdf") {
        const fakeEvent = {
          target: { files: files },
        } as unknown as ChangeEvent<HTMLInputElement>
        onFileChange(fakeEvent)
      }
    },
    [onFileChange],
  )

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        className={cn(
          "w-full max-w-2xl border-2 border-dashed rounded-2xl p-12 transition-all duration-200",
          isDragging ? "border-accent bg-accent/5 scale-[1.02]" : "border-border bg-card",
          loading && "opacity-50 pointer-events-none",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center">
          {loading ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Processando documento...</h2>
              <p className="text-muted-foreground">Extraindo texto e renderizando páginas</p>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Erro no processamento</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  <Upload className="w-4 h-4" />
                  Tentar novamente
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Envie seu documento PDF</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Arraste e solte seu arquivo aqui ou clique para selecionar. Extraímos automaticamente todas as cláusulas
                para edição.
              </p>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  <Upload className="w-4 h-4" />
                  Selecionar PDF
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground mt-4">Formatos suportados: PDF</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
