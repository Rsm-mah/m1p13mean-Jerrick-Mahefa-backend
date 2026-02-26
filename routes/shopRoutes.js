const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/AuthMiddleware');
const ShopController = require('../controllers/ShopController');

//Supprimer une boutique
router.put('/delete/:id',authMiddleware, authorize('ADMIN'), ShopController.DeleteShop);

//Modifier une boutique
router.put('/:id',authMiddleware, authorize('ADMIN'), ShopController.UpdateShop);

// Récupérer les boutiques
router.get('/', authMiddleware, authorize('ADMIN'), ShopController.getAllShops);

// Créer une boutique
router.post('/save', authMiddleware, authorize('ADMIN'), ShopController.createShop);

// Créer le compte d'une boutique
router.post('/', authMiddleware, authorize('ADMIN'), ShopController.register);

module.exports = router;
