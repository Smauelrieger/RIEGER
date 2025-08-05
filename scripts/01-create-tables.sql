-- Criação das tabelas principais do CRM Imobiliário

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'corretor', 'gerente', 'assistente')) NOT NULL DEFAULT 'corretor',
    status VARCHAR(20) CHECK (status IN ('ativo', 'inativo', 'suspenso')) NOT NULL DEFAULT 'ativo',
    permissions TEXT[] DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de proprietários
CREATE TABLE IF NOT EXISTS owners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    cpf VARCHAR(14),
    address TEXT,
    bank_account TEXT,
    profession VARCHAR(100),
    marital_status VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imóveis
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('Casa', 'Apartamento', 'Cobertura', 'Terreno', 'Comercial')) NOT NULL,
    purpose VARCHAR(20) CHECK (purpose IN ('Venda', 'Locação', 'Temporada')) NOT NULL DEFAULT 'Venda',
    price DECIMAL(15,2) NOT NULL,
    area VARCHAR(20),
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    garage_spaces INTEGER DEFAULT 0,
    address TEXT NOT NULL,
    owner_id UUID REFERENCES owners(id),
    status VARCHAR(20) CHECK (status IN ('Disponível', 'Vendido', 'Alugado', 'Reservado')) NOT NULL DEFAULT 'Disponível',
    description TEXT,
    private_comment TEXT,
    image_urls TEXT[] DEFAULT '{}',
    main_image_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas se não existirem (para casos de atualização)
DO $$ 
BEGIN
    -- Adicionar coluna purpose se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'purpose') THEN
        ALTER TABLE properties ADD COLUMN purpose VARCHAR(20) CHECK (purpose IN ('Venda', 'Locação', 'Temporada')) DEFAULT 'Venda';
    END IF;
    
    -- Adicionar coluna main_image_index se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'main_image_index') THEN
        ALTER TABLE properties ADD COLUMN main_image_index INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna image_urls se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'image_urls') THEN
        ALTER TABLE properties ADD COLUMN image_urls TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('Comprador', 'Vendedor', 'Locatário', 'Locador')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Ativo', 'Inativo', 'Prospect')) NOT NULL DEFAULT 'Prospect',
    budget VARCHAR(50),
    notes TEXT,
    last_contact TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id),
    property_name VARCHAR(200) NOT NULL,
    client_name VARCHAR(100),
    agent_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    commission DECIMAL(15,2),
    commission_installments INTEGER DEFAULT 1,
    status VARCHAR(20) CHECK (status IN ('Em Andamento', 'Concluída', 'Cancelada')) NOT NULL DEFAULT 'Em Andamento',
    type VARCHAR(20) CHECK (type IN ('Venda', 'Aluguel', 'Permuta')) NOT NULL DEFAULT 'Venda',
    semester VARCHAR(10),
    observations TEXT,
    partnership BOOLEAN DEFAULT FALSE,
    vgv DECIMAL(15,2),
    sale_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cronograma de recebimentos
CREATE TABLE IF NOT EXISTS payment_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('Pendente', 'Recebido', 'Atrasado', 'Cancelado')) NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cronograma de comissões
CREATE TABLE IF NOT EXISTS commission_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('Pendente', 'Recebido', 'Atrasado', 'Cancelado')) NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos do calendário
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(30) CHECK (type IN (
        'reuniao_construtora', 
        'conta_pagar', 
        'conta_fixa', 
        'visita_cliente', 
        'reuniao_interna', 
        'vencimento_contrato',
        'recebimento_venda',
        'recebimento_comissao'
    )) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(200),
    description TEXT,
    participants TEXT[] DEFAULT '{}',
    amount DECIMAL(15,2),
    property_name VARCHAR(200),
    client_name VARCHAR(100),
    recipient VARCHAR(100),
    sale_id UUID REFERENCES sales(id),
    payment_schedule_id UUID REFERENCES payment_schedule(id),
    commission_schedule_id UUID REFERENCES commission_schedule(id),
    status VARCHAR(20) CHECK (status IN ('agendado', 'pendente', 'concluido', 'cancelado')) NOT NULL DEFAULT 'agendado',
    priority VARCHAR(10) CHECK (priority IN ('alta', 'media', 'baixa')) NOT NULL DEFAULT 'media',
    recurring BOOLEAN DEFAULT FALSE,
    recurring_day INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de escala de plantão
CREATE TABLE IF NOT EXISTS duty_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    duty_date DATE NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    reason VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_payment_schedule_date ON payment_schedule(payment_date);
CREATE INDEX IF NOT EXISTS idx_commission_schedule_date ON commission_schedule(payment_date);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_schedule_updated_at BEFORE UPDATE ON payment_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commission_schedule_updated_at BEFORE UPDATE ON commission_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
