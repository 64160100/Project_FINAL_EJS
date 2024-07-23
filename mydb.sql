INSERT INTO `tbl_employees` (`employee_id`, `title`, `first_name`, `last_name`, `nickname`, `id_number`, `date_of_birth`, `phone_number`, `email`, `other`) VALUES ('BKB0001', 'นาย', 'สมพล', 'ดีใจ', 'เกม', '123456789012', '2014-06-07', '0987654321', '64160100@go.buu.ac.th', 'ID : admin');

INSERT INTO `tbl_user_permission` (`permission_id`, `permission_name`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES ('Manger', 'เมเนเจอร์', 'admin', '2024-06-20 15:58:23', NULL, NULL);

INSERT INTO `permission_dashboard` (`permission_id`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_employee` (`permission_id`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_menu` (`permission_id`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_buying` (`permission_id`,  `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_promotion` (`permission_id`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_table` (`permission_id`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_confirm`) VALUES ('Manger', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `tbl_user` (`tbl_employees`, `tbl_user_permission`, `username`, `password`, `profile_picture`, `status`) VALUES ('BKB0001', 'Manger', 'user', '1234', NULL, 'ON');

INSERT INTO `setting_type` (`id_type`) VALUES ('หมูสด');

INSERT INTO `setting_unit` (`id_unit`) VALUES ('กรัม');

INSERT INTO `manu_category` (`manu_category`) VALUES ('ผัด');

INSERT INTO `manu_type` (`manu_type`) VALUES ('ราดข้าว');

INSERT INTO `manu_unit` (`manu_unit`) VALUES ('จาน');
