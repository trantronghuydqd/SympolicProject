begin;

truncate table
  payments,
  order_items,
  orders,
  product_images,
  product_inventory,
  product_sizes,
  product_colors,
  products,
  banners,
  coupons,
  shipping_methods,
  payment_methods,
  categories,
  profiles
restart identity cascade;

insert into categories (
  category_name,
  slug,
  description,
  image_url,
  is_active,
  created_at
)
values
  ('Varsity', 'varsity', 'Áo varsity / jacket', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/category-images/varsity.jpg', true, now()),
  ('Hoodies', 'hoodies', 'Áo hoodie', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/category-images/hoodies.jpg', true, now()),
  ('Jacket', 'jacket', 'Áo khoác', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/category-images/jacket.jpg', true, now()),
  ('Cardigans', 'cardigans', 'Áo cardigan', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/category-images/cardigans.jpg', true, now()),
  ('T-Shirts & Polo Shirts', 't-shirts-polo-shirts', 'Áo thun và áo polo', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/category-images/t-shirts-polo-shirts.jpg', true, now());

insert into products (
  category_id,
  product_name,
  slug,
  description,
  base_price,
  compare_at_price,
  is_active,
  created_at,
  updated_at
)
select
  c.category_id,
  p.product_name,
  p.slug,
  p.description,
  p.base_price,
  p.compare_at_price,
  p.is_active,
  now(),
  now()
from (
  values
    ('varsity', 'Ted Jacket', 'ted-jacket', 'Varsity jacket Ted Jacket', 299000, 349000, true),
    ('hoodies', 'Script Hoodie', 'script-hoodie', 'Hoodie Script Hoodie', 229000, 279000, true),
    ('hoodies', 'Signature Zipup Hoodie', 'signature-zipup-hoodie', 'Hoodie Signature Zipup Hoodie', 229000, 279000, true),
    ('jacket', 'Windbreaker Gorpcore Jacket', 'windbreaker-gorpcore-jacket', 'Windbreaker Gorpcore Jacket', 239000, 299000, true),
    ('jacket', 'Sporty Jacket', 'sporty-jacket', 'Sporty Jacket', 249000, 319000, true),
    ('cardigans', 'Schoolknit Cardigan', 'schoolknit-cardigan', 'Schoolknit Cardigan', 179000, 229000, true),
    ('t-shirts-polo-shirts', 'Bloke Tee', 'bloke-tee', 'Bloke Tee', 149000, 179000, true),
    ('t-shirts-polo-shirts', 'Cities Ball Tee', 'cities-ball-tee', 'Cities Ball Tee', 149000, 179000, true)
) as p(category_slug, product_name, slug, description, base_price, compare_at_price, is_active)
join categories c on c.slug = p.category_slug;

insert into product_colors (
  product_id,
  color_name,
  color_code,
  price_adjustment,
  created_at
)
select
  p.product_id,
  c.color_name,
  c.color_code,
  c.price_adjustment,
  now()
from (
  values
    ('ted-jacket', 'Blue', '#3B82F6', 0),
    ('ted-jacket', 'Gray', '#6B7280', 0),
    ('script-hoodie', 'Black', '#111827', 0),
    ('script-hoodie', 'Grey', '#9CA3AF', 0),
    ('signature-zipup-hoodie', 'Grey', '#9CA3AF', 0),
    ('signature-zipup-hoodie', 'Black', '#111827', 0),
    ('windbreaker-gorpcore-jacket', 'Black', '#111827', 0),
    ('windbreaker-gorpcore-jacket', 'White', '#F9FAFB', 0),
    ('sporty-jacket', 'Black Grey', '#374151', 0),
    ('sporty-jacket', 'White Red', '#DC2626', 0),
    ('schoolknit-cardigan', 'Grey', '#9CA3AF', 0),
    ('schoolknit-cardigan', 'Cream White', '#FFF7E6', 0),
    ('bloke-tee', 'Black', '#111827', 0),
    ('bloke-tee', 'White', '#F9FAFB', 0),
    ('cities-ball-tee', 'White', '#F9FAFB', 0),
    ('cities-ball-tee', 'Light Blue', '#93C5FD', 0)
) as c(product_slug, color_name, color_code, price_adjustment)
join products p on p.slug = c.product_slug;

insert into product_sizes (
  product_id,
  size_name,
  price_adjustment,
  is_active
)
select
  p.product_id,
  s.size_name,
  s.price_adjustment,
  s.is_active
from (
  values
    ('ted-jacket', 'M', 0, true),
    ('ted-jacket', 'L', 0, true),
    ('script-hoodie', 'M', 0, true),
    ('script-hoodie', 'L', 0, true),
    ('signature-zipup-hoodie', 'M', 0, true),
    ('signature-zipup-hoodie', 'L', 0, true),
    ('windbreaker-gorpcore-jacket', 'M', 0, true),
    ('windbreaker-gorpcore-jacket', 'L', 0, true),
    ('sporty-jacket', 'M', 0, true),
    ('sporty-jacket', 'L', 0, true),
    ('schoolknit-cardigan', 'M', 0, true),
    ('schoolknit-cardigan', 'L', 0, true),
    ('bloke-tee', 'M', 0, true),
    ('bloke-tee', 'L', 0, true),
    ('cities-ball-tee', 'M', 0, true),
    ('cities-ball-tee', 'L', 0, true)
) as s(product_slug, size_name, price_adjustment, is_active)
join products p on p.slug = s.product_slug;

insert into product_inventory (
  product_id,
  color_id,
  size_id,
  stock_quantity,
  sku,
  created_at,
  updated_at
)
select
  p.product_id,
  c.color_id,
  s.size_id,
  v.stock_quantity,
  v.sku,
  now(),
  now()
from (
  values
    ('ted-jacket', 'Blue', 'M', 20, 'VAR-TED-BLUE-M'),
    ('ted-jacket', 'Blue', 'L', 18, 'VAR-TED-BLUE-L'),
    ('ted-jacket', 'Gray', 'M', 20, 'VAR-TED-GRAY-M'),
    ('ted-jacket', 'Gray', 'L', 18, 'VAR-TED-GRAY-L'),

    ('script-hoodie', 'Black', 'M', 22, 'HOO-SCRIPT-BLACK-M'),
    ('script-hoodie', 'Black', 'L', 20, 'HOO-SCRIPT-BLACK-L'),
    ('script-hoodie', 'Grey', 'M', 22, 'HOO-SCRIPT-GREY-M'),
    ('script-hoodie', 'Grey', 'L', 20, 'HOO-SCRIPT-GREY-L'),

    ('signature-zipup-hoodie', 'Grey', 'M', 22, 'HOO-SIGNATURE-GREY-M'),
    ('signature-zipup-hoodie', 'Grey', 'L', 20, 'HOO-SIGNATURE-GREY-L'),
    ('signature-zipup-hoodie', 'Black', 'M', 22, 'HOO-SIGNATURE-BLACK-M'),
    ('signature-zipup-hoodie', 'Black', 'L', 20, 'HOO-SIGNATURE-BLACK-L'),

    ('windbreaker-gorpcore-jacket', 'Black', 'M', 16, 'JAC-WIND-BLACK-M'),
    ('windbreaker-gorpcore-jacket', 'Black', 'L', 14, 'JAC-WIND-BLACK-L'),
    ('windbreaker-gorpcore-jacket', 'White', 'M', 16, 'JAC-WIND-WHITE-M'),
    ('windbreaker-gorpcore-jacket', 'White', 'L', 14, 'JAC-WIND-WHITE-L'),

    ('sporty-jacket', 'Black Grey', 'M', 16, 'JAC-SPORTY-BLACK-GREY-M'),
    ('sporty-jacket', 'Black Grey', 'L', 14, 'JAC-SPORTY-BLACK-GREY-L'),
    ('sporty-jacket', 'White Red', 'M', 16, 'JAC-SPORTY-WHITE-RED-M'),
    ('sporty-jacket', 'White Red', 'L', 14, 'JAC-SPORTY-WHITE-RED-L'),

    ('schoolknit-cardigan', 'Grey', 'M', 18, 'CAR-SCHOOLKNIT-GREY-M'),
    ('schoolknit-cardigan', 'Grey', 'L', 16, 'CAR-SCHOOLKNIT-GREY-L'),
    ('schoolknit-cardigan', 'Cream White', 'M', 18, 'CAR-SCHOOLKNIT-CREAM-WHITE-M'),
    ('schoolknit-cardigan', 'Cream White', 'L', 16, 'CAR-SCHOOLKNIT-CREAM-WHITE-L'),

    ('bloke-tee', 'Black', 'M', 30, 'TEE-BLOKE-BLACK-M'),
    ('bloke-tee', 'Black', 'L', 28, 'TEE-BLOKE-BLACK-L'),
    ('bloke-tee', 'White', 'M', 30, 'TEE-BLOKE-WHITE-M'),
    ('bloke-tee', 'White', 'L', 28, 'TEE-BLOKE-WHITE-L'),

    ('cities-ball-tee', 'White', 'M', 30, 'TEE-CITIES-BALL-WHITE-M'),
    ('cities-ball-tee', 'White', 'L', 28, 'TEE-CITIES-BALL-WHITE-L'),
    ('cities-ball-tee', 'Light Blue', 'M', 30, 'TEE-CITIES-BALL-LIGHT-BLUE-M'),
    ('cities-ball-tee', 'Light Blue', 'L', 28, 'TEE-CITIES-BALL-LIGHT-BLUE-L')
) as v(product_slug, color_name, size_name, stock_quantity, sku)
join products p on p.slug = v.product_slug
join product_colors c on c.product_id = p.product_id and c.color_name = v.color_name
join product_sizes s on s.product_id = p.product_id and s.size_name = v.size_name;

insert into product_images (
  product_id,
  color_id,
  image_url,
  alt_text,
  is_primary,
  display_order
)
select
  p.product_id,
  c.color_id,
  i.image_url,
  i.alt_text,
  i.is_primary,
  i.display_order
from (
  values
    ('ted-jacket', 'Blue', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/varsity/ted-jacket-blue.jpg', 'Ted Jacket - Blue', true, 1),
    ('ted-jacket', 'Gray', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/varsity/ted-jacket-gray.jpg', 'Ted Jacket - Gray', true, 1),

    ('script-hoodie', 'Black', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/hoodies/script-hoodie-black.jpg', 'Script Hoodie - Black', true, 1),
    ('script-hoodie', 'Grey', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/hoodies/script-hoodie-grey.jpg', 'Script Hoodie - Grey', true, 1),

    ('signature-zipup-hoodie', 'Grey', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/hoodies/signature-zipup-hoodie-grey.jpg', 'Signature Zipup Hoodie - Grey', true, 1),
    ('signature-zipup-hoodie', 'Black', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/hoodies/signature-zipup-hoodie-black.jpg', 'Signature Zipup Hoodie - Black', true, 1),

    ('windbreaker-gorpcore-jacket', 'Black', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/jacket/windbreaker-gorpcore-jacket-black.jpg', 'Windbreaker Gorpcore Jacket - Black', true, 1),
    ('windbreaker-gorpcore-jacket', 'White', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/jacket/windbreaker-gorpcore-jacket-white.jpg', 'Windbreaker Gorpcore Jacket - White', true, 1),

    ('sporty-jacket', 'Black Grey', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/jacket/sporty-jacket-black-grey.jpg', 'Sporty Jacket - Black Grey', true, 1),
    ('sporty-jacket', 'White Red', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/jacket/sporty-jacket-white-red.jpg', 'Sporty Jacket - White Red', true, 1),

    ('schoolknit-cardigan', 'Grey', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/cardigans/schoolknit-cardigan-grey.jpg', 'Schoolknit Cardigan - Grey', true, 1),
    ('schoolknit-cardigan', 'Cream White', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/cardigans/schoolknit-cardigan-cream-white.jpg', 'Schoolknit Cardigan - Cream White', true, 1),

    ('bloke-tee', 'Black', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/t-shirts-polo-shirts/bloke-tee-black.jpg', 'Bloke Tee - Black', true, 1),
    ('bloke-tee', 'White', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/t-shirts-polo-shirts/bloke-tee-white.jpg', 'Bloke Tee - White', true, 1),

    ('cities-ball-tee', 'White', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/t-shirts-polo-shirts/cities-ball-tee-white.jpg', 'Cities Ball Tee - White', true, 1),
    ('cities-ball-tee', 'Light Blue', 'https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/products/t-shirts-polo-shirts/cities-ball-tee-light-blue.jpg', 'Cities Ball Tee - Light Blue', true, 1)
) as i(product_slug, color_name, image_url, alt_text, is_primary, display_order)
join products p on p.slug = i.product_slug
join product_colors c on c.product_id = p.product_id and c.color_name = i.color_name;

insert into banners (
  image_url,
  title,
  description,
  is_active,
  display_order,
  created_at,
  updated_at
)
values
  ('https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/symbolicv3/banner.jpg', 'Symbolic Collection', 'New drop cho mùa này', true, 1, now(), now()),
  ('https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/symbolicv3/banner1.png', 'Streetwear Essentials', 'Các item chủ lực trong bộ sưu tập', true, 2, now(), now()),
  ('https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/symbolicv3/banner2.png', 'Daily Outfit', 'Mix and match theo phong cách riêng', true, 3, now(), now());

insert into shipping_methods (
  method_name,
  base_fee,
  estimated_days,
  is_active,
  created_at,
  updated_at
)
values
  ('Giao hàng miễn phí', 0, '5-7 ngày', true, now(), now()),
  ('Giao hàng tiêu chuẩn', 30000, '3-5 ngày', true, now(), now()),
  ('Giao hàng nhanh', 60000, '1-2 ngày', true, now(), now());

insert into payment_methods (
  method_name,
  description,
  is_active,
  created_at,
  updated_at
)
values
  ('Thanh toán khi nhận hàng (COD)', 'Thanh toán tiền mặt khi nhận hàng', true, now(), now()),
  ('Chuyển khoản ngân hàng', 'Thanh toán qua chuyển khoản ngân hàng', true, now(), now());

insert into coupons (
  code,
  discount_type,
  discount_value,
  min_order_value,
  max_discount,
  valid_from,
  valid_to,
  is_active,
  usage_limit,
  usage_count,
  created_at,
  updated_at
)
values
  ('WELCOME10', 'percentage', 10, 200000, 50000, now() - interval '1 day', now() + interval '365 days', true, 100, 0, now(), now()),
  ('FREESHIP30', 'fixed', 30000, 300000, null, now() - interval '1 day', now() + interval '365 days', true, 50, 0, now(), now());

insert into profiles (
  id,
  role,
  full_name,
  email,
  phone_number,
  address,
  avatar_url,
  created_at,
  updated_at
)
values
  ('11111111-1111-1111-1111-111111111111', 'manager', 'Symbolic Admin', 'manager@example.com', '0900000001', 'Ho Chi Minh City', null, now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'customer', 'Nguyen Van A', 'customer@example.com', '0900000002', 'Ha Noi', null, now(), now());

with seed_order as (
  insert into orders (
    user_id,
    recipient_name,
    recipient_email,
    recipient_phone,
    shipping_address,
    notes,
    shipping_method_id,
    payment_method_id,
    coupon_id,
    discount_amount,
    total_amount,
    status,
    order_date
  )
  select
    '22222222-2222-2222-2222-222222222222',
    'Nguyen Van A',
    'customer@example.com',
    '0900000002',
    'Ha Noi, Viet Nam',
    'Seed order for dashboard and checkout testing',
    sm.method_id,
    pm.method_id,
    c.coupon_id,
    29900,
    299100,
    'Completed',
    now() - interval '1 hour'
  from shipping_methods sm
  join coupons c on c.code = 'WELCOME10'
  join payment_methods pm on pm.method_name = 'Chuyển khoản ngân hàng'
  where sm.method_name = 'Giao hàng tiêu chuẩn'
  returning order_id
)
insert into order_items (
  order_id,
  inventory_id,
  quantity,
  price_at_order
)
select
  so.order_id,
  inv.inventory_id,
  1,
  299000
from seed_order so
join product_inventory inv on inv.sku = 'VAR-TED-BLUE-M';

with seed_order as (
  select order_id
  from orders
  where user_id = '22222222-2222-2222-2222-222222222222'
  order by order_date desc
  limit 1
)
insert into payments (
  order_id,
  method_id,
  amount,
  status,
  payment_date,
  transaction_id,
  notes
)
select
  so.order_id,
  pm.method_id,
  299100,
  'Completed',
  now(),
  'TXN-SEED-0001',
  'Seed payment'
from seed_order so
join payment_methods pm on pm.method_name = 'Chuyển khoản ngân hàng';

commit;