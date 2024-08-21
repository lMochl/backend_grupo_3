const express = require('express');
const firebaseAdmin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(require(path.resolve(__dirname, 'config/trollo-d93c4-firebase-adminsdk-vupv2-2fd25e9db6.json')))
});

const db = firebaseAdmin.firestore();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', taskRoutes);  

app.get('/', (req, res) => {
  res.send('trollo API');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = { db };
