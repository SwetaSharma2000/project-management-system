import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../api/projects';

const CARD_ACCENTS = [
  'border-l-amber-500', 'border-l-blue-500', 'border-l-green-500',
  'border-l-purple-500', 'border-l-rose-500', 'border-l-cyan-500',
];

export default function ProjectsPage() {
  const [projects, setProjects]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage]             = useState(1);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ name: '', description: '' });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await getProjects(page);
      setProjects(res.data.data);
      setPagination(res.data.pagination);
    } catch { setError('Failed to load projects'); }
  };

  useEffect(() => { fetchProjects(); }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await createProject(form);
      setForm({ name: '', description: '' });
      setShowModal(false);
      fetchProjects();
    } catch { setError('Failed to create project'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    try { await deleteProject(id); fetchProjects(); }
    catch { setError('Failed to delete project'); }
  };

  const totalTasks = projects.reduce((sum, p) => sum + (p.task_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Project<span className="text-amber-500">Flow</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Project Management System</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + New Project
        </button>
      </div>

     {/* Stats bar */}
<div className="px-8 py-5 border-b border-slate-800/60">
  <div className="flex gap-6 max-w-6xl mx-auto">
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-lg">
  P
   </div>
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wider">Total Projects</p>
        <p className="text-2xl font-bold text-white">{pagination.total || 0}</p>
      </div>
    </div>

    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
  T
    </div>
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wider">Tasks This Page</p>
        <p className="text-2xl font-bold text-white">{totalTasks}</p>
      </div>
    </div>

    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-lg">
  #
   </div>
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wider">Page</p>
        <p className="text-2xl font-bold text-white">
          {page} <span className="text-slate-600 text-lg font-normal">/ {pagination.totalPages || 1}</span>
        </p>
      </div>
    </div>
  </div>
</div>

      {/* Content */}
      <div className="px-8 py-8 max-w-6xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-lg font-medium text-slate-400">No projects yet</p>
            <p className="text-sm mt-1">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className={`bg-slate-900 border border-slate-800 border-l-4 ${CARD_ACCENTS[i % CARD_ACCENTS.length]} rounded-xl p-5 cursor-pointer hover:bg-slate-800/80 transition-all group`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white text-base leading-snug group-hover:text-amber-400 transition-colors">
                    {p.name}
                  </h3>
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="text-slate-600 hover:text-red-400 transition-colors text-xl leading-none flex-shrink-0"
                  >
                    ×
                  </button>
                </div>

                {p.description && (
                  <p className="text-slate-400 text-sm mt-2 line-clamp-2">{p.description}</p>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-slate-400 text-xs">{p.task_count || 0} tasks</span>
                  </div>
                  <p className="text-slate-600 text-xs font-mono">
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-40 transition-colors"
            >
              ← Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === p
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-5">New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Project Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm({ name: '', description: '' }); }}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}