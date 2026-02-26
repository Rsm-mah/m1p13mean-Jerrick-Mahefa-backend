const Categories = require('../models/Categories');

//Supprimer une catégorie
exports.DeleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Categories.findByIdAndUpdate(id,{ isDeleted: true },{ new: true });

    if (!category) {
      return res.status(404).json({message: "Cette catégorie n'existe pas ou n'est plus disponible."});
    }

    res.status(200).json({message: "Catégorie supprimée avec succès",category});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la suppression de la catégorie"});
  }
};

//Modifier une catégorie
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, attributes } = req.body;

  try {
    const category = await Categories.findOne({ _id: id, isDeleted: false });

    if (!category) {
      return res.status(404).json({message: "Cette catégorie n'existe pas ou n'est plus disponible."});
    }

    // 🔹 Vérification des attributs (s'ils sont modifiés)
    if (attributes) {
      if (!Array.isArray(attributes)) {
        return res.status(400).json({message: "Les attributs doivent être fournis sous forme de liste."});
      }

      const allowedTypes = ['string','number','select','multiselect','boolean','textarea'];
      const keys = new Set();

      for (const attr of attributes) {
        if (!attr.key || !attr.label || !attr.type) {
          return res.status(400).json({message: "Chaque attribut doit contenir une clé, un label et un type."});
        }

        if (!allowedTypes.includes(attr.type)) {
          return res.status(400).json({message: `Type d'attribut invalide : ${attr.type}`});
        }

        if (keys.has(attr.key)) {
          return res.status(400).json({message: `L'attribut '${attr.key}' est dupliqué.`});
        }
        keys.add(attr.key);

        if (
          (attr.type === 'select' || attr.type === 'multiselect') &&
          (!Array.isArray(attr.options) || attr.options.length === 0)
        ) {
          return res.status(400).json({message: `L'attribut '${attr.label}' doit contenir des options.`});
        }
      }

      category.name = name;
      category.attributes = attributes;
    }

    await category.save();

    res.json({message: "La catégorie a été mise à jour avec succès.",category});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Une erreur est survenue lors de la mise à jour de la catégorie."});
  }
};


//Récupérer toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.find({ isDeleted: false });

    res.status(200).json({ categories });

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la récupération des catégories"});
  }
};

//Récupérer une catégorie
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Categories.findOne({ _id: id, isDeleted: false });

    res.status(200).json({ category });

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la récupération de la catégorie"});
  }
};

// Créer une catégorie
exports.createCategory = async (req, res) => {
  const { name, attributes } = req.body;

  try {
    if (!name || !Array.isArray(attributes)) {
      return res.status(400).json({message: "Le nom de la catégorie et ses attributs sont obligatoires."});
    }

    const existCategory = await Categories.findOne({name: name.trim(),isDeleted: false});

    if (existCategory) {
      return res.status(400).json({message: "Une catégorie avec ce nom existe déjà."});
    }

    const allowedTypes = ['string','number','select','multiselect','boolean','textarea'];

    const keys = new Set();

    for (const attr of attributes) {
      if (!attr.key || !attr.label || !attr.type) {
        return res.status(400).json({message: "Chaque attribut doit contenir une clé, un label et un type."});
      }

      if (!allowedTypes.includes(attr.type)) {
        return res.status(400).json({message: `Type d'attribut invalide : ${attr.type}`});
      }

      if (keys.has(attr.key)) {
        return res.status(400).json({message: `L'attribut '${attr.key}' est dupliqué.`});
      }
      keys.add(attr.key);

      // select / multiselect doivent avoir des options
      if (
        (attr.type === 'select' || attr.type === 'multiselect') &&
        (!Array.isArray(attr.options) || attr.options.length === 0)
      ) {
        return res.status(400).json({
          message: `L'attribut '${attr.label}' doit contenir des options.`
        });
      }
    }

    const category = await Categories.create({name: name.trim(),attributes});

    res.status(201).json({message: "La catégorie a été créée avec succès.",category});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Une erreur est survenue lors de la création de la catégorie."});
  }
};
