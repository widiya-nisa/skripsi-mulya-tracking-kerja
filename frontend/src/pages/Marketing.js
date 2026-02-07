import React, { useState } from "react";

function Marketing() {
  const [campaigns] = useState([
    {
      id: 1,
      name: "Promo Ramadan 2026",
      type: "social_media",
      status: "active",
      budget: 10000000,
      spent: 7500000,
      reach: 150000,
      leads: 120,
    },
    {
      id: 2,
      name: "Webinar UMKM Success",
      type: "webinar",
      status: "completed",
      budget: 5000000,
      spent: 4800000,
      reach: 5000,
      leads: 85,
    },
    {
      id: 3,
      name: "Instagram Ads Q1",
      type: "ads",
      status: "active",
      budget: 15000000,
      spent: 12000000,
      reach: 250000,
      leads: 180,
    },
  ]);

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

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-3xl font-bold text-blue-600">8</p>
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
              <p className="text-3xl font-bold text-purple-600">45M</p>
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
              <p className="text-3xl font-bold text-green-600">580K</p>
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
              <p className="text-3xl font-bold text-orange-600">385</p>
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
          <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Semua Status</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="completed">Completed</option>
          </select>
          <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Semua Tipe</option>
            <option value="social_media">Social Media</option>
            <option value="ads">Ads</option>
            <option value="webinar">Webinar</option>
            <option value="email">Email</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
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

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const budgetPercent = (campaign.spent / campaign.budget) * 100;
          const roi = (
            ((campaign.leads * 5000000 - campaign.spent) / campaign.spent) *
            100
          ).toFixed(1);

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
                <button className="text-blue-600 hover:text-blue-800">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Budget</p>
                  <p className="text-sm font-semibold">
                    Rp {(campaign.budget / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Spent</p>
                  <p className="text-sm font-semibold text-orange-600">
                    Rp {(campaign.spent / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Reach</p>
                  <p className="text-sm font-semibold">
                    {(campaign.reach / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Leads</p>
                  <p className="text-sm font-semibold text-green-600">
                    {campaign.leads}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">ROI</p>
                  <p
                    className={`text-sm font-semibold ${roi > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {roi > 0 ? "+" : ""}
                    {roi}%
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
    </div>
  );
}

export default Marketing;
