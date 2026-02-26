const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customers = require('../models/Customers');

//Supprimer compte client
exports.DeleteCustomer = async (req, res) => {
  const customerId = req.user.id;

  try {
    const customer = await Customers.findByIdAndUpdate(customerId,{ isDeleted: true },{ new: true });

    if (!customer) {
      return res.status(404).json({message: "Ce compte client n'existe pas ou n'est plus disponible."});
    }

    res.status(200).json({message: "Votre compte a été désactivé avec succès.",customer});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Une erreur est survenue lors de la désactivation de votre compte. Veuillez réessayer."});
  }
};

//Modifier le mot de passe d'un client
exports.ChangePassword = async (req, res) => {
  const customerId = req.user.id;
  const { email, oldPassword, newPassword } = req.body;

  try {
    const customer = await Customers.findOne({_id: customerId,isDeleted: false});

    if (!customer) {
      return res.status(404).json({message: "Ce compte client n'existe pas ou n'est plus disponible."});
    }

    if (customer.email !== email) {
      return res.status(400).json({message: "L'email renseigné ne correspond pas à votre compte."});
    }

    const matchPassword = await bcrypt.compare(oldPassword, customer.password);
    if (!matchPassword) {
      return res.status(400).json({message: "Le mot de passe actuel saisi est incorrect."});
    }

    const samePassword = await bcrypt.compare(newPassword, customer.password);
    if (samePassword) {
      return res.status(400).json({message: "Votre nouveau mot de passe doit être différent de l'ancien."});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    customer.password = hashedPassword;
    await customer.save();

    res.status(200).json({message: "Votre mot de passe a été mis à jour avec succès."});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Une erreur est survenue lors du changement de mot de passe. Veuillez réessayer."});
  }
};


//Modifier un client
exports.UpdateCustomer = async (req, res) => {
  const customerId = req.user.id;

  try {
    const customer = await Customers.findByIdAndUpdate(
      customerId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({message: "Ce compte client n'existe pas ou n'est plus disponible."});
    }

    res.status(200).json({message: "Vos informations ont été mises à jour avec succès.",customer});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Une erreur est survenue lors de la mise à jour de vos informations. Veuillez réessayer."});
  }
};

//Récupérer un client
exports.getCustomerById = async (req, res) => {
  try {
    const customerId = req.user.id;

    if (!customerId) {
      return res.status(400).json({ message: "ID du client requis" });
    }

    const customer = await Customers.findOne({ _id: customerId, isDeleted: false }).select('-password');

    if (!customer) {
      return res.status(404).json({ message: "Client introuvable" });
    }

    res.status(200).json({ customer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération du client" });
  }
};

//Récupérer tous les clients
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customers.find({ isDeleted: false }).select('-password');

    res.status(200).json({ customers });

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la récupération des clients"});
  }
};

//Fonction pour la connexion de l'utilisateur (client finaux)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customers.findOne({ email });

    if (!customer) {
      return res.status(404).json({error: "Aucun compte ne correspond à cette adresse e-mail"});
    }

    if (customer.isDeleted) {
      return res.status(403).json({error: "Aucun compte ne correspond à cette adresse e-mail"});
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({error: "Le mot de passe que vous avez entré est incorrect."});
    }

    const token = jwt.sign(
      {
        id: customer._id,
        name: customer.name,
        first_name: customer.first_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};


// Création d’un compte client final
exports.register = async (req, res) => {
  const { name, first_name, email, password, phone, address } = req.body;

  try {
    const existingCustomer = await Customers.findOne({
      email: new RegExp(`^${email}$`, 'i')
    });

    if (existingCustomer) {
      return res.status(400).json({message: "L'adresse e-mail est déjà associée à un compte. Veuillez utiliser une autre adresse."});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Customers.create({
      name,
      first_name,
      email,
      password: hashedPassword,
      phone,
      address
    });

    res.status(201).json({
      message: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Une erreur est survenue lors de la création du compte."});
  }
};