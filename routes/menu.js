const express = require('express');
const menu = require('../controllers/menuController.js');
const router = express.Router();

router.get('/menu', menu.menuView);
router.get('/add_menu', menu.menuAdd);
router.get('/view_menu/:id', menu.menuViewId);
router.get('/edit_menu/:id', menu.menuEdit);
router.post('/update_menu/:id', menu.menuUpdate);
router.post('/create_menu', menu.menuCreate);
router.post('/delete_menu/:id', menu.menuDelete);

router.get('/menu_options/:id', menu.menuOptions);
router.get('/edit_menu_options/:id', menu.menuOptionsEdit);
router.post('/create_menu_options/:id', menu.menuOptionsCreate);
router.post('/delete_menu_options/:id', menu.menuOptionsDelete);
router.post('/update_menu_options/:id', menu.menuOptionsUpdate);

router.get('/setting_menu_category', menu.menuCategoryView);
router.get('/setting_menu_type', menu.menuTypeView);
router.get('/setting_menu_unit', menu.menuUnitView);

router.get('/setting_add_menu_category', menu.menuCategoryAdd);
router.get('/setting_add_menu_type', menu.menuTypeAdd);
router.get('/setting_add_menu_unit', menu.menuUnitAdd);

router.post('/create_menu_category', menu.menuCategoryCreate);
router.post('/create_menu_type', menu.menuTypeCreate);
router.post('/create_menu_unit', menu.menuUnitCreate);

router.post('/delete_menu_category/:id', menu.menuCategoryDelete); 
router.post('/delete_menu_type/:id', menu.menuTypeDelete);
router.post('/delete_menu_unit/:id', menu.menuUnitDelete);



module.exports = router;