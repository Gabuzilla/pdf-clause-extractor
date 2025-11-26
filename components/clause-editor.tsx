"use client"

import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClauseCard } from "./clause-card"
import type { Clause } from "./pdf-clause-extractor"

interface ClauseEditorProps {
  clauses: Clause[]
  onDeleteClause: (id: number) => void
  onEditClause: (id: number, newText: string) => void
  onInsertAfter: (index: number) => void
  onAddClauseToEnd: () => void
  loading: boolean
}

export function ClauseEditor({
  clauses,
  onDeleteClause,
  onEditClause,
  onInsertAfter,
  onAddClauseToEnd,
  loading,
}: ClauseEditorProps) {
  const hasClauses = clauses.length > 0

  return (
    <div className="bg-background flex flex-col overflow-hidden">
      <div className="h-10 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <span className="text-sm font-medium text-muted-foreground">Editor de Cláusulas</span>
        <Button variant="ghost" size="sm" onClick={onAddClauseToEnd} className="h-7 text-xs" disabled={loading}>
          <Plus className="w-3 h-3 mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Extraindo cláusulas...</span>
            </div>
          </div>
        ) : hasClauses ? (
          <div className="space-y-2">
            {clauses.map((clause, index) => (
              <div key={clause.id}>
                <ClauseCard
                  clause={clause}
                  index={index}
                  onDelete={() => onDeleteClause(clause.id)}
                  onEdit={(newText) => onEditClause(clause.id, newText)}
                />

                {/* Insert button between clauses */}
                <div className="flex justify-center py-1 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onInsertAfter(index)}
                    className="w-6 h-6 rounded-full border border-dashed border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-colors"
                    title="Inserir cláusula aqui"
                  >
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">Nenhuma cláusula encontrada</p>
            <Button variant="outline" size="sm" onClick={onAddClauseToEnd}>
              Adicionar cláusula
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
