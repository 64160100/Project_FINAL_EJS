INSERT INTO `tbl_employees` (`employee_id`, `title`, `first_name`, `last_name`, `nickname`, `id_number`, `date_of_birth`, `phone_number`, `email`, `other`) VALUES ('BKB0001', 'นาย', 'สมพล', 'ดีใจ', 'เกม', '123456789012', '2014-06-07', '0987654321', '64160100@go.buu.ac.th', 'ID : admin');

INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES ('Manger', 'เมเนเจอร์', 'admin', '2024-06-20 15:58:23', NULL, NULL);

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_buying` (`permission_id`,  `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `tbl_user` (`tbl_employees`, `tbl_user_permission`, `username`, `password`, `profile_picture`, `status`) VALUES ('BKB0001', 'Manger', 'user', '1234', NULL, 'ON');


INSERT INTO `setting_type` (`id_type`) VALUES
('ผัก'),
('เครื่องดื่ม'),
('เครื่องปรุง'),
('เนื้อสด'),
('ไข่');

-- Dumping data for table `setting_unit`
INSERT INTO `setting_unit` (`id_unit`) VALUES
('กรัม'),
('ขวด'),
('ฟอง');

INSERT INTO `tbl_buying` (`id_buying_list`, `name_product`, `date_of_receipt`, `unit_quantity`, `price`, `day`, `hour`, `minute`, `second`, `setting_unit_id`, `setting_type_id`) VALUES
('J001', 'ผัก', '2024-10-01', 1000, '100', 0, 7, 11, 9, 'กรัม', 'ผัก'),
('J002', 'น้ำเปล่า', '2024-10-01', 1000, '100', 0, 7, 10, 47, 'ขวด', 'เครื่องดื่ม'),
('J003', 'เกลือ', '2024-10-01', 1000, '100', 0, 7, 10, 17, 'กรัม', 'เครื่องปรุง'),
('J004', 'ใบกระเพรา', '2024-10-01', 1000, '100', 0, 7, 9, 31, 'กรัม', 'ผัก'),
('J005', 'หมูสด', '2024-10-01', 1000, '100', 0, 7, 8, 45, 'กรัม', 'เนื้อสด'),
('J008', 'ไข่ไก่', '2024-10-04', 100, '100', 0, 0, 16, 46, 'ฟอง', 'ไข่'),
('J009', 'หมูชิ้น', '2024-10-04', 1000, '10', 0, 0, 12, 11, 'กรัม', 'เนื้อสด');

INSERT INTO `tbl_warehouse` (`tbl_id_warehouse`, `id_warehouse`, `tbl_buying_id`, `name_product`, `unit_quantity_all`, `unit_quantity_max`, `setting_unit_id`, `setting_type_id`) VALUES
(1, 'T001', 'J001', 'ผัก', '1000', 'null', 'กรัม', 'ผัก'),
(2, 'T002', 'J002', 'น้ำเปล่า', '1000', 'null', 'ขวด', 'เครื่องดื่ม'),
(3, 'T003', 'J003', 'เกลือ', '1000', 'null', 'กรัม', 'เครื่องปรุง'),
(4, 'T004', 'J004', 'ใบกระเพรา', '1000', 'null', 'กรัม', 'ผัก'),
(5, 'T005', 'J005', 'หมูสด', '1000', 'null', 'กรัม', 'เนื้อสด'),
(8, 'T007', 'J008', 'ไข่ไก่', '100', 'null', 'ฟอง', 'ไข่'),
(9, 'T006', 'J009', 'หมูชิ้น', '1000', 'null', 'กรัม', 'เนื้อสด');

INSERT INTO `tbl_zones` (`zone_name`, `lock_zone`) VALUES
('a', 'Y');

INSERT INTO `tbl_table` (`id_table`, `zone_name`) VALUES
('1', 'a'),
('2', 'a'),
('3', 'a'),
('4', 'a'),
('5', 'a');


INSERT INTO `menu_category` (`menu_category`) VALUES
('ผัด'),
('เครื่องดื่ม');

-- Dumping data for table `menu_type`
INSERT INTO `menu_type` (`menu_type`) VALUES
('น้ำ'),
('ราดข้าว');

-- Dumping data for table `menu_unit`
INSERT INTO `menu_unit` (`menu_unit`) VALUES
('ขวด'),
('จาน');

INSERT INTO `tbl_menu` (`name_product`, `id_menu`, `menu_picture`, `price`, `remain`, `status`, `menu_category`, `menu_unit`, `menu_type`) VALUES
('กระเพราหมู', 'R001', '1727818967469-Default_menu.png', '60', '7', 'ON', 'ผัด', 'ขวด', 'น้ำ'),
('น้ำเปล่า', 'R002', '1727818985831-download.jpg', '10', '1000', 'ON', 'เครื่องดื่ม', 'ขวด', 'น้ำ');

-- Dumping data for table `tbl_menu_options`
INSERT INTO `tbl_menu_options` (`id_menu_options`, `menu_id`, `name_options`, `price`, `name_ingredient_menu_options`, `unit_quantity_menu_options`, `unit_id_menu_options`) VALUES
(1, 'R001', 'เพิ่มหมู ไก่', '10', 'หมูสด', '10', 'กรัม'),
(2, 'R001', 'เพิ่มหมู ไก่', '10', 'ใบกระเพรา', '10', 'กรัม'),
(3, 'R001', 'ไข่ดาว', '10', 'ไข่ไก่', '1', 'ฟอง');

INSERT INTO `tbl_food_recipes` (`id_food_recipes`, `tbl_menu_id`, `name_ingredient`, `unit_quantity`, `unit_id`) VALUES
(4, 'R002', 'น้ำเปล่า', '1', 'ขวด'),
(9, 'R001', 'ใบกระเพรา', '10', 'กรัม'),
(10, 'R001', 'หมูสด', '10', 'กรัม'),
(11, 'R001', 'เกลือ', '10', 'กรัม'),
(12, 'R001', 'หมูชิ้น', '100', 'กรัม');


INSERT INTO `tbl_promotion` (`id_promotion`, `sum_promotion_id`, `name_promotion`, `price_discount`, `status_promotion`, `num_promotions`, `promo_code`, `start_date`, `last_day`) VALUES
('1', 'P001', 'ส่วนลด 50 บาท', '50', 'N', 5, 'H6IKLLUI', '2024-10-02', '2024-10-05'),
('2', 'P001', 'ส่วนลด 50 บาท', '50', 'N', 5, '67CM7CJT', '2024-10-02', '2024-10-05'),
('3', 'P001', 'ส่วนลด 50 บาท', '50', 'N', 5, 'NPPPX327', '2024-10-02', '2024-10-05'),
('4', 'P001', 'ส่วนลด 50 บาท', '50', 'N', 5, 'UBYJ5TGN', '2024-10-02', '2024-10-05'),
('5', 'P001', 'ส่วนลด 50 บาท', '50', 'N', 5, 'ODAX56GU', '2024-10-02', '2024-10-05');