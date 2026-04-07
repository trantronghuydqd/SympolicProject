# Storage Setup Guide

Project này đang dùng Supabase Storage để hiển thị banner, logo, avatar và ảnh sản phẩm. Nếu bạn muốn add ảnh đúng với seed bên trên, tạo các bucket sau:

1. `category-images` - ảnh danh mục.
2. `product-images` - ảnh sản phẩm.
3. `profiles` - avatar người dùng.
4. `symbolicv3` - banner/logo đang được frontend gọi sẵn.

## 1. Tạo bucket

Vào Supabase Dashboard -> Storage -> New bucket.

Tạo `category-images` với các thiết lập sau:

- Public: bật.
- File size limit: tùy bạn, khuyên 5-10 MB.
- Allowed mime types: `image/jpeg,image/png,image/webp,image/gif`.

Lặp lại tương tự cho `product-images`, `profiles` và `symbolicv3`.

## 2. Lưu ý về tên bucket

Code hiện tại đã được thống nhất về một bucket duy nhất là `product-images` cho ảnh sản phẩm.

Không cần tạo bucket `productimage` nữa.

Upload file vào bucket `category-images` theo các tên sau:

- `varsity.jpg`
- `hoodies.jpg`
- `jacket.jpg`
- `cardigans.jpg`
- `t-shirts-polo-shirts.jpg`

Upload file vào bucket `product-images` theo cấu trúc này:

- `products/varsity/ted-jacket-blue.jpg`
- `products/varsity/ted-jacket-gray.jpg`
- `products/hoodies/script-hoodie-black.jpg`
- `products/hoodies/script-hoodie-grey.jpg`
- `products/hoodies/signature-zipup-hoodie-black.jpg`
- `products/hoodies/signature-zipup-hoodie-grey.jpg`
- `products/jacket/windbreaker-gorpcore-jacket-black.jpg`
- `products/jacket/windbreaker-gorpcore-jacket-white.jpg`
- `products/jacket/sporty-jacket-black-grey.jpg`
- `products/jacket/sporty-jacket-white-red.jpg`
- `products/cardigans/schoolknit-cardigan-grey.jpg`
- `products/cardigans/schoolknit-cardigan-cream-white.jpg`
- `products/t-shirts-polo-shirts/bloke-tee-black.jpg`
- `products/t-shirts-polo-shirts/bloke-tee-white.jpg`
- `products/t-shirts-polo-shirts/cities-ball-tee-white.jpg`
- `products/t-shirts-polo-shirts/cities-ball-tee-light-blue.jpg`

## 4. Mapping ảnh với seed

Seed SQL đang trỏ thẳng tới public URL dạng:

`https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/product-images/...`

Nghĩa là sau khi upload file đúng tên đúng path, ảnh sẽ hiển thị ngay trong app.

## 5. Ảnh banner và logo

Frontend cũng đang dùng bucket `symbolicv3` cho banner/logo. Nếu bạn muốn thay ảnh mặc định, upload các file này vào bucket đó:

- `banner.jpg`
- `banner1.png`
- `banner2.png`
- `symbolic logo.png`

## 6. Avatar người dùng

Avatar upload đang dùng bucket `profiles`. Tạo bucket public để user profile có thể hiển thị ảnh công khai.

## 7. Trình tự chạy

1. Tạo bucket `product-images`, `profiles`, `symbolicv3`.
2. Upload ảnh theo đúng path ở trên.
3. Chạy file `supabase/schema.sql` trong SQL Editor của Supabase.
4. Chạy file `supabase/seed.sql` sau khi schema đã được tạo.
5. Nếu cần login manager/customer, tạo auth user tương ứng và cập nhật role trong bảng `profiles`.
