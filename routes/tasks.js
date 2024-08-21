const express = require('express');
const firebaseAdmin = require('firebase-admin');
const db = firebaseAdmin.firestore();
const {authenticateToken}= require('../middleware/verifyToken');

const router = express.Router();

router.post('/:projectId/task', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const taskRef = db.collection('projects').doc(projectId).collection('tasks').doc();
    await taskRef.set({
      id: taskRef.id,
      title,
      description,
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: taskRef.id, title, description });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la tarea' });
  }
});

router.get('/:projectId/task', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const tasksSnapshot = await projectRef.collection('tasks').get();
    const tasks = tasksSnapshot.docs.map(doc => doc.data());
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar las tareas' });
  }
});

router.put('/:projectId/task/:taskId', authenticateToken, async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const taskRef = db.collection('projects').doc(projectId).collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    await taskRef.update({ title, description });
    res.status(200).json({ message: 'Tarea editada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar la tarea' });
  }
});

router.delete('/:projectId/task/:taskId', authenticateToken, async (req, res) => {
    const { projectId, taskId } = req.params;
  
    try {
      const taskRef = db.collection('projects').doc(projectId).collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();
      if (!taskDoc.exists) {
        return res.status(404).json({ message: 'Tarea no encontrada' });
      }
  
      await taskRef.delete();
      res.status(200).json({ message: 'Tarea eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la tarea' });
    }
  });

module.exports = router;
