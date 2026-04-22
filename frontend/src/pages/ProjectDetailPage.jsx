import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../api/projects';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';

const STATUS_COLORS = {
  'todo':        'bg-slate-700 text-slate-300',
  'in-progress': 'bg-amber-500/20 text-amber-400',
  'done':        'bg-green-500/20 text-green-400',
};

const PRIORITY_COLORS = {
  'low':    'bg-blue-500/20 text-blue-400',
  'medium': 'bg-yellow-500/20 text-yellow-400',
  'high':   'bg-red-500/20 text-red-400',
};

const EMPTY_TASK = { title: '', description: '', status: 'todo', priority: 'medium', due_date: '' };

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject]       = useState(null);
  const [tasks, setTasks]           = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage]             = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editTask, setEditTask]     = useState(null);
  const [form, setForm]             = useState(EMPTY_TASK);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const fetchProject = async () => {
    try {
      const res = await getProject(id);
      setProject(res.data.data);
    } catch { setError('Project not found'); }
  };

  const fetchTasks = async () => {
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (sortBy) params.sortBy = sortBy;
      const res = await getTasks(id, params);
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch { setError('Failed to load tasks'); }
  };

  useEffect(() => { fetchProject(); }, [id]);
  useEffect(() => { fetchTasks(); }, [id, page, filterStatus, sortBy]);

  const openCreate = () => { setEditTask(null); setForm(EMPTY_TASK); setShowModal(true); };
  const openEdit   = (task) => {
    setEditTask(task);
    setForm({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority, due_date: task.due_date || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      if (editTask) {
        await updateTask(editTask.id, form);
      } else {
        await createTask(id, form);
      }
      setShowModal(false);
      fetchTasks();
    } catch { setError('Failed to save task'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask(taskId); fetchTasks(); }
    catch { setError('Failed to delete task'); }
  };

  const handleStatusChange = async (task, newStatus) => {
    try { await updateTask(task.id, { status: newStatus }); fetchTasks(); }
    catch { setError('Failed to update status'); }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
  onClick={() => navigate('/')}
  className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm transition-all"
>
   <span className="text-base leading-none">←</span>
  <span>Back</span>
</button>
          <div>
            <h1 className="text-xl font-bold text-white">{project?.name || 'Loading...'}</h1>
            {project?.description && (
              <p className="text-slate-500 text-sm mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={openCreate}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 border-b border-slate-800/50 flex flex-wrap gap-3 items-center">
        <span className="text-slate-500 text-sm">Filter:</span>
        {['', 'todo', 'in-progress', 'done'].map(s => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === s
                ? 'bg-amber-500 text-black'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {s === '' ? 'All' : s}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-slate-500 text-sm">Sort:</span>
          <button
            onClick={() => setSortBy(sortBy === 'due_date' ? '' : 'due_date')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortBy === 'due_date'
                ? 'bg-amber-500 text-black'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            By Due Date
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div className="px-8 py-6 max-w-5xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-lg font-medium text-slate-400">No tasks yet</p>
            <p className="text-sm mt-1">Add your first task to this project</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-slate-400 text-xs line-clamp-1">{task.description}</p>
                  )}
                  {task.due_date && (
                    <p className="text-slate-600 text-xs mt-1 font-mono">Due: {task.due_date}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={task.status}
                    onChange={e => handleStatusChange(task, e.target.value)}
                    className={`text-xs px-2 py-1.5 rounded-lg font-medium border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[task.status]} bg-transparent`}
                  >
                    <option value="todo">todo</option>
                    <option value="in-progress">in-progress</option>
                    <option value="done">done</option>
                  </select>
                  <button
                    onClick={() => openEdit(task)}
                    className="text-slate-500 hover:text-amber-400 transition-colors text-xs px-2 py-1.5 bg-slate-800 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors text-xs px-2 py-1.5 bg-slate-800 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-400 text-sm">{page} / {pagination.totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-5">
              {editTask ? 'Edit Task' : 'New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional details"
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="todo">todo</option>
                    <option value="in-progress">in-progress</option>
                    <option value="done">done</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Due Date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}