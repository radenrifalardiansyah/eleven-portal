-- Split products.price (free text like "Rp 3.500.000") into a numeric amount
-- plus a currency code, so prices can be sorted/formatted and support
-- currencies beyond Rupiah.
alter table products
  add column price_amount numeric(14, 2) not null default 0,
  add column price_currency text not null default 'IDR';

alter table products
  add constraint products_price_currency_check
  check (price_currency in ('IDR', 'USD', 'SGD', 'EUR', 'MYR'));

update products
set price_amount = coalesce(nullif(regexp_replace(price, '[^0-9]', '', 'g'), '')::numeric, 0);

alter table products drop column price;
