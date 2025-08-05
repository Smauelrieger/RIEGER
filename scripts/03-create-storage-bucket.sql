-- Script para criar o bucket 'property-images' e 'user-avatars' no Supabase Storage
-- e definir políticas de acesso.

-- Cria o bucket 'property-images' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Cria o bucket 'user-avatars' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Políticas para 'property-images'
-- Permite que qualquer pessoa faça upload de imagens
CREATE POLICY "Allow authenticated uploads to property-images"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- Permite que qualquer pessoa visualize imagens
CREATE POLICY "Allow public read access to property-images"
ON storage.objects FOR SELECT USING (bucket_id = 'property-images');

-- Permite que o proprietário do objeto o atualize
CREATE POLICY "Allow owner to update property-images"
ON storage.objects FOR UPDATE USING (bucket_id = 'property-images' AND auth.uid() = owner) WITH CHECK (bucket_id = 'property-images' AND auth.uid() = owner);

-- Permite que o proprietário do objeto o delete
CREATE POLICY "Allow owner to delete property-images"
ON storage.objects FOR DELETE USING (bucket_id = 'property-images' AND auth.uid() = owner);


-- Políticas para 'user-avatars'
-- Permite que qualquer pessoa faça upload de avatares
CREATE POLICY "Allow authenticated uploads to user-avatars"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

-- Permite que qualquer pessoa visualize avatares
CREATE POLICY "Allow public read access to user-avatars"
ON storage.objects FOR SELECT USING (bucket_id = 'user-avatars');

-- Permite que o proprietário do objeto o atualize
CREATE POLICY "Allow owner to update user-avatars"
ON storage.objects FOR UPDATE USING (bucket_id = 'user-avatars' AND auth.uid() = owner) WITH CHECK (bucket_id = 'user-avatars' AND auth.uid() = owner);

-- Permite que o proprietário do objeto o delete
CREATE POLICY "Allow owner to delete user-avatars"
ON storage.objects FOR DELETE USING (bucket_id = 'user-avatars' AND auth.uid() = owner);
