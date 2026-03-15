-- Database schema for Multi-Tenant Inventory Control

-- 1. Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. Users table (Admins, Managers, Employees)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT CHECK (role IN ('admin','manager','employee')),
  created_at TIMESTAMP DEFAULT now()
);

-- 3. Employees table (for scanning badges)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  barcode TEXT,
  qr_code TEXT,
  unit TEXT,
  min_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- 5. Stock overview
CREATE TABLE stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, product_id)
);

-- 6. Stock movements (History)
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  movement_type TEXT CHECK (movement_type IN ('IN','OUT','ADJUSTMENT')),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_stock_tenant_product ON stock(tenant_id, product_id);
CREATE INDEX idx_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX idx_movements_product ON stock_movements(product_id);
