INSERT INTO `tbl_employees` (`employee_id`, `title`, `first_name`, `last_name`, `nickname`, `id_number`, `date_of_birth`, `phone_number`, `email`, `other`) VALUES ('BKB0001', 'Man', 'สมพล', 'ดีใจ', 'เกม', '123456789012', '2014-06-07', '0987654321', '64160100@go.buu.ac.th', 'ID : admin');


INSERT INTO `tbl_user_permission` (`user_permission_id`, `user_permission_name`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES ('Manger', 'เมเนเจอร์', 'admin', '2024-06-20 15:58:23', NULL, NULL);


INSERT INTO `permission_dashboard` (`tbl_user_permission`, `permission_access_dashboard`, `dashboard_read`, `dashboard_create`, `dashboard_update`, `dashboard_delete`, `dashboard_confirm`) VALUES ('Manger', 'ON', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_employee` (`tbl_user_permission`, `permission_access_employee`, `employee_read`, `employee_create`, `employee_update`, `employee_delete`, `employee_confirm`) VALUES ('Manger', 'ON', 'Y', 'Y', 'Y', 'Y', 'Y');

INSERT INTO `permission_menu` (`tbl_user_permission`, `permission_access_menu`, `menu_read`, `menu_create`, `menu_update`, `menu_delete`, `menu_confirm`) VALUES ('Manger', 'ON', 'Y', 'Y', 'Y', 'Y', 'Y');


INSERT INTO `permission_buying` (`tbl_user_permission`, `permission_access_buying`, `buying_read`, `buying_create`, `buying_update`, `buying_delete`, `buying_confirm`) VALUES ('Manger', 'ON', 'Y', 'Y', 'Y', 'Y', 'Y');


INSERT INTO `permission_promotion` (`tbl_user_permission`, `permission_access_promotion`, `promotion_read`, `promotion_create`, `promotion_update`, `promotion_delete`, `promotion_confirm`) VALUES ('Manger', 'ON', 'Y', 'Y', 'Y', 'Y', 'Y');


INSERT INTO `permission_table` (`tbl_user_permission`, `permission_access_table`, `table_read`, `table_create`, `table_update`, `table_delete`, `table_confirm`) VALUES ('Manger', 'ON', 'Y', 'Y', 'Y', 'Y', 'Y');


INSERT INTO `tbl_authority_employees` (`password`, `status`, `tbl_user_permission_use`, `tbl_employees`) VALUES ('1234', 'ON', 'Manger', 'BKB0001');

