-- Chạy file này trong Supabase SQL Editor sau khi bật Google OAuth
-- Dashboard → Authentication → Providers → Google

-- Bảng hồ sơ khách hàng (liên kết auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  email text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

-- Tự tạo profile khi đăng ký Google lần đầu
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    new.email
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Gắn đơn hàng với tài khoản đã đăng nhập
alter table public.orders add column if not exists user_id uuid references auth.users(id);

-- Cập nhật RPC create_order để lưu user_id
drop function if exists public.create_order(text, text, text, text, numeric, jsonb);

create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_note text,
  p_total_amount numeric,
  p_items jsonb,
  p_user_id uuid default null
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
  insert into public.orders (customer_name, phone, address, note, total_amount, user_id)
  values (p_customer_name, p_phone, p_address, p_note, p_total_amount, p_user_id)
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

revoke all on function public.create_order(text, text, text, text, numeric, jsonb, uuid) from public;
grant execute on function public.create_order(text, text, text, text, numeric, jsonb, uuid) to anon, authenticated;
