-- Update image_url for menu items
-- Run this in Supabase SQL Editor

-- อาหารไทย
UPDATE menu SET image_url = '/food/ต้มข่าไก่.jpg' WHERE name = 'ต้มข่าไก่';
UPDATE menu SET image_url = '/food/แกงเขียวหวาน.jpg' WHERE name = 'แกงเขียวหวานปลากราย';
UPDATE menu SET image_url = '/food/ผัดไทยกุ้งสด.jpg' WHERE name = 'ผัดไทยกุ้งสด';
UPDATE menu SET image_url = '/food/มัสมั่นเนื้อ.jpg' WHERE name = 'มัสมั่นเนื้อ';
UPDATE menu SET image_url = '/food/ยำวุ้นเส้นทะเล.jpg' WHERE name = 'ยำวุ้นเส้นทะเล';
UPDATE menu SET image_url = '/food/กะพงราดน้ำปลา.jpg' WHERE name = 'ปลากะพงทอดน้ำปลา';

-- ของหวาน
UPDATE menu SET image_url = '/food/ข้าวเหนียวมะม่วง.jpg' WHERE name = 'ข้าวเหนียวมะม่วง';
UPDATE menu SET image_url = '/food/บัวลอยน้ำขิง.jpg' WHERE name = 'บัวลอยน้ำขิง';
UPDATE menu SET image_url = '/food/ทับทิมกรอบ.jpg' WHERE name = 'ทับทิมกรอบ';
UPDATE menu SET image_url = '/food/สังขยาใบเตย.jpg' WHERE name = 'สังขยาใบเตย';
UPDATE menu SET image_url = '/food/ขนมปังไอศกรีม.jpg' WHERE name = 'ขนมปังไอศกรีม';

-- กาแฟร้อน
UPDATE menu SET image_url = '/food/เอสเพรสโซ่ร้อน.jpg' WHERE name = 'เอสเพรสโซ่';
UPDATE menu SET image_url = '/food/คาปูชิโน่ร้อน.jpg' WHERE name = 'คาปูชิโน่';
UPDATE menu SET image_url = '/food/ลาเต้ร้อน.jpg' WHERE name = 'ลาเต้';
UPDATE menu SET image_url = '/food/อเมริกาโน่ร้อน.jpg' WHERE name = 'อเมริกาโน่';

-- กาแฟเย็น
UPDATE menu SET image_url = '/food/คาปูชิโน่เย็น.jpg' WHERE name = 'คาปูชิโน่เย็น';
UPDATE menu SET image_url = '/food/ลาเต้เย็น.jpg' WHERE name = 'ลาเต้เย็น';
UPDATE menu SET image_url = '/food/เอสเพรสโซ่เย็น.jpg' WHERE name = 'เอสเพรสโซ่เย็น';
UPDATE menu SET image_url = '/food/มัทฉะลาเต้เย็น.jpg' WHERE name = 'มัทฉะลาเต้เย็น';
