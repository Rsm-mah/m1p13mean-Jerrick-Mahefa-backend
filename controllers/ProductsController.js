const Categories = require('../models/Categories');
const Products = require('../models/Products');
const cloudinary = require('../config/Cloudinary');

//Supprimer une catégorie
exports.DeleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Products.findByIdAndUpdate(id,{ isDeleted: true },{ new: true });

    if (!category) {
      return res.status(404).json({message: "Ce produit n'existe pas ou n'est plus disponible."});
    }

    res.status(200).json({message: "Produit supprimé avec succès",category});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la suppression du produit"});
  }
};

//Modifier un produit
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const shopId = req.user.shopId;
  const { categoryId, name, description } = req.body;
  let details = JSON.parse(req.body.details || '[]');

  try {
    const product = await Products.findOne({ _id: id, isDeleted: false });

    if (!product) {
      return res.status(404).json({ message: "Ce produit n'existe pas ou n'est plus disponible." });
    }

    const uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        uploadedImages.push(result.secure_url);
      }
    }

    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        existingImages = [];
      }
    }

    if (details && details.length > 0) {
      // Récupérer la catégorie pour valider les attributs
      const category = await Categories.findOne({ _id: product.categoryId, isDeleted: false });

      // Valider chaque détail
      for (const detail of details) {
        if (!detail.attributes || typeof detail.attributes !== 'object') {
          return res.status(400).json({ message: "Chaque détail doit contenir des attributs." });
        }

        if (category) {
          for (const attr of category.attributes) {
            const value = detail.attributes[attr.key];
            if (attr.required && (value === undefined || value === '')) {
              return res.status(400).json({ 
                message: `L'attribut '${attr.label}' est obligatoire.` 
              });
            }
          }
        }

        // Conserver les images existantes + ajouter les nouvelles
        detail.images = [
          ...(existingImages || []),
          ...uploadedImages
        ];
      }

      product.details = details;
    }

    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description;

    await product.save();

    await product.populate([
      { path: 'shopId', select: 'name' },
      { path: 'categoryId', select: 'name' }
    ]);

    res.json({ message: "Produit mis à jour avec succès.", product });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du produit.",error: error.message });
  }
};

//Récupérer un produit
exports.getAProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const products = await Products.findOne({ _id: id, isDeleted: false }).populate('shopId', 'name').populate('categoryId', 'name');

    res.status(200).json({ products });

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la récupération du produit"});
  }
};

//Récupérer tous les produits d'un shop
exports.getAllProductsByShopId = async (req, res) => {
  const shopId = req.user.shopId;

  try {
    const products = await Products.find({ shopId: shopId, isDeleted: false })
      .populate('shopId', 'name')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ products });

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la récupération des produits"});
  }
};

//Récupérer tous les produits
exports.getAllProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 12, search, sortPrice } = req.query;

    const filter = { isDeleted: false };

    if (typeof category === 'string' && category.trim() && category !== 'all') {
      filter.categoryId = category;
    }

    const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (typeof search === 'string' && search.trim()) {
      const trimmed = search.trim().slice(0, 80);
      const rx = new RegExp(escapeRegExp(trimmed), 'i');
      filter.$or = [{ name: rx }, { description: rx }];
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Nombre de pages
    const totalProducts = await Products.countDocuments(filter);

    let sort = { createdAt: -1 };

    if (typeof sortPrice === 'string') {
      const s = sortPrice.toLowerCase();
      if (s === 'asc' || s === 'price_asc') {
        sort = { 'details.price': 1, createdAt: -1 };
      }
      if (s === 'desc' || s === 'price_desc') {
        sort = { 'details.price': -1, createdAt: -1 };
      }
    }

    const products = await Products.find(filter)
      .populate('shopId', 'name')
      .populate('categoryId', 'name')
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort(sort);

    res.status(200).json({
      products,
      page: pageNumber,
      totalPages: Math.ceil(totalProducts / pageSize),
      totalProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits" });
  }
};

// Créer une catégorie
exports.createProduct = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const { categoryId, name, description } = req.body;
    let details = JSON.parse(req.body.details);

    if (!categoryId || !name || !Array.isArray(details)) {
      return res.status(400).json({message: "Les informations du produit sont incomplètes."});
    }

    const category = await Categories.findOne({_id: categoryId,isDeleted: false});

    if (!category) {
      return res.status(404).json({message: "Cette catégorie n'existe pas ou n'est plus disponible."});
    }

    // Upload images
    const uploadedImages = [];

    if (req.files && req.files.length > 0) {

      for (const file of req.files) {

        const result = await new Promise((resolve, reject) => {

          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(file.buffer);
        });

        uploadedImages.push(result.secure_url);
      }
    }

    // 🔹 Validation + ajout images
    for (const detail of details) {

      if (!detail.attributes || typeof detail.attributes !== 'object') {
        return res.status(400).json({message: "Chaque détail doit contenir des attributs."});
      }

      for (const attr of category.attributes) {
        const value = detail.attributes[attr.key];

        if (attr.required && value === undefined) {
          return res.status(400).json({message: `L'attribut '${attr.label}' est obligatoire.`});
        }
      }

      detail.images = uploadedImages;
    }

    const product = await Products.create({
      shopId,
      categoryId,
      name: name.trim(),
      description,
      details
    });

    res.status(201).json({message: "Produit créé avec succès.",product});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Erreur lors de la création du produit."});
  }
};

