const pool = require('../db/pool');

const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

const getAllProjects = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const data = await pool.query(
      `SELECT p.*, COUNT(t.id)::int as task_count
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM projects');

    res.json({
      success: true,
      data: data.rows,
      pagination: {
        total: parseInt(count.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(count.rows[0].count / limit),
      },
    });
  } catch (err) { next(err); }
};

const getProjectById = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};

module.exports = { createProject, getAllProjects, getProjectById, deleteProject };