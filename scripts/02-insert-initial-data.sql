-- Inserção de dados iniciais para o CRM

-- Inserir usuários iniciais
INSERT INTO users (username, name, email, role, status, permissions) VALUES
('admin', 'Administrador', 'admin@rieger.com', 'admin', 'ativo', ARRAY['all']),
('samuel', 'Samuel Lindo', 'samuel@rieger.com', 'gerente', 'ativo', ARRAY['users', 'properties', 'sales', 'reports']),
('corretor1', 'João Silva', 'joao@rieger.com', 'corretor', 'ativo', ARRAY['properties', 'clients', 'sales']),
('corretor2', 'Maria Santos', 'maria@rieger.com', 'corretor', 'ativo', ARRAY['properties', 'clients', 'sales']),
('assistente1', 'Ana Costa', 'ana@rieger.com', 'assistente', 'ativo', ARRAY['clients', 'calendar'])
ON CONFLICT (username) DO NOTHING;

-- Inserir proprietários de exemplo
INSERT INTO owners (name, email, phone, cpf, address, profession, marital_status) VALUES
('Carlos Eduardo Silva', 'carlos.silva@email.com', '(11) 99999-1111', '123.456.789-01', 'Rua das Flores, 123 - Alphaville', 'Empresário', 'Casado'),
('Marina Oliveira Santos', 'marina.santos@email.com', '(11) 99999-2222', '987.654.321-02', 'Av. Paulista, 456 - São Paulo', 'Médica', 'Solteira'),
('Roberto Ferreira Lima', 'roberto.lima@email.com', '(11) 99999-3333', '456.789.123-03', 'Rua do Comércio, 789 - Centro', 'Advogado', 'Casado'),
('Fernanda Costa Alves', 'fernanda.alves@email.com', '(11) 99999-4444', '321.654.987-04', 'Alameda dos Anjos, 321 - Morumbi', 'Arquiteta', 'Divorciada'),
('José Antonio Pereira', 'jose.pereira@email.com', '(11) 99999-5555', '654.321.987-05', 'Rua da Praia, 654 - Santos', 'Aposentado', 'Viúvo')
ON CONFLICT DO NOTHING;

-- Inserir imóveis de exemplo com diferentes finalidades
INSERT INTO properties (title, type, purpose, price, area, bedrooms, bathrooms, garage_spaces, address, owner_id, status, description, private_comment, main_image_index) 
SELECT 
    'Casa Moderna em Alphaville',
    'Casa',
    'Venda',
    850000.00,
    '250m²',
    4,
    3,
    2,
    'Alphaville Residencial 1, Barueri - SP',
    o.id,
    'Disponível',
    'Casa moderna com acabamento de primeira, piscina, churrasqueira e jardim. Condomínio fechado com segurança 24h.',
    'Proprietário muito exigente com horários de visita. Preferência por manhãs.',
    0
FROM owners o WHERE o.name = 'Carlos Eduardo Silva'
UNION ALL
SELECT 
    'Apartamento Luxo na Paulista',
    'Apartamento',
    'Venda',
    1200000.00,
    '120m²',
    3,
    2,
    1,
    'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    o.id,
    'Disponível',
    'Apartamento de alto padrão com vista panorâmica da cidade. Andar alto, varanda gourmet.',
    'Proprietária aceita negociar o preço. Imóvel vazio, pode visitar a qualquer hora.',
    0
FROM owners o WHERE o.name = 'Marina Oliveira Santos'
UNION ALL
SELECT 
    'Apartamento para Locação Centro',
    'Apartamento',
    'Locação',
    3500.00,
    '80m²',
    2,
    1,
    1,
    'Rua do Comércio, 500 - Centro, São Paulo - SP',
    o.id,
    'Disponível',
    'Apartamento mobiliado no centro da cidade, próximo ao metrô e comércio.',
    'Proprietário prefere inquilinos sem pets. Aceita contrato de 12 meses.',
    0
FROM owners o WHERE o.name = 'Roberto Ferreira Lima'
UNION ALL
SELECT 
    'Casa de Praia para Temporada',
    'Casa',
    'Temporada',
    2800.00,
    '180m²',
    3,
    2,
    2,
    'Rua da Praia, 200 - Gonzaga, Santos - SP',
    o.id,
    'Disponível',
    'Casa a 2 quadras da praia, quintal com churrasqueira, ideal para temporada.',
    'Disponível para temporada de dezembro a março. Mínimo 7 dias.',
    0
FROM owners o WHERE o.name = 'José Antonio Pereira'
UNION ALL
SELECT 
    'Cobertura Morumbi',
    'Cobertura',
    'Venda',
    2500000.00,
    '300m²',
    4,
    4,
    3,
    'Alameda dos Anjos, 100 - Morumbi, São Paulo - SP',
    o.id,
    'Reservado',
    'Cobertura duplex com terraço, piscina privativa, sauna e vista deslumbrante.',
    'Cliente já fez proposta. Aguardando aprovação do financiamento.',
    0
FROM owners o WHERE o.name = 'Fernanda Costa Alves'
UNION ALL
SELECT 
    'Apartamento Locação Vila Madalena',
    'Apartamento',
    'Locação',
    4200.00,
    '95m²',
    2,
    2,
    1,
    'Rua Harmonia, 456 - Vila Madalena, São Paulo - SP',
    o.id,
    'Alugado',
    'Apartamento moderno em prédio novo, varanda, área de lazer completa.',
    'Inquilino atual pontual. Contrato vence em junho de 2025.',
    0
FROM owners o WHERE o.name = 'Marina Oliveira Santos'
UNION ALL
SELECT 
    'Casa Temporada Praia Grande',
    'Casa',
    'Temporada',
    1800.00,
    '120m²',
    2,
    1,
    1,
    'Av. Beira Mar, 789 - Praia Grande, SP',
    o.id,
    'Disponível',
    'Casa simples a 50m da praia, ideal para famílias pequenas.',
    'Proprietário mora no local fora da temporada. Coordenar visitas.',
    0
FROM owners o WHERE o.name = 'Carlos Eduardo Silva';

-- Inserir clientes de exemplo
INSERT INTO clients (name, email, phone, type, status, budget, notes, last_contact) VALUES
('Pedro Henrique Souza', 'pedro.souza@email.com', '(11) 98888-1111', 'Comprador', 'Ativo', 'R$ 800.000 - R$ 1.000.000', 'Procura casa em condomínio fechado, 3-4 quartos', NOW() - INTERVAL '2 days'),
('Luciana Martins', 'luciana.martins@email.com', '(11) 98888-2222', 'Comprador', 'Ativo', 'R$ 1.200.000 - R$ 1.500.000', 'Quer apartamento na Paulista ou Vila Olímpia', NOW() - INTERVAL '1 day'),
('Ricardo Gomes', 'ricardo.gomes@email.com', '(11) 98888-3333', 'Locatário', 'Prospect', 'R$ 3.000 - R$ 5.000/mês', 'Procura apartamento para alugar, 2 quartos', NOW() - INTERVAL '5 days'),
('Camila Rodrigues', 'camila.rodrigues@email.com', '(11) 98888-4444', 'Vendedor', 'Ativo', 'Apartamento R$ 900.000', 'Quer vender apartamento herdado', NOW() - INTERVAL '3 days'),
('Bruno Almeida', 'bruno.almeida@email.com', '(11) 98888-5555', 'Locatário', 'Ativo', 'R$ 2.000 - R$ 3.000/mês', 'Procura casa para temporada de verão', NOW() - INTERVAL '1 day');

-- Inserir vendas de exemplo
INSERT INTO sales (property_name, client_name, agent_name, value, commission, commission_installments, status, type, semester, observations, partnership, vgv, sale_date) VALUES
('Casa Moderna em Alphaville', 'Pedro Henrique Souza', 'João Silva', 850000.00, 25500.00, 3, 'Concluída', 'Venda', '2024-2', 'Venda realizada com sucesso. Cliente muito satisfeito.', false, 850000.00, '2024-11-15'),
('Apartamento Luxo na Paulista', 'Luciana Martins', 'Maria Santos', 1200000.00, 36000.00, 2, 'Em Andamento', 'Venda', '2024-2', 'Aguardando aprovação do financiamento bancário.', false, 1200000.00, '2024-12-01'),
('Apartamento Locação Vila Madalena', 'Ricardo Gomes', 'João Silva', 4200.00, 420.00, 1, 'Concluída', 'Aluguel', '2024-2', 'Contrato de aluguel assinado por 12 meses.', false, 50400.00, '2024-10-20'),
('Casa de Praia para Temporada', 'Bruno Almeida', 'Maria Santos', 1800.00, 180.00, 1, 'Concluída', 'Aluguel', '2024-2', 'Aluguel para temporada de dezembro.', false, 5400.00, '2024-12-10');

-- Inserir cronograma de recebimentos
INSERT INTO payment_schedule (sale_id, payment_date, amount, description, status)
SELECT 
    s.id,
    '2024-11-15',
    850000.00,
    'Pagamento integral - Casa Moderna em Alphaville',
    'Recebido'
FROM sales s WHERE s.property_name = 'Casa Moderna em Alphaville'
UNION ALL
SELECT 
    s.id,
    '2024-12-15',
    600000.00,
    'Entrada - Apartamento Luxo na Paulista',
    'Pendente'
FROM sales s WHERE s.property_name = 'Apartamento Luxo na Paulista'
UNION ALL
SELECT 
    s.id,
    '2025-01-15',
    600000.00,
    'Financiamento - Apartamento Luxo na Paulista',
    'Pendente'
FROM sales s WHERE s.property_name = 'Apartamento Luxo na Paulista';

-- Inserir cronograma de comissões
INSERT INTO commission_schedule (sale_id, payment_date, amount, description, status)
SELECT 
    s.id,
    '2024-11-20',
    8500.00,
    '1ª parcela comissão - Casa Moderna em Alphaville',
    'Recebido'
FROM sales s WHERE s.property_name = 'Casa Moderna em Alphaville'
UNION ALL
SELECT 
    s.id,
    '2024-12-20',
    8500.00,
    '2ª parcela comissão - Casa Moderna em Alphaville',
    'Recebido'
FROM sales s WHERE s.property_name = 'Casa Moderna em Alphaville'
UNION ALL
SELECT 
    s.id,
    '2025-01-20',
    8500.00,
    '3ª parcela comissão - Casa Moderna em Alphaville',
    'Pendente'
FROM sales s WHERE s.property_name = 'Casa Moderna em Alphaville';

-- Inserir eventos do calendário
INSERT INTO calendar_events (title, type, event_date, event_time, location, description, participants, amount, client_name, status, priority) VALUES
('Reunião Construtora ABC', 'reuniao_construtora', '2024-12-20', '14:00', 'Escritório Construtora ABC', 'Apresentação de novos lançamentos', ARRAY['João Silva', 'Maria Santos'], NULL, NULL, 'agendado', 'alta'),
('Visita - Pedro Souza', 'visita_cliente', '2024-12-18', '10:00', 'Casa Alphaville', 'Visita agendada para conhecer o imóvel', ARRAY['João Silva'], NULL, 'Pedro Henrique Souza', 'agendado', 'media'),
('Pagamento Aluguel Escritório', 'conta_fixa', '2024-12-25', '09:00', 'Banco', 'Pagamento mensal do aluguel do escritório', ARRAY['Administrador'], 8500.00, NULL, 'pendente', 'alta'),
('Reunião Equipe', 'reuniao_interna', '2024-12-19', '16:00', 'Escritório Rieger', 'Reunião semanal da equipe de vendas', ARRAY['João Silva', 'Maria Santos', 'Samuel Lindo'], NULL, NULL, 'agendado', 'media');

-- Inserir escala de plantão
INSERT INTO duty_schedule (duty_date, employee_name, reason) VALUES
('2024-12-21', 'João Silva', 'Plantão final de semana'),
('2024-12-22', 'Maria Santos', 'Plantão final de semana'),
('2024-12-28', 'João Silva', 'Plantão feriado'),
('2024-12-29', 'Maria Santos', 'Plantão feriado');
