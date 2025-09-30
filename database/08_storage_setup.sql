-- ============================================
-- STORAGE SETUP FOR IMAGE UPLOADS
-- ============================================
-- This creates the storage bucket and policies for product image uploads

-- 1. CREATE STORAGE BUCKET
-- ============================================
-- Note: Run this in Supabase Dashboard → Storage → Create Bucket
-- Bucket name: product-images
-- Public: Yes (so images can be viewed publicly)

-- 2. CREATE STORAGE POLICIES
-- ============================================

-- Allow public read access to all images
CREATE POLICY "Public read access for product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads to product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update images
CREATE POLICY "Allow authenticated updates to product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated deletes from product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- 3. ALTERNATIVE: ALLOW ANONYMOUS UPLOADS (if needed)
-- ============================================
-- If you need to allow anonymous users to upload (for simplicity):

-- Allow anonymous uploads
CREATE POLICY "Allow anonymous uploads to product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Allow anonymous updates
CREATE POLICY "Allow anonymous updates to product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

-- Allow anonymous deletes
CREATE POLICY "Allow anonymous deletes from product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');

-- ============================================
-- SETUP INSTRUCTIONS
-- ============================================
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a new bucket named "product-images"
-- 3. Set it to "Public" so images can be viewed
-- 4. Run this SQL in the SQL Editor
-- 5. Your image upload functionality should now work!

-- ============================================
-- TESTING
-- ============================================
-- After setup, test by:
-- 1. Going to Admin Dashboard
-- 2. Adding a new product with images
-- 3. Check that images upload and display correctly