-- Script para adicionar colunas que podem estar faltando na tabela properties

DO $$ 
BEGIN
    -- Adicionar coluna purpose se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'purpose') THEN
        ALTER TABLE properties ADD COLUMN purpose VARCHAR(20) CHECK (purpose IN ('Venda', 'Locação', 'Temporada')) DEFAULT 'Venda';
        UPDATE properties SET purpose = 'Venda' WHERE purpose IS NULL;
    END IF;
    
    -- Adicionar coluna main_image_index se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'main_image_index') THEN
        ALTER TABLE properties ADD COLUMN main_image_index INTEGER DEFAULT 0;
        UPDATE properties SET main_image_index = 0 WHERE main_image_index IS NULL;
    END IF;
    
    -- Adicionar coluna image_urls se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'image_urls') THEN
        ALTER TABLE properties ADD COLUMN image_urls TEXT[] DEFAULT '{}';
        UPDATE properties SET image_urls = '{}' WHERE image_urls IS NULL;
    END IF;
    
    -- Adicionar coluna is_active se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'is_active') THEN
        ALTER TABLE properties ADD COLUMN is_active BOOLEAN DEFAULT true;
        UPDATE properties SET is_active = true WHERE is_active IS NULL;
    END IF;
    
    -- Criar índice para is_active se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_is_active') THEN
        CREATE INDEX idx_properties_is_active ON properties(is_active);
    END IF;
    
END $$;

-- Atualizar todos os imóveis existentes para ficarem ativos por padrão
UPDATE properties SET is_active = true WHERE is_active IS NULL;
