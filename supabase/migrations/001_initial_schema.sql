-- ============================================================
-- StockFlow - Initial Schema
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  sku          text NOT NULL UNIQUE,
  barcode      text UNIQUE,
  description  text,
  quantity     integer NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 5,
  category_id  uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Stock Movements
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('IN', 'OUT')),
  quantity   integer NOT NULL CHECK (quantity > 0),
  notes      text,
  user_id    uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Auto-update updated_at on products
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Auto-update products.quantity on new stock movement
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_stock_movement()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.type = 'IN' THEN
    UPDATE public.products SET quantity = quantity + NEW.quantity WHERE id = NEW.product_id;
  ELSIF NEW.type = 'OUT' THEN
    UPDATE public.products SET quantity = quantity - NEW.quantity WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER stock_movement_apply
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.apply_stock_movement();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write everything
CREATE POLICY "auth_all" ON public.categories      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON public.products        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON public.stock_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- Seed: default categories
-- ============================================================
INSERT INTO public.categories (name) VALUES
  ('Electronics'),
  ('Peripherals'),
  ('Furniture'),
  ('Office Supplies'),
  ('Other')
ON CONFLICT (name) DO NOTHING;
