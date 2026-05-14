import { PdfClauseExtractor } from "@/components/pdf-clause-extractor"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-background">
      <PdfClauseExtractor user={user} />
    </main>
  )
}
