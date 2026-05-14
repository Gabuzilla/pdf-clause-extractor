-- Execute este arquivo no SQL Editor do Supabase (https://app.supabase.com > SQL Editor)

create extension if not exists "uuid-ossp";

-- Tabela de documentos
create table public.documents (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  file_name   text not null,
  company_id  text not null default 'unknown',
  page_count  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Tabela de cláusulas
create table public.clauses (
  id            uuid primary key default uuid_generate_v4(),
  document_id   uuid not null references public.documents(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  clause_index  integer not null,
  text          text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Índices para queries frequentes
create index documents_user_id_idx on public.documents(user_id);
create index clauses_document_id_idx on public.clauses(document_id);

-- Habilitar Row Level Security
alter table public.documents enable row level security;
alter table public.clauses enable row level security;

-- Políticas RLS: cada usuário vê/edita apenas seus próprios dados
create policy "own documents"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own clauses"
  on public.clauses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger para auto-atualizar updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.handle_updated_at();

create trigger clauses_updated_at
  before update on public.clauses
  for each row execute function public.handle_updated_at();
