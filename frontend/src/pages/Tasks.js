import React, { useState, useEffect } from "react";
import { taskService, projectService } from "../services";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    project_id: "",
    due_date: "",
    estimated_hours: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, formData);
      } else {
        await taskService.create(formData);
      }
      loadData();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save task");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus task ini?")) {
      try {
        await taskService.delete(id);
        loadData();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete task");
      }
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        project_id: task.project_id,
        due_date: task.due_date || "",
        estimated_hours: task.estimated_hours || "",
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        project_id: projects[0]?.id || "",
        due_date: "",
        estimated_hours: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      done: "bg-green-100 text-green-800",
    };
    return colors[status] || colors.todo;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-orange-100 text-orange-800",
      high: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.medium;
  };

  const getStatusLabel = (status) => {
    const labels = {
      todo: "To Do",
      in_progress: "In Progress",
      done: "Done",
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={projects.length === 0}
        >
          + Task Baru
        </button>
      </div>

      {projects.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">
            Anda perlu membuat proyek terlebih dahulu sebelum membuat task.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-yellow-700">To Do</h3>
          <div className="space-y-3">
            {tasks
              .filter((t) => t.status === "todo")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openModal}
                  onDelete={handleDelete}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-blue-700">In Progress</h3>
          <div className="space-y-3">
            {tasks
              .filter((t) => t.status === "in_progress")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openModal}
                  onDelete={handleDelete}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
          </div>
        </div>

        {/* Done Column */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-green-700">Done</h3>
          <div className="space-y-3">
            {tasks
              .filter((t) => t.status === "done")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openModal}
                  onDelete={handleDelete}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
          </div>
        </div>
      </div>

      {tasks.length === 0 && projects.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          Belum ada task. Klik "Task Baru" untuk membuat task pertama Anda.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingTask ? "Edit Task" : "Task Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Judul Task</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Proyek</label>
                <select
                  value={formData.project_id}
                  onChange={(e) =>
                    setFormData({ ...formData, project_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Proyek</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Prioritas</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Est. Jam</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.estimated_hours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimated_hours: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  getStatusColor,
  getPriorityColor,
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold">{task.title}</h4>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}
        >
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{task.project?.name}</p>
      {task.description && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}
      {task.due_date && (
        <p className="text-xs text-gray-400 mb-3">
          Due: {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(task)}
          className="flex-1 bg-blue-500 text-white text-sm px-2 py-1 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="flex-1 bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

export default Tasks;
