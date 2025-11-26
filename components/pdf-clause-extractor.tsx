"use client"

import { useState, useRef, useCallback, type ChangeEvent } from "react"
import type { PDFDocumentProxy, TextItem } from "pdfjs-dist/types/src/display/api"
import JSZip from "jszip"
import { Header } from "./header"
import { PdfViewer } from "./pdf-viewer"
import { ClauseEditor } from "./clause-editor"
import { UploadZone } from "./upload-zone"
import { StatsBar } from "./stats-bar"

export interface Clause {
  id: number
  text: string
}

export function PdfClauseExtractor() {
  const [clauses, setClauses] = useState<Clause[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState<number>(0)

  const viewerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setLoading(true)
    setClauses([])
    setFileName(file.name)
    setPageCount(0)

    if (viewerRef.current) {
      viewerRef.current.innerHTML = ""
    }

    try {
      const pdfjsLib = await import("pdfjs-dist")

      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf: PDFDocumentProxy = await loadingTask.promise

      setPageCount(pdf.numPages)

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")

        if (context) {
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.className = "rounded-lg shadow-lg mb-4 w-full"

          if (viewerRef.current) viewerRef.current.appendChild(canvas)

          await page.render({
            canvasContext: context,
            viewport,
            canvas
          }).promise
        }
      }

      let fullText = ""

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item) => ("str" in item ? (item as TextItem).str : ""))
          .join(" ")
        fullText += pageText + " "
      }

      const singleLineText = fullText.replace(/\s+/g, " ").trim()

      if (!singleLineText) {
        throw new Error("Não foi possível extrair texto do PDF.")
      }

      const rawParts = singleLineText.split(/(?<=[?.;:])\s+/)
      const refinedParts: string[] = []
      let buffer = ""
      const isEnumeration = /^(\d+(\.\d+)*\.|[IVX]+\.)$/i
      const isAbbreviation = /^(Art|Lei|n|nr|p|fls|v|vs|Ex|Sra?|Dr|Dra)\.$/i

      for (const part of rawParts) {
        const trimmed = part.trim()
        if (!trimmed) continue
        if (isEnumeration.test(trimmed) || isAbbreviation.test(trimmed)) {
          buffer += trimmed + " "
        } else {
          refinedParts.push(buffer + trimmed)
          buffer = ""
        }
      }
      if (buffer) refinedParts.push(buffer.trim())

      if (refinedParts.length === 0) {
        setError("Não consegui identificar frases no documento.")
        setClauses([])
        return
      }

      const mapped: Clause[] = refinedParts.map((text, index) => ({
        id: Date.now() + index,
        text,
      }))

      setClauses(mapped)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Erro ao processar o PDF. Verifique se o arquivo é válido.")
      setClauses([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDeleteClause = useCallback((id: number) => {
    setClauses((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const handleAddClauseToEnd = useCallback(() => {
    setClauses((prev) => [...prev, { id: Date.now(), text: "" }])
  }, [])

  const handleInsertAfter = useCallback((index: number) => {
    const newClause: Clause = {
      id: Date.now() + Math.random(),
      text: "",
    }

    setClauses((prev) => {
      const newList = [...prev]
      newList.splice(index + 1, 0, newClause)
      return newList
    })
  }, [])

  const handleEditClause = useCallback((id: number, newText: string) => {
    setClauses((prev) => prev.map((c) => (c.id === id ? { ...c, text: newText } : c)))
  }, [])

  const handleExport = useCallback(async () => {
    if (clauses.length === 0) return

    const zip = new JSZip()
    const today = new Date().toISOString().split("T")[0]

    let idCompany = "unknown"

    if (fileName) {
      const nameWithoutExt = fileName.replace(/\.pdf$/i, "")
      idCompany = nameWithoutExt.replace(/^(ppol|tos)\s*_\s*/i, "").trim()
    }

    clauses.forEach((c, index) => {
      const uid = crypto.randomUUID().replace(/-/g, "")

      const jsonContent = {
        data: {
          uid: uid,
          id_company: idCompany,
          id_clause: index + 1,
          clause: c.text,
          data_gathering: today
        }
      }

      zip.file(`${fileName}_${index + 1}.json`, JSON.stringify(jsonContent, null, 2))
    })

    try {
      setLoading(true)
      const content = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(content)
      const a = document.createElement("a")
      a.href = url
      a.download = `${idCompany}_dataset.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Erro ao gerar ZIP", err)
      setError("Erro ao gerar o arquivo ZIP.")
    } finally {
      setLoading(false)
    }
  }, [clauses, fileName])

  const handleClear = useCallback(() => {
    setClauses([])
    setFileName(null)
    setPageCount(0)
    setError(null)
    if (viewerRef.current) {
      viewerRef.current.innerHTML = ""
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const hasClauses = clauses.length > 0
  const hasDocument = fileName !== null

  return (
    <div className="flex flex-col h-screen">
      <Header fileName={fileName} onClear={handleClear} hasDocument={hasDocument} />

      {!hasDocument ? (
        <UploadZone onFileChange={handleFileChange} loading={loading} error={error} fileInputRef={fileInputRef} />
      ) : (
        <>
          <StatsBar
            pageCount={pageCount}
            clauseCount={clauses.length}
            loading={loading}
            onExport={handleExport}
            hasClauses={hasClauses}
          />

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
            <PdfViewer viewerRef={viewerRef} loading={loading} error={error} />

            <ClauseEditor
              clauses={clauses}
              onDeleteClause={handleDeleteClause}
              onEditClause={handleEditClause}
              onInsertAfter={handleInsertAfter}
              onAddClauseToEnd={handleAddClauseToEnd}
              loading={loading}
            />
          </div>
        </>
      )}
    </div>
  )
}