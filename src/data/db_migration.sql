-- Create table for cart items
create table cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id text not null,
  name text not null,
  price numeric not null,
  mrp numeric not null,
  quantity integer not null default 1,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(user_id, product_id)
);

-- Enable RLS
alter table cart_items enable row level security;

-- Policies for Row Level Security
create policy "Users can only see their own cart items" on cart_items
  for select using (auth.uid() = user_id);

create policy "Users can only insert their own cart items" on cart_items
  for insert with check (auth.uid() = user_id);

create policy "Users can only update their own cart items" on cart_items
  for update using (auth.uid() = user_id);

create policy "Users can only delete their own cart items" on cart_items
  for delete using (auth.uid() = user_id);
