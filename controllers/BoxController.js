const Box = require('../models/Box');

//Supprimer un Box
exports.DeleteBox = async (req, res) => {
  const { id } = req.params;

  try {
    const box = await Box.findByIdAndUpdate(id,{ isDeleted: true },{ new: true });

    if (!box) {
      return res.status(404).json({message: "Ce box n'existe pas ou n'est plus disponible."});
    }

    res.status(200).json({message: "Box supprimée avec succès",box});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la suppression du box"});
  }
};

//Modifier un Box
exports.UpdateBox = async (req, res) => {
  const { id } = req.params;

  try {
    const box = await Box.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!box) {
      return res.status(404).json({message: "Ce box n'existe pas ou n'est plus disponible."});
    }

    res.json({message: "Box modifié avec succès",box});
    
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la modification du box"});
  }
};

// Récupérer tous les box actifs
exports.getAllBox = async (req, res) => {
  try {
    const boxs = await Box.find({ isDeleted: false }).populate('shopId', 'name');

    const result = boxs.map(box => ({
      _id: box._id,
      name: box.name,
      loyer: box.loyer,
      shopId: box.shopId ? box.shopId._id : null,
      shopName: box.shopId ? box.shopId.name : 'LIBRE'
    }));

    res.status(200).json({ boxs: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la récupération des box"});
  }
};


//Fonction pour créer un box
exports.createBox = async (req, res) => {
  const { name, loyer, shopId } = req.body;

  try {
    const existingBox = await Box.findOne({
      name: { $regex: `^${name}$`, $options: 'i' }
    });

    if (existingBox) {
      return res.status(400).json({message: "Le nom de ce Box est déjà utilisé."});
    }

    const box = await Box.create({ name, loyer, shopId });

    res.status(201).json({message: "Box créée avec succès"});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la création du Box"});
  }
};