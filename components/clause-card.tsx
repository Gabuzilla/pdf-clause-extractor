"use client"

import { useState, useRef, useEffect } from "react"
import { Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Clause } from "./pdf-clause-extractor"

interface ClauseCardProps {
  clause: Clause
  index: number
  onDelete: () => void
  onEdit: (newText: string) => void
}

export function ClauseCard({ clause, index, onDelete, onEdit }: ClauseCardProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [clause.text])

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card transition-all duration-200",
        isFocused ? "border-accent ring-1 ring-accent/20" : "border-border hover:border-muted-foreground/30",
      )}
    >
      <div className="flex items-start gap-2 p-3">
        <div className="flex items-center gap-2 pt-2 shrink-0">
          <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
          <span className="w-6 h-6 rounded bg-muted text-xs font-medium flex items-center justify-center text-muted-foreground">
            {index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={clause.text}
            onChange={(e) => onEdit(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Digite o texto da cláusula..."
            className="w-full resize-none bg-transparent border-0 p-0 text-sm leading-relaxed focus:outline-none placeholder:text-muted-foreground/50"
            rows={1}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
