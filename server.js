const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));


//Routes
const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const boxRoutes = require('./routes/boxRoutes');
const customerRoutes = require('./routes/customerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/user', userRoutes);
app.use('/shop', shopRoutes);
app.use('/box', boxRoutes);
app.use('/customer', customerRoutes);
app.use('/category', categoryRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes);

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));