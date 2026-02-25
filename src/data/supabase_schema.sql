-- TABLAS PARA VENDING APP EN SUPABASE

-- 1. Empresas
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Máquinas
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    model TEXT,
    price_per_cup INTEGER DEFAULT 15,
    company_id UUID REFERENCES companies(id),
    status TEXT DEFAULT 'active',
    last_reading INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Inventario
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    barcode TEXT UNIQUE,
    quantity INTEGER DEFAULT 0,
    company_id UUID REFERENCES companies(id),
    image TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Visitas / Historial
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    machine_id UUID REFERENCES machines(id),
    lectura_anterior INTEGER,
    lectura_actual INTEGER,
    tazas_vendidas INTEGER,
    total_sales DECIMAL(10,2),
    insumos JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 5. Usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'admin' CHECK(role IN ('admin', 'superadmin', 'operator')),
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas simples
CREATE POLICY "Allow all for anon" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON machines FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON inventory FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON visits FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true);

-- Datos de prueba (Opcional)
INSERT INTO companies (name) VALUES ('Vending Demo') ON CONFLICT DO NOTHING;
-- Nota: Para insertar un usuario vinculado, primero obtén el ID de la empresa.
