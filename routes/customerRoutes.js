const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/AuthMiddleware');
const CustomerController = require('../controllers/CustomerController');

//Récupérer un client
router.get('/me', authMiddleware, CustomerController.getCustomerById);

//Supprimer un utilisateur
router.put('/delete',authMiddleware, CustomerController.DeleteCustomer);

//Modifier mot de passe d'un client
router.put('/update-password',authMiddleware, CustomerController.ChangePassword);

//Modifier un client
router.put('/',authMiddleware, CustomerController.UpdateCustomer);

//Récupérer tous les clients
router.get('/', authMiddleware, authorize('ADMIN'), CustomerController.getAllCustomers);

//Connexion client
router.post('/', CustomerController.login);

// Créer le compte d'un client
router.post('/save', CustomerController.register);

module.exports = router;