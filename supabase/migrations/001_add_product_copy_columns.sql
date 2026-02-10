-- Run in Supabase SQL Editor if products table already exists without these columns.
-- Full product copy from products-from-site.json (copy, identifiers, physical, FAQs).

alter table public.products add column if not exists suggested_use text;
alter table public.products add column if not exists supplement_facts text;
alter table public.products add column if not exists ingredients text;
alter table public.products add column if not exists upc text;
alter table public.products add column if not exists gtin text;
alter table public.products add column if not exists weight text;
alter table public.products add column if not exists dimensions text;
alter table public.products add column if not exists key_search_terms text;
alter table public.products add column if not exists faqs jsonb default '[]'::jsonb;
