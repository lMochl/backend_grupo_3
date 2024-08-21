const express = require('express');
const jwt = require('jsonwebtoken');
const firebaseAdmin = require('firebase-admin');
const axios = require('axios');

const router = express.Router();
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    await firebaseAdmin.auth().createUser({
      email,
      password,
    });
    
    res.status(201).json({
      message: "Cuenta creada exitosamente"
    });
  } catch (error) {
    res.status(400).json({ message: "Correo ya registrado" });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      email,
      password,
      returnSecureToken: true
    });

    const { localId } = response.data;

    const token = jwt.sign({ uid: localId }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ 
      token,
      message: "Inicio de sesión exitoso" 
    });
  } catch (error) {
    console.error('Error en login:', error.response ? error.response.data : error.message);
    res.status(401).json({ message: 'Credenciales incorrectas' });
  }
});
  
module.exports = router;
  