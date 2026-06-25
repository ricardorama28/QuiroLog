-- cases: one row per SurgicalCase, owned by one user, text PK (client-generated)
create table if not exists cases (
  id                      text primary key,
  owner_id                uuid not null default auth.uid() references auth.users(id) on delete cascade,
  procedure_id            text,
  procedure_name_snapshot text,
  date                    text,           -- ISO yyyy-MM-dd
  status                  text not null default 'done',
  role                    text,
  laterality              text,
  patient_label           text,
  diagnosis               text,
  institution             text,
  implant_used            text,
  intraop_notes           text,
  notes                   text,
  actual_duration_min     int,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
alter table cases enable row level security;
create policy "cases_owner_rw" on cases
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- procedure_overrides: DELTA only — user-created, user-edited, or pinned procedures
-- KB procedures that are untouched (source:'kb', userEdited:false, pinned:false) are NEVER uploaded (INV-8)
create table if not exists procedure_overrides (
  id          text not null,          -- procedure slug / custom id
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  payload     jsonb not null,         -- full Procedure object
  source      text not null,          -- 'user' | 'kb'
  user_edited boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (id, owner_id)
);
alter table procedure_overrides enable row level security;
create policy "po_owner_rw" on procedure_overrides
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- tombstones: client-managed deleted IDs; pushed on flush, then deleted from this table
create table if not exists tombstones (
  id          text not null,
  kind        text not null,          -- 'case' | 'procedure'
  owner_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  deleted_at  timestamptz not null default now(),
  primary key (id, owner_id)
);
alter table tombstones enable row level security;
create policy "tombstones_owner_rw" on tombstones
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
