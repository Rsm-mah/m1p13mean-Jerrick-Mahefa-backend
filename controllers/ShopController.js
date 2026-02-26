const bcrypt = require('bcrypt');
const Users = require('../models/Users');
const Shops = require('../models/Shops');

//Supprimer une boutique
exports.DeleteShop = async (req, res) => {
  const { id } = req.params;

  try {
    const shop = await Shops.findByIdAndUpdate(id,{ isDeleted: true },{ new: true });

    if (!shop) {
      return res.status(404).json({message: "Cette boutique n'existe pas ou n'est plus disponible."});
    }

    res.status(200).json({message: "Boutique supprimée avec succès",shop});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la suppression de la boutique"});
  }
};

//Modifier une boutique
exports.UpdateShop = async (req, res) => {
  const { id } = req.params;

  try {
    const box = await Shops.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!box) {
      return res.status(404).json({message: "Cette boutique n'existe pas ou n'est plus disponible."});
    }

    res.json({message: "Boutique modifiée avec succès",box});
    
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la modification de la boutique"});
  }
};

// Récupérer toutes les boutiques actives
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shops.find(
      { isDeleted: false },
      {
        name: 1,
        contacts: 1
      }
    );

    res.status(200).json({ shops });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des boutiques"
    });
  }
};

//Fonction pour créer une boutique
exports.createShop = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const existingShop = await Shops.findOne({
      name: { $regex: `^${name}$`, $options: 'i' }
    });

    if (existingShop) {
      return res.status(400).json({message: "Le nom de la boutique est déjà utilisé."});
    }

    const shop = await Shops.create({ name, contacts: {email, phone} });

    res.status(201).json({message: "Boutique créée avec succès"});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la création de la boutique"});
  }
};


//Fonction pour créer l'utilisateur d'une boutique
exports.register = async (req, res) => {
  const { shopId, name, email, password, phone } = req.body;

  try {
    const existingName = await Users.findOne({
      name: { $regex: `^${name}$`, $options: 'i' }
    });
    if (existingName) {
      return res.status(400).json({message: "Le nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre."});
    }

    const existingEmail = await Users.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({message: "L'adresse e-mail est déjà associée à un compte. Veuillez utiliser une autre adresse."});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Users.create({
      name,
      shopId,
      email,
      password: hashedPassword,
      phone,
      role: 'SHOP'
    });

    res.status(201).json({message: "Utilisateur de la boutique créé avec succès"});

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur"
    });
  }
};
  