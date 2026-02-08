import React, { useEffect, useState } from "react";
import { marketingService } from "../services";

function Marketing() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    total_budget: 0,
    total_reach: 0,
    total_leads: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "social_media",
    status: "planning",
    description: "",
    budget: "",
    spent: "",
    target_reach: "",
    actual_reach: "",
    leads_generated: "",
    conversions: "",
    start_date: "",
    end_date: "",
    platforms: "",
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [listResponse, statsResponse] = await Promise.all([
        marketingService.getAll(filters),
        marketingService.getStats(),
      ]);
      setCampaigns(listResponse.data || []);
      setStats(statsResponse.data || stats);
    } catch (err) {
      setError("Gagal memuat data campaign");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      planning: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      paused: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status] || styles.planning;
  };

  const getTypeBadge = (type) => {
    const styles = {
      social_media: "bg-pink-100 text-pink-800",
      email: "bg-blue-100 text-blue-800",
      webinar: "bg-purple-100 text-purple-800",
      event: "bg-orange-100 text-orange-800",
      ads: "bg-red-100 text-red-800",
      content: "bg-green-100 text-green-800",
    };
    return styles[type] || styles.social_media;
  };

  const openModal = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name || "",
        type: campaign.type || "social_media",
        status: campaign.status || "planning",
        description: campaign.description || "",
        budget: campaign.budget || "",
        spent: campaign.spent || "",
        target_reach: campaign.target_reach || "",
        actual_reach: campaign.actual_reach || "",
        leads_generated: campaign.leads_generated || "",
        conversions: campaign.conversions || "",
        start_date: campaign.start_date ? campaign.start_date.slice(0, 10) : "",
        end_date: campaign.end_date ? campaign.end_date.slice(0, 10) : "",
        platforms: Array.isArray(campaign.platforms)
          ? campaign.platforms.join(", ")
          : "",
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: "",
        type: "social_media",
        status: "planning",
        description: "",
        budget: "",
        spent: "",
        target_reach: "",
        actual_reach: "",
        leads_generated: "",
        conversions: "",
        start_date: "",
        end_date: "",
        platforms: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCampaign(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget || 0),
        spent: formData.spent ? Number(formData.spent) : 0,
        target_reach: formData.target_reach
          ? Number(formData.target_reach)
          : null,
        actual_reach: formData.actual_reach
          ? Number(formData.actual_reach)
          : null,
        leads_generated: formData.leads_generated
          ? Number(formData.leads_generated)
          : null,
        conversions: formData.conversions ? Number(formData.conversions) : null,
        platforms: formData.platforms
          ? formData.platforms.split(",").map((p) => p.trim())
          : [],
        end_date: formData.end_date || null,
      };

      if (editingCampaign) {
        await marketingService.update(editingCampaign.id, payload);
      } else {
        await marketingService.create(payload);
      }
      closeModal();
      loadData();
    } catch (err) {
      setError("Gagal menyimpan campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm("Yakin ingin menghapus campaign ini?")) {
      return;
    }
    try {
      await marketingService.delete(campaignId);
      loadData();
    } catch (err) {
      setError("Gagal menghapus campaign");
    }
  };

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.active}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-3xl font-bold text-purple-600">
                Rp {(stats.total_budget / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reach</p>
              <p className="text-3xl font-bold text-green-600">
                {(stats.total_reach / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Leads Generated</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.total_leads}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="social_media">Social Media</option>
            <option value="ads">Ads</option>
            <option value="webinar">Webinar</option>
            <option value="email">Email</option>
            <option value="event">Event</option>
            <option value="content">Content</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            placeholder="Cari campaign..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Campaign Baru</span>
        </button>
      </div>

      {loading && <div className="text-center py-8">Loading...</div>}
      {!loading && error && (
        <div className="text-center py-8 text-red-600">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {campaigns.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Tidak ada campaign.
            </div>
          )}
          {campaigns.map((campaign) => {
            const budget = campaign.budget || 0;
            const spent = campaign.spent || 0;
            const leads = campaign.leads_generated || 0;
            const budgetPercent = budget > 0 ? (spent / budget) * 100 : 0;
            const roi =
              spent > 0
                ? (((leads * 5000000 - spent) / spent) * 100).toFixed(1)
                : null;

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {campaign.name}
                  </h3>
                  <div className="flex space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(campaign.type)} capitalize`}
                    >
                      {campaign.type.replace("_", " ")}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)} capitalize`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(campaign)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Budget</p>
                  <p className="text-sm font-semibold">
                    Rp {(budget / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Spent</p>
                  <p className="text-sm font-semibold text-orange-600">
                    Rp {(spent / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Reach</p>
                  <p className="text-sm font-semibold">
                    {((campaign.actual_reach || 0) / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Leads</p>
                  <p className="text-sm font-semibold text-green-600">
                    {leads}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">ROI</p>
                  <p
                    className={`text-sm font-semibold ${roi && roi > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {roi ? `${roi > 0 ? "+" : ""}${roi}%` : "-"}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Budget Usage</span>
                  <span>{budgetPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                      className={`h-2 rounded-full ${budgetPercent > 90 ? "bg-red-500" : budgetPercent > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                  ></div>
                </div>
              </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingCampaign ? "Edit Campaign" : "Campaign Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Campaign
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="social_media">Social Media</option>
                    <option value="email">Email</option>
                    <option value="webinar">Webinar</option>
                    <option value="event">Event</option>
                    <option value="ads">Ads</option>
                    <option value="content">Content</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spent
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.spent}
                    onChange={(e) =>
                      setFormData({ ...formData, spent: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Reach
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.target_reach}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_reach: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actual Reach
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.actual_reach}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        actual_reach: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leads Generated
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.leads_generated}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leads_generated: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conversions
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.conversions}
                    onChange={(e) =>
                      setFormData({ ...formData, conversions: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platforms (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.platforms}
                  onChange={(e) =>
                    setFormData({ ...formData, platforms: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Marketing;
