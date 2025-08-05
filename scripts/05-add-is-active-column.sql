-- Adicionar coluna is_active na tabela properties se não existir
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Adicionar coluna main_image_index na tabela properties se não existir  
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS main_image_index INTEGER DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN properties.is_active IS 'Define se o imóvel está ativo e visível no site';
COMMENT ON COLUMN properties.main_image_index IS 'Índice da imagem principal no array de imagens';

-- Atualizar imóveis existentes para ficarem ativos por padrão
UPDATE properties 
SET is_active = true 
WHERE is_active IS NULL;
