-- Script para adicionar a coluna is_featured na tabela properties

DO $$
BEGIN
    -- Adicionar coluna is_featured se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'is_featured') THEN
        ALTER TABLE properties ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
        UPDATE properties SET is_featured = FALSE WHERE is_featured IS NULL;
    END IF;

    -- Criar índice para is_featured se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_is_featured') THEN
        CREATE INDEX idx_properties_is_featured ON properties(is_featured);
    END IF;

END $$;

-- Atualizar todos os imóveis existentes para não serem destacados por padrão
UPDATE properties SET is_featured = FALSE WHERE is_featured IS NULL;
