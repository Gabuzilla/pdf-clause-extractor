"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Clause } from "@/components/pdf-clause-extractor"

export interface SaveDocumentInput {
  fileName: string
  pageCount: number
  clauses: Clause[]
}

export interface SaveDocumentResult {
  success: boolean
  documentId?: string
  error?: string
}

export interface DocumentSummary {
  id: string
  file_name: string
  company_id: string
  page_count: number
  created_at: string
}

export interface LoadDocumentResult {
  success: boolean
  document?: DocumentSummary
  clauses?: Clause[]
  error?: string
}

function extractCompanyId(fileName: string): string {
  const nameWithoutExt = fileName.replace(/\.pdf$/i, "")
  return nameWithoutExt.replace(/^(ppol|tos)\s*_\s*/i, "").trim() || "unknown"
}

export async function saveDocument(
  input: SaveDocumentInput,
  existingDocumentId?: string
): Promise<SaveDocumentResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Não autenticado." }

  const companyId = extractCompanyId(input.fileName)

  try {
    let documentId = existingDocumentId

    if (documentId) {
      const { error } = await supabase
        .from("documents")
        .update({
          file_name: input.fileName,
          page_count: input.pageCount,
          company_id: companyId,
        })
        .eq("id", documentId)
        .eq("user_id", user.id)

      if (error) throw error

      await supabase.from("clauses").delete().eq("document_id", documentId)
    } else {
      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          file_name: input.fileName,
          page_count: input.pageCount,
          company_id: companyId,
        })
        .select("id")
        .single()

      if (error) throw error
      documentId = data.id
    }

    if (input.clauses.length > 0) {
      const clauseRows = input.clauses.map((c, idx) => ({
        document_id: documentId!,
        user_id: user.id,
        clause_index: idx,
        text: c.text,
      }))

      const { error } = await supabase.from("clauses").insert(clauseRows)
      if (error) throw error
    }

    revalidatePath("/")
    return { success: true, documentId }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao salvar."
    return { success: false, error: message }
  }
}

export async function loadDocument(documentId: string): Promise<LoadDocumentResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Não autenticado." }

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id, file_name, page_count, company_id, created_at")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single()

  if (docError || !doc) return { success: false, error: "Documento não encontrado." }

  const { data: clauseRows, error: clauseError } = await supabase
    .from("clauses")
    .select("clause_index, text")
    .eq("document_id", documentId)
    .order("clause_index", { ascending: true })

  if (clauseError) return { success: false, error: "Erro ao carregar cláusulas." }

  const clauses: Clause[] = (clauseRows ?? []).map((row) => ({
    id: row.clause_index,
    text: row.text,
  }))

  return { success: true, document: doc, clauses }
}

export async function listDocuments(): Promise<{
  success: boolean
  documents: DocumentSummary[]
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, documents: [] }

  const { data, error } = await supabase
    .from("documents")
    .select("id, file_name, page_count, company_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return { success: false, documents: [] }
  return { success: true, documents: data ?? [] }
}
