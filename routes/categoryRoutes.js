const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/AuthMiddleware');
const CategoriesController = require('../controllers/CategoriesController');

//Supprimer une catégorie
router.put('/delete/:id',authMiddleware, authorize('ADMIN', 'SHOP'), CategoriesController.DeleteCategory);

//Modifier une catégorie
router.put('/:id',authMiddleware, authorize('ADMIN', 'SHOP'), CategoriesController.updateCategory);

//Récupérer une catégorie
router.get('/:id', authMiddleware, CategoriesController.getCategoryById);

//Récupérer toutes les catégories
router.get('/', CategoriesController.getAllCategories);

//Créer une catégorie
router.post('/',authMiddleware,authorize('ADMIN', 'SHOP'),CategoriesController.createCategory);

module.exports = router;