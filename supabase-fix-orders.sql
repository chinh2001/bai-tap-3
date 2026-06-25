-- Chạy file này trong Supabase SQL Editor nếu đã tạo bảng trước đó
-- Sửa lỗi "Không thể đặt hàng" do thiếu quyền SELECT sau INSERT

drop policy if exists "public can insert orders" on public.orders;
create policy "public can insert orders"
on public.orders
for insert
to public
with check (true);

drop policy if exists "public can insert order_items" on public.order_items;
create policy "public can insert order_items"
on public.order_items
for insert
to public
with check (true);

drop policy if exists "public can insert contacts" on public.contacts;
create policy "public can insert contacts"
on public.contacts
for insert
to public
with check (true);

create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_note text,
  p_total_amount numeric,
  p_items jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id bigint;
  v_item jsonb;
begin
  insert into public.orders (customer_name, phone, address, note, total_amount)
  values (p_customer_name, p_phone, p_address, p_note, p_total_amount)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id, product_id, product_name, price, quantity, line_total
    ) values (
      v_order_id,
      (v_item->>'product_id')::bigint,
      v_item->>'product_name',
      (v_item->>'price')::numeric,
      (v_item->>'quantity')::integer,
      (v_item->>'line_total')::numeric
    );
  end loop;

  return v_order_id;
end;
$$;

revoke all on function public.create_order(text, text, text, text, numeric, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, numeric, jsonb) to anon, authenticated;
