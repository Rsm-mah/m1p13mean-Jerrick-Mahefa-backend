const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Products');

//Récupérer tous les commandes d'une boutique
exports.getOrderByShop = async (req, res) => {
  try {
    const shopId = req.user?.shopId;

    if (!shopId) {
      return res.status(400).json({ message: 'La boutique est requise' });
    }

    const items = await OrderItem.find({ shopId }).sort({ createdAt: -1 }).lean();

    res.json({ shopId, total: items.length, items });
  } catch (err) {
    console.error('Erreur lors de la récupération des commandes de la boutique:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

//Mettre une commande comme livrée
exports.orderDelivered = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Vérifier le rôle
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Récupérer la commande
    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    const items = await OrderItem.find({ orderId: order._id }).lean();

    // Mettre le statut à LIVREE
    await Order.findByIdAndUpdate(order._id, { status: 'LIVREE' });

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.details = product.details.map(detail => {
          if (JSON.stringify(detail.attributes) === JSON.stringify(item.attributes)) {
            return { ...detail, stock: (detail.stock || 0) - item.quantity };
          }
          return detail;
        });
        await product.save();
      }
    }

    const updatedOrder = {
      ...order,
      status: 'LIVREE',
      items: items
    };

    res.json(updatedOrder);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

//Récupérer le détail d'une commande
exports.getOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.id;

    let order;

    if (req.user.role === 'ADMIN') {
      order = await Order.findById(orderId).lean();
    } else {
      const customerId = req.user.id;
      order = await Order.findOne({ _id: orderId, customerId }).lean();
    }

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    const items = await OrderItem.find({ orderId: order._id }).lean();

    const getDetailWithImage = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId).lean();
        let image = '';

        if (product?.details?.length) {
          const detail = product.details.find(d =>
            JSON.stringify(d.attributes) === JSON.stringify(item.attributes)
          );
          image = detail?.images?.[0] || '';
        }

        return { ...item, image };
      })
    );

    return res.json({ ...order, items: getDetailWithImage });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer toutes les commandes d'un utilisateur
exports.getUserOrders = async (req, res) => {
  try {
    const customerId = req.user.id;

    if (!customerId) {
      return res.status(401).json({ message: 'Utilisateur non connecté' });
    }

    const orders = await Order.find({ customerId })
      .sort({ createdAt: -1 })
      .lean();

    // Pour chaque commande, récupérer les items
    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const items = await OrderItem.find({ orderId: order._id })
          .select('productName shopName quantity price attributes')
          .lean();
        return {
          ...order,
          items
        };
      })
    );

    res.json(ordersWithItems);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les 10 dernières commandes
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name first_name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const items = await OrderItem.find({ orderId: order._id })
          .select('productName shopName quantity price attributes')
          .lean();

        const shopNames = Array.from(new Set((items || []).map(i => i.shopName).filter(Boolean)));
        const shop = shopNames.length === 0 ? '' : shopNames.join(', ');

        return { ...order, items, shop };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les 10 dernières commandes pour la boutique connectée (SHOP)
exports.getRecentOrdersByShop = async (req, res) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) return res.status(400).json({ message: 'La boutique est requise' });

    const shopObjectId = new mongoose.Types.ObjectId(shopId);

    const agg = await OrderItem.aggregate([
      { $match: { shopId: shopObjectId } },
      { $group: { _id: '$orderId', lastItemDate: { $max: '$createdAt' } } },
      { $sort: { lastItemDate: -1 } },
      { $limit: 10 }
    ]);

    const orderIds = agg.map(a => a._id);

    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate('customerId', 'name first_name')
      .lean();

    const ordered = orderIds.map(id => orders.find(o => o._id.toString() === id.toString())).filter(Boolean);

    const ordersWithItems = await Promise.all(
      ordered.map(async order => {
        const items = await OrderItem.find({ orderId: order._id, shopId: shopObjectId })
          .select('productName shopName quantity price attributes')
          .lean();
        return { ...order, items };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error('Erreur récupération commandes récentes boutique:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer toutes les commandes
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name first_name ')
      .sort({ createdAt: -1 })
      .lean();

    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const items = await OrderItem.find({ orderId: order._id })
          .select('productName shopName quantity price attributes')
          .lean();
        return { ...order, items };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer une commande
exports.createOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { cart } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: 'Panier vide' });
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({ customerId, totalAmount, status: 'EN COURS' });

    const orderItems = await Promise.all(cart.map(async item => {
      const product = await Product.findById(item.id).populate('shopId', 'name');
      return {
        orderId: order._id,
        productId: item.id,
        shopId: product.shopId._id,
        quantity: item.quantity,
        price: item.price,
        productName: product.name,
        shopName: product.shopId.name,
        attributes: item.attributes
      };
    }));

    await OrderItem.insertMany(orderItems);

    return res.status(201).json({ orderId: order._id, totalAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer statistiques pour dashboard admin
exports.getDashboardStats = async (req, res) => {
  try {
    // total commandes
    const totalOrders = await Order.countDocuments();

    // chiffre d'affaires
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = (revenueAgg[0] && revenueAgg[0].totalRevenue) || 0;

    // total clients
    const Customers = require('../models/Customers');
    const totalCustomers = await Customers.countDocuments();

    // total produits
    const totalProducts = await Product.countDocuments({ isDeleted: false });

    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts
    });
  } catch (err) {
    console.error('Erreur récupération des statistiques du dashboard:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer statistiques pour le Shop connecté
exports.getShopStats = async (req, res) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) return res.status(400).json({ message: 'La boutique est requise' });

    // total commandes
    const orderIds = await OrderItem.distinct('orderId', { shopId: new mongoose.Types.ObjectId(shopId) });
    const totalOrders = orderIds.length;

    // chiffre d'affaires pour la boutique (somme quantité * prix)
    const revenueAgg = await OrderItem.aggregate([
      { $match: { shopId: new mongoose.Types.ObjectId(shopId) } },
      { $group: { _id: null, totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ]);
    const totalRevenue = (revenueAgg[0] && revenueAgg[0].totalRevenue) || 0;

    // total clients
    const customerIds = await Order.distinct('customerId', { _id: { $in: orderIds } });
    const totalCustomers = customerIds.length;

    // total produits de la boutique
    const totalProducts = await Product.countDocuments({ shopId: new mongoose.Types.ObjectId(shopId), isDeleted: false });

    res.json({ totalRevenue, totalOrders, totalCustomers, totalProducts });
    
  } catch (err) {
    console.error('Erreur récupération des statistiques de la boutique:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};