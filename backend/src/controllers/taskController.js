const pool = require('../db/pool');

const createTask = async (req, res, next) => {
  try {
    const { title, description, status = 'todo', priority = 'medium', due_date } = req.body;
    const { project_id } = req.params;

    const project = await pool.query('SELECT id FROM projects WHERE id = $1', [project_id]);
    if (!project.rows.length) return res.status(404).json({ success: false, message: 'Project not found' });

    const result = await pool.query(
      'INSERT INTO tasks (project_id, title, description, status, priority, due_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, project_id, title, description, status, priority, due_date::text, created_at',
      [project_id, title, description, status, priority, due_date]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

const getTasksByProject = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const { status, sortBy } = req.query;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, project_id, title, description, status, priority, due_date::text, created_at FROM tasks WHERE project_id = $1';
    let countQ = 'SELECT COUNT(*) FROM tasks WHERE project_id = $1';
    const params = [project_id];

    if (status) {
      params.push(status);
      query  += ` AND status = $${params.length}`;
      countQ += ` AND status = $${params.length}`;
    }

    query += sortBy === 'due_date' ? ' ORDER BY due_date ASC NULLS LAST' : ' ORDER BY created_at DESC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const data  = await pool.query(query, [...params, limit, offset]);
    const count = await pool.query(countQ, params);

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

const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    const result = await pool.query(
      `UPDATE tasks SET
   title       = COALESCE($1, title),
   description = COALESCE($2, description),
   status      = COALESCE($3, status),
   priority    = COALESCE($4, priority),
   due_date    = COALESCE($5, due_date)
   WHERE id = $6
   RETURNING id, project_id, title, description, status, priority, due_date::text, created_at`,
      [title, description, status, priority, due_date, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

module.exports = { createTask, getTasksByProject, updateTask, deleteTask };