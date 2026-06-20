-- Michelin POS Database Schema
-- Run this in Supabase SQL Editor

-- Create Menu Table
CREATE TABLE IF NOT EXISTS menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'unavailable')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  items_json JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_received NUMERIC(10, 2) NOT NULL,
  change NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu(category);
CREATE INDEX IF NOT EXISTS idx_menu_status ON menu(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access on menu" ON menu
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on menu" ON menu
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on menu" ON menu
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on menu" ON menu
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access on orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Insert Sample Menu Data
INSERT INTO menu (name, price, category, status) VALUES
  -- อาหารไทย
  ('ต้มข่าไก่', 280, 'อาหารไทย', 'available'),
  ('แกงเขียวหวานปลากราย', 320, 'อาหารไทย', 'available'),
  ('ผัดไทยกุ้งสด', 250, 'อาหารไทย', 'available'),
  ('มัสมั่นเนื้อ', 350, 'อาหารไทย', 'available'),
  ('ยำวุ้นเส้นทะเล', 220, 'อาหารไทย', 'available'),
  ('ปลากะพงทอดน้ำปลา', 380, 'อาหารไทย', 'available'),
  
  -- ของหวาน
  ('ข้าวเหนียวมะม่วง', 180, 'ของหวาน', 'available'),
  ('บัวลอยน้ำขิง', 120, 'ของหวาน', 'available'),
  ('ทับทิมกรอบ', 100, 'ของหวาน', 'available'),
  ('สังขยาใบเตย', 90, 'ของหวาน', 'available'),
  ('ขนมปังไอศกรีม', 150, 'ของหวาน', 'available'),
  
  -- กาแฟร้อน
  ('เอสเพรสโซ่', 95, 'กาแฟร้อน', 'available'),
  ('คาปูชิโน่', 120, 'กาแฟร้อน', 'available'),
  ('ลาเต้', 110, 'กาแฟร้อน', 'available'),
  ('อเมริกาโน่', 85, 'กาแฟร้อน', 'available'),
  
  -- กาแฟเย็น
  ('คาปูชิโน่เย็น', 135, 'กาแฟเย็น', 'available'),
  ('ลาเต้เย็น', 125, 'กาแฟเย็น', 'available'),
  ('เอสเพรสโซ่เย็น', 110, 'กาแฟเย็น', 'available'),
  ('มัทฉะลาเต้เย็น', 155, 'กาแฟเย็น', 'available')
ON CONFLICT DO NOTHING;
