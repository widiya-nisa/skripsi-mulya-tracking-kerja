import React, { useState } from "react";

function Sales() {
  const [salesPeople] = useState([
    {
      id: 1,
      name: "Ahmad Yani",
      target: 50000000,
      achieved: 42000000,
      leads: 25,
      converted: 12,
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      target: 45000000,
      achieved: 48000000,
      leads: 30,
      converted: 15,
    },
    {
      id: 3,
      name: "Budi Santoso",
      target: 40000000,
      achieved: 35000000,
      leads: 20,
      converted: 9,
    },
  ]);

  const getPercentage = (achieved, target) => {
    return Math.round((achieved / target) * 100);
  };

  return (
    <div>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90 mb-2">Target Bulan Ini</p>
          <p className="text-3xl font-bold">250M</p>
          <p className="text-sm mt-2 opacity-75">Februari 2026</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90 mb-2">Pencapaian</p>
          <p className="text-3xl font-bold">215M</p>
          <p className="text-sm mt-2 opacity-75">86% dari target</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90 mb-2">New Customers</p>
          <p className="text-3xl font-bold">42</p>
          <p className="text-sm mt-2 opacity-75">+12 dari bulan lalu</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90 mb-2">Conversion Rate</p>
          <p className="text-3xl font-bold">35%</p>
          <p className="text-sm mt-2 opacity-75">Lead to Customer</p>
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">
            Performa Tim Sales
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {salesPeople.map((person) => {
              const percentage = getPercentage(person.achieved, person.target);
              const isAboveTarget = percentage >= 100;

              return (
                <div
                  key={person.id}
                  className="border rounded-lg p-5 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {person.name}
                      </h4>
                      <p className="text-sm text-gray-600">Sales Executive</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isAboveTarget
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Target</p>
                      <p className="text-sm font-semibold">
                        Rp {(person.target / 1000000).toFixed(0)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Achieved</p>
                      <p className="text-sm font-semibold text-green-600">
                        Rp {(person.achieved / 1000000).toFixed(0)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Conversion</p>
                      <p className="text-sm font-semibold">
                        {person.converted}/{person.leads}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isAboveTarget ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-gray-800">
              Target per Bulan
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {["Januari", "Februari", "Maret", "April"].map((month, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700">{month} 2026</span>
                  <span className="font-semibold text-blue-600">Rp 250M</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-gray-800">Top Products</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[
                { name: "Premium Package", value: 85 },
                { name: "Enterprise Package", value: 65 },
                { name: "Basic Package", value: 120 },
                { name: "Custom Solution", value: 25 },
              ].map((product, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700">{product.name}</span>
                  <span className="font-semibold text-green-600">
                    {product.value} sold
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;
