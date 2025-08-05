-- Script para adicionar colunas de perfil de usuário na tabela users

DO $$
BEGIN
    -- Adicionar coluna photo_url se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'photo_url') THEN
        ALTER TABLE users ADD COLUMN photo_url TEXT;
    END IF;

    -- Adicionar coluna phone se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone TEXT;
    END IF;

    -- Adicionar coluna creci se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'creci') THEN
        ALTER TABLE users ADD COLUMN creci TEXT;
    END IF;
END $$;
