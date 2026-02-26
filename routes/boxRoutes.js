const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/AuthMiddleware');
const BoxController = require('../controllers/BoxController');

//Supprimer un box
router.put('/delete/:id',authMiddleware, authorize('ADMIN'), BoxController.DeleteBox);

//Modifier un box
router.put('/:id',authMiddleware, authorize('ADMIN'), BoxController.UpdateBox);

// Récupérer les box
router.get('/', authMiddleware, authorize('ADMIN'), BoxController.getAllBox);

// Créer un box
router.post('/save', authMiddleware, authorize('ADMIN'), BoxController.createBox);

module.exports = router;
