-- Replace the single product price with a list of pricing packages (paket),
-- so a product can offer multiple tiers, each with its own name, price,
-- discount (percent or fixed amount), and description. price_currency stays
-- product-level and applies to every package.
alter table products
  add column packages jsonb not null default '[]'::jsonb;

update products
set packages = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid(),
    'name', 'Paket Utama',
    'price_amount', price_amount,
    'discount_type', 'none',
    'discount_value', 0,
    'description', ''
  )
);

alter table products drop column price_amount;
