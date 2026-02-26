const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/AuthMiddleware');
const ProductsController = require('../controllers/ProductsController');
const upload = require('../middleware/Upload');

//Récupérer tous les produits d'un shop
router.get('/shop', authMiddleware, ProductsController.getAllProductsByShopId);

//Supprimer un produit
router.put('/delete/:id',authMiddleware, authorize('ADMIN', 'SHOP'), ProductsController.DeleteProduct);

//Modifier un produit
router.put('/:id',authMiddleware,upload.array('images', 10), authorize('ADMIN', 'SHOP'), ProductsController.updateProduct);

//Récupérer un produit
router.get('/:id', ProductsController.getAProductById);

//Récupérer tous les produits
router.get('/', ProductsController.getAllProducts);

//Créer un produit
router.post('/',authMiddleware,upload.array('images', 10),authorize('SHOP'),ProductsController.createProduct);

module.exports = router;