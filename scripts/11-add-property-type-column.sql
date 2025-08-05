CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    price NUMERIC,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area TEXT,
    garage_spaces INTEGER,
    type TEXT, -- Nova coluna para tipo de imóvel (Casa, Apartamento, etc.)
    purpose TEXT, -- 'Venda', 'Aluguel', 'Temporada'
    status TEXT, -- 'Disponível', 'Vendido', 'Alugado', 'Reservado'
    images TEXT[],
    daily_rate NUMERIC, -- For 'Temporada' properties
    max_guests INTEGER, -- For 'Temporada' properties
    check_in_time TEXT, -- For 'Temporada' properties (e.g., "14:00")
    check_out_time TEXT, -- For 'Temporada' properties (e.g., "11:00")
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    owner_id UUID REFERENCES owners(id),
    main_image_index INTEGER DEFAULT 0,
    financing_accepted TEXT,
    fgts_accepted TEXT,
    exchange_accepted TEXT,
    documentation_status TEXT,
    rental_deposit NUMERIC,
    rental_guarantee TEXT,
    pets_allowed TEXT,
    furnished TEXT,
    minimum_rental_period INTEGER,
    iptu_included TEXT,
    minimum_stay INTEGER,
    cleaning_fee NUMERIC,
    wifi_available TEXT,
    pool_available TEXT
);

-- Adiciona a coluna 'type' se ela ainda não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='type') THEN
        ALTER TABLE properties ADD COLUMN type TEXT;
    END IF;
END$$;
