-- 003: Storage Setup
-- Private bucket for why card images

INSERT INTO storage.buckets (id, name, public)
VALUES ('why-images', 'why-images', FALSE);

-- Users can upload images to their own folder
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'why-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own images
CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'why-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'why-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );