-- Create Orders Table
create table if not exists public.orders (
    id text primary key,
    user_id uuid references auth.users(id), -- nullable to support guest checkouts
    customer_name text not null,
    phone text not null,
    address text not null,
    city text not null,
    pincode text not null,
    items jsonb not null,
    total numeric not null,
    status text not null default 'Pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.orders enable row level security;

-- Since the user requested a local "Admin Bypass" without creating a real Supabase admin account,
-- we must temporarily allow public select access so the bypassed AdminPage can fetch the orders
-- using the anon key. In a true production app, this would be locked behind a service role or auth check.
create policy "Allow public insert (guests and users)" on public.orders for insert with check (true);
create policy "Allow public select (temporarily open for local admin bypass demo)" on public.orders for select using (true);
create policy "Allow public update (temporarily open for local admin bypass demo)" on public.orders for update using (true);
create policy "Allow public delete (temporarily open for local admin bypass demo)" on public.orders for delete using (true);

-- Enable real-time for the orders table so the admin dashboard gets instant updates
alter publication supabase_realtime add table public.orders;
