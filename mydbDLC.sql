-- 1. พนักงานเสิร์ฟ (Waiter)
INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`) VALUES ('Waiter', 'พนักงานเสิร์ฟ', 'admin', NOW());

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_view`) VALUES ('Waiter', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_view`) VALUES ('Waiter', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_view`) VALUES ('Waiter', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_buying` (`permission_id`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_view`) VALUES ('Waiter', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_view`) VALUES ('Waiter', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_view`) VALUES ('Waiter', 'Y', 'Y', 'Y', 'N', 'Y');

-- 2. พ่อครัว (Chef)
INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`) VALUES ('Chef', 'พ่อครัว', 'admin', NOW());

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_view`) VALUES ('Chef', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_view`) VALUES ('Chef', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_view`) VALUES ('Chef', 'Y', 'Y', 'Y', 'N', 'Y');
INSERT INTO `permission_buying` (`permission_id`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_view`) VALUES ('Chef', 'Y', 'Y', 'Y', 'N', 'Y');
INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_view`) VALUES ('Chef', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_view`) VALUES ('Chef', 'Y', 'N', 'N', 'N', 'Y');

-- 3. แคชเชียร์ (Cashier)
INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`) VALUES ('Cashier', 'แคชเชียร์', 'admin', NOW());

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_view`) VALUES ('Cashier', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_view`) VALUES ('Cashier', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_view`) VALUES ('Cashier', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_buying` (`permission_id`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_view`) VALUES ('Cashier', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_view`) VALUES ('Cashier', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_view`) VALUES ('Cashier', 'Y', 'Y', 'Y', 'N', 'Y');

-- 4. ผู้จัดการสต็อก (Stock Manager)
INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`) VALUES ('StockManager', 'ผู้จัดการสต็อก', 'admin', NOW());

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_view`) VALUES ('StockManager', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_view`) VALUES ('StockManager', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_view`) VALUES ('StockManager', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_buying` (`permission_id`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_view`) VALUES ('StockManager', 'Y', 'Y', 'Y', 'Y', 'Y');
INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_view`) VALUES ('StockManager', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_view`) VALUES ('StockManager', 'N', 'N', 'N', 'N', 'N');

-- 5. ผู้จัดการการตลาด (Marketing Manager)
INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`) VALUES ('MarketingManager', 'ผู้จัดการการตลาด', 'admin', NOW());

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_view`) VALUES ('MarketingManager', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_view`) VALUES ('MarketingManager', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_view`) VALUES ('MarketingManager', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_buying` (`permission_id`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_view`) VALUES ('MarketingManager', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_view`) VALUES ('MarketingManager', 'Y', 'Y', 'Y', 'Y', 'Y');
INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_view`) VALUES ('MarketingManager', 'N', 'N', 'N', 'N', 'N');

-- 6. พนักงานทำความสะอาด (Cleaner)
INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`) VALUES ('Cleaner', 'พนักงานทำความสะอาด', 'admin', NOW());

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_view`) VALUES ('Cleaner', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_view`) VALUES ('Cleaner', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_view`) VALUES ('Cleaner', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_buying` (`permission_id`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_view`) VALUES ('Cleaner', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_view`) VALUES ('Cleaner', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_view`) VALUES ('Cleaner', 'Y', 'N', 'N', 'N', 'Y');

-- 7. ผู้จัดการทั่วไป (General Manager)
INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`) VALUES ('GeneralManager', 'ผู้จัดการทั่วไป', 'admin', NOW());

INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_view`) VALUES ('GeneralManager', 'Y', 'Y', 'Y', 'Y', 'Y');
INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_view`) VALUES ('GeneralManager', 'Y', 'Y', 'Y', 'Y', 'Y');
INSERT INTO `permission_buying` (`permission_id`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_view`) VALUES ('GeneralManager', 'Y', 'Y', 'Y', 'Y', 'Y');
INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_view`) VALUES ('GeneralManager', 'Y', 'Y', 'Y', 'Y', 'Y');
INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_view`) VALUES ('GeneralManager', 'Y', 'Y', 'Y', 'Y', 'Y');

-- 8. พนักงานต้อนรับ (Host/Hostess)
INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`) VALUES ('Host', 'พนักงานต้อนรับ', 'admin', NOW());

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_view`) VALUES ('Host', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_view`) VALUES ('Host', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_view`) VALUES ('Host', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_buying` (`permission_id`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_view`) VALUES ('Host', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_view`) VALUES ('Host', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_view`) VALUES ('Host', 'Y', 'Y', 'Y', 'N', 'Y');

-- 9. ผู้ช่วยเชฟ (Sous Chef)
INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`) VALUES ('SousChef', 'ผู้ช่วยเชฟ', 'admin', NOW());

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_view`) VALUES ('SousChef', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_view`) VALUES ('SousChef', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_view`) VALUES ('SousChef', 'Y', 'Y', 'Y', 'N', 'Y');
INSERT INTO `permission_buying` (`permission_id`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_view`) VALUES ('SousChef', 'Y', 'Y', 'N', 'N', 'Y');
INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_view`) VALUES ('SousChef', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_view`) VALUES ('SousChef', 'Y', 'N', 'N', 'N', 'Y');

-- 10. บาร์เทนเดอร์ (Bartender)
INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`) VALUES ('Bartender', 'บาร์เทนเดอร์', 'admin', NOW());

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_view`) VALUES ('Bartender', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_view`) VALUES ('Bartender', 'N', 'N', 'N', 'N', 'N');
INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_view`) VALUES ('Bartender', 'Y', 'Y', 'Y', 'N', 'Y');
INSERT INTO `permission_buying` (`permission_id`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_view`) VALUES ('Bartender', 'Y', 'Y', 'N', 'N', 'Y');
INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_view`) VALUES ('Bartender', 'Y', 'N', 'N', 'N', 'Y');
INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_view`) VALUES ('Bartender', 'Y', 'N', 'N', 'N', 'Y');


-- เพิ่มเติมของเมนูอาหาร --
INSERT INTO `tbl_menu` (`name_product`, `id_menu`, `menu_picture`, `price`, `remain`, `status`, `menu_category`, `menu_unit`, `menu_type`) VALUES
('ผัดไทย', 'R005', 'padthai.png', '70', '50', 'ON', 'ผัด', 'จาน', 'ราดข้าว'),
('ต้มยำกุ้ง', 'R006', 'tomyumkung.png', '90', '30', 'ON', 'ผัด', 'จาน', 'ราดข้าว'),
('ข้าวผัดหมู', 'R007', 'friedrice.png', '60', '40', 'ON', 'ผัด', 'จาน', 'ราดข้าว'),
('สปาเก็ตตี้คาโบนาร่า', 'R008', 'carbonara.png', '80', '25', 'ON', 'ผัด', 'จาน', 'ราดข้าว'),
('ส้มตำ', 'R009', 'somtum.png', '50', '60', 'ON', 'ผัด', 'จาน', 'ราดข้าว'),
('แกงเขียวหวานไก่', 'R010', 'greencurry.png', '70', '35', 'ON', 'ผัด', 'จาน', 'ราดข้าว'),
('ผัดซีอิ๊ว', 'R011', 'padseeew.png', '65', '45', 'ON', 'ผัด', 'จาน', 'ราดข้าว'),
('ลาเต้', 'R012', 'latte.png', '45', '100', 'ON', 'เครื่องดื่ม', 'ขวด', 'น้ำ'),
('ชาเขียวเย็น', 'R013', 'greentea.png', '40', '80', 'ON', 'เครื่องดื่ม', 'ขวด', 'น้ำ'),
('น้ำส้มคั้น', 'R014', 'orangejuice.png', '35', '70', 'ON', 'เครื่องดื่ม', 'ขวด', 'น้ำ');

-- เพิ่มเติมส่วนเสรืม --
-- เพิ่ม menu_category ให้ครบ 10
INSERT INTO `menu_category` (`menu_category`) VALUES
('ต้ม'),
('ทอด'),
('ย่าง'),
('นึ่ง'),
('แกง'),
('ของหวาน'),
('สลัด'),
('อาหารจานเดียว');
('อาหารทะเล'),
('อาหารฟิวชัน');

-- เพิ่ม menu_type ให้ครบ 10
INSERT INTO `menu_type` (`menu_type`) VALUES
('อาหารเช้า'),
('อาหารกลางวัน'),
('อาหารเย็น'),
('ของว่าง'),
('อาหารทานเล่น'),
('อาหารเพื่อสุขภาพ'),
('อาหารมังสวิรัติ'),
('บุฟเฟต์');
('อาหารเด็ก'),
('อาหารคลีน');

-- เพิ่ม menu_unit ให้ครบ 10
INSERT INTO `menu_unit` (`menu_unit`) VALUES
('ชาม'),
('ถ้วย'),
('ชิ้น'),
('กล่อง'),
('ชุด'),
('แก้ว'),
('ไม้'),
('ห่อ');
('เซต'),
('ถาด');

