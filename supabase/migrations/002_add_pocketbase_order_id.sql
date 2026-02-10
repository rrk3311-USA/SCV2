-- Backup from PB: store PB record id so we can update the backup when PB order is updated.
alter table public.orders
  add column if not exists pocketbase_order_id text;

comment on column public.orders.pocketbase_order_id is 'PocketBase record id; Supabase holds a backup copy of each PB order.';

create index if not exists orders_pocketbase_order_id_idx on public.orders(pocketbase_order_id)
  where pocketbase_order_id is not null;
