-- Adicionar colunas específicas para cada finalidade na tabela properties

-- Campos para Venda
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS financing_accepted TEXT CHECK (financing_accepted IN ('sim', 'nao')),
ADD COLUMN IF NOT EXISTS fgts_accepted TEXT CHECK (fgts_accepted IN ('sim', 'nao')),
ADD COLUMN IF NOT EXISTS exchange_accepted TEXT CHECK (exchange_accepted IN ('sim', 'nao')),
ADD COLUMN IF NOT EXISTS documentation_status TEXT CHECK (documentation_status IN ('regular', 'pendente', 'irregular'));

-- Campos para Locação
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS rental_deposit DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS rental_guarantee TEXT CHECK (rental_guarantee IN ('fiador', 'seguro', 'deposito', 'titulo')),
ADD COLUMN IF NOT EXISTS pets_allowed TEXT CHECK (pets_allowed IN ('sim', 'nao', 'negociar')),
ADD COLUMN IF NOT EXISTS furnished TEXT CHECK (furnished IN ('sim', 'nao', 'semi')),
ADD COLUMN IF NOT EXISTS minimum_rental_period INTEGER,
ADD COLUMN IF NOT EXISTS iptu_included TEXT CHECK (iptu_included IN ('sim', 'nao'));

-- Campos para Temporada
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weekly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS monthly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS max_guests INTEGER,
ADD COLUMN IF NOT EXISTS minimum_stay INTEGER,
ADD COLUMN IF NOT EXISTS cleaning_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS check_in_time TIME,
ADD COLUMN IF NOT EXISTS check_out_time TIME,
ADD COLUMN IF NOT EXISTS wifi_available TEXT CHECK (wifi_available IN ('sim', 'nao')),
ADD COLUMN IF NOT EXISTS pool_available TEXT CHECK (pool_available IN ('sim', 'nao'));

-- Comentários para documentação
COMMENT ON COLUMN properties.financing_accepted IS 'Se aceita financiamento bancário';
COMMENT ON COLUMN properties.fgts_accepted IS 'Se aceita FGTS como parte do pagamento';
COMMENT ON COLUMN properties.exchange_accepted IS 'Se aceita permuta por outro imóvel';
COMMENT ON COLUMN properties.documentation_status IS 'Status da documentação do imóvel';

COMMENT ON COLUMN properties.rental_deposit IS 'Valor do depósito para locação';
COMMENT ON COLUMN properties.rental_guarantee IS 'Tipo de garantia exigida para locação';
COMMENT ON COLUMN properties.pets_allowed IS 'Se permite animais de estimação';
COMMENT ON COLUMN properties.furnished IS 'Se o imóvel é mobiliado';
COMMENT ON COLUMN properties.minimum_rental_period IS 'Período mínimo de locação em meses';
COMMENT ON COLUMN properties.iptu_included IS 'Se o IPTU está incluso no valor do aluguel';

COMMENT ON COLUMN properties.daily_rate IS 'Valor da diária para temporada';
COMMENT ON COLUMN properties.weekly_rate IS 'Valor semanal para temporada';
COMMENT ON COLUMN properties.monthly_rate IS 'Valor mensal para temporada';
COMMENT ON COLUMN properties.max_guests IS 'Número máximo de hóspedes';
COMMENT ON COLUMN properties.minimum_stay IS 'Estadia mínima em dias';
COMMENT ON COLUMN properties.cleaning_fee IS 'Taxa de limpeza';
COMMENT ON COLUMN properties.check_in_time IS 'Horário de check-in';
COMMENT ON COLUMN properties.check_out_time IS 'Horário de check-out';
COMMENT ON COLUMN properties.wifi_available IS 'Se tem Wi-Fi disponível';
COMMENT ON COLUMN properties.pool_available IS 'Se tem piscina disponível';
