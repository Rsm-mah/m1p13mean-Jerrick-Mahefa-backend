const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/AuthMiddleware');
const UserController = require('../controllers/UserController');

//Supprimer un utilisateur
router.put('/delete/:id',authMiddleware, authorize('ADMIN'), UserController.DeleteUser);

//Modifier mot de passe d'un utilisateur
router.put('/update-password/:id',authMiddleware, authorize('ADMIN', 'SHOP'), UserController.ChangePassword);

//Modifier un utilisateur
router.put('/:id',authMiddleware, authorize('ADMIN', 'SHOP'), UserController.UpdateUser);

//Récupérer tous les users
router.get('/', authMiddleware, authorize('ADMIN'), UserController.getAllUsers);

//Connexion user
router.post('/', UserController.login);

module.exports = router;