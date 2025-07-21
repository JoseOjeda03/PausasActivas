require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const posturaRoutes = require('./routes/postura');
const UsuariosRoutes = require('./routes/Usuarios');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Puerto
const PORT = process.env.PORT || 5000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar MongoDB:', err));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API funcionando correctamente 🚀');
});
app.use('/api/postura', posturaRoutes);
app.use('/api/usuarios', UsuariosRoutes);
// Arrancar servidor
app.listen(PORT, () => {
    console.log(`🌐 Servidor backend en http://localhost:${PORT}`);
});
