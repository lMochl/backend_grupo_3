const express = require('express');
const firebaseAdmin = require('firebase-admin');
const db = firebaseAdmin.firestore();
const {authenticateToken}= require('../middleware/verifyToken');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Faltan campos' });
  }

  try {
    const projectRef = db.collection('projects').doc();
    await projectRef.set({
      id: projectRef.id,
      name,
      description,
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: projectRef.id, name, description });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el proyecto' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection('projects').get();
    const projects = snapshot.docs.map(doc => doc.data());
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar proyectos' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const projectDoc = await db.collection('projects').doc(id).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    res.status(200).json(projectDoc.data());
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el proyecto' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const projectRef = db.collection('projects').doc(id);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    await projectRef.update({ name, description });
    res.status(200).json({ message: 'Proyecto editado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar el proyecto' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const projectRef = db.collection('projects').doc(id);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    await projectRef.delete();
    res.status(200).json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el proyecto' });
  }
});

module.exports = router;
