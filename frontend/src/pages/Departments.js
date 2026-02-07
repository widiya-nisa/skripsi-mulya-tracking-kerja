import React, { useState, useEffect } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "operasional",
  });
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, formData);
        alert("Department berhasil diupdate!");
      } else {
        await api.post("/departments", formData);
        alert("Department berhasil ditambahkan!");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", description: "", type: "operasional" });
      fetchDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
      alert(
        error.response?.data?.message ||
          "Gagal menyimpan department. Pastikan nama tidak duplikat."
      );
    }
  };

  const handleEdit = (dept) => {
    setFormData({
      name: dept.name,
      description: dept.description || "",
      type: dept.type,
    });
    setEditingId(dept.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus department "${name}"?`
      )
    ) {
      try {
        await api.delete(`/departments/${id}`);
        alert("Department berhasil dihapus!");
        fetchDepartments();
      } catch (error) {
        console.error("Error deleting department:", error);
        alert(
          error.response?.data?.message ||
            "Gagal menghapus department. Mungkin masih digunakan oleh karyawan."
        );
      }
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    if (filterType === "all") return true;
    return dept.type === filterType;
  });

  const itDepartments = filteredDepartments.filter((d) => d.type === "it");
  const operasionalDepartments = filteredDepartments.filter(
    (d) => d.type === "operasional"
  );

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Manajemen Department
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola department dan job description untuk karyawan
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: "", description: "", type: "operasional" });
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Tambah Department
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Semua ({departments.length})
          </button>
          <button
            onClick={() => setFilterType("it")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === "it"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            IT ({departments.filter((d) => d.type === "it").length})
          </button>
          <button
            onClick={() => setFilterType("operasional")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === "operasional"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Operasional (
            {departments.filter((d) => d.type === "operasional").length})
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Edit Department" : "Tambah Department Baru"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Nama Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: Frontend Developer"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="Deskripsi pekerjaan (opsional)"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Tipe Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="it">IT</option>
                    <option value="operasional">Operasional</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({
                        name: "",
                        description: "",
                        type: "operasional",
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingId ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Departments List */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* IT Departments */}
          {(filterType === "all" || filterType === "it") &&
            itDepartments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">
                    IT
                  </span>
                  {itDepartments.length} Department
                </h2>
                <div className="space-y-3">
                  {itDepartments.map((dept) => (
                    <div
                      key={dept.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {dept.name}
                          </h3>
                          {dept.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {dept.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(dept)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id, dept.name)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Operasional Departments */}
          {(filterType === "all" || filterType === "operasional") &&
            operasionalDepartments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-2">
                    Operasional
                  </span>
                  {operasionalDepartments.length} Department
                </h2>
                <div className="space-y-3">
                  {operasionalDepartments.map((dept) => (
                    <div
                      key={dept.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {dept.name}
                          </h3>
                          {dept.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {dept.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(dept)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id, dept.name)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              Belum ada department.{" "}
              <button
                onClick={() => setShowForm(true)}
                className="text-indigo-600 hover:underline"
              >
                Tambah department baru
              </button>
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Departments;
