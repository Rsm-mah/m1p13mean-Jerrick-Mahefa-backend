const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');

//Supprimer un utilisateur
exports.DeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Users.findByIdAndUpdate(id,{ isDeleted: true },{ new: true });

    if (!user) {
      return res.status(404).json({message: "Utilisateur introuvable"});
    }

    res.status(200).json({message: "Utilisateur supprimée avec succès",user});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la suppression de l'utilisateur"});
  }
};

//Modifier le mot de passe d'un utilisateur
exports.ChangePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await Users.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(404).json({message: "Utilisateur introuvable"});
    }

    const matchPassword = await bcrypt.compare(oldPassword, user.password);
    if (!matchPassword) {
      return res.status(400).json({message: "Ancien mot de passe incorrect"});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({message: "Mot de passe modifié avec succès"});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la modification du mot de passe"});
  }
};

//Modifier un utilisateur
exports.UpdateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Users.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!user) {
      return res.status(404).json({message: "Utilisateur introuvable"});
    }

    res.json({message: "Utilisateur modifié avec succès",user});
    
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la modification de l'utilisateur"});
  }
};

//Récupérer tous les users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({ isDeleted: false }).select('-password');

    res.status(200).json({ users });

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la récupération des utilisateurs"});
  }
};

//Fonction pour la connexion de l'utilisateur (admin ou client boutique)
exports.login = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await Users.findOne({ name });

    if (!user) {
      return res.status(404).json({error: "Aucun compte ne correspond à ce nom d'utilisateur"});
    }

    if (user.isDeleted) {
      return res.status(403).json({error: "Ce compte est désactivé"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({error: "Le mot de passe que vous avez entré est incorrect."});
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        shopId: user.shopId
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
  