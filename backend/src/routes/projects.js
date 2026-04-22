const router = require('express').Router();
const { createProject, getAllProjects, getProjectById, deleteProject } = require('../controllers/projectController');

router.post('/',     createProject);
router.get('/',      getAllProjects);
router.get('/:id',   getProjectById);
router.delete('/:id',deleteProject);

module.exports = router;