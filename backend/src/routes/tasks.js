const router = require('express').Router();
const { createTask, getTasksByProject, updateTask, deleteTask } = require('../controllers/taskController');

router.post('/projects/:project_id/tasks',  createTask);
router.get('/projects/:project_id/tasks',   getTasksByProject);
router.put('/tasks/:id',                    updateTask);
router.delete('/tasks/:id',                 deleteTask);

module.exports = router;