import React, { useState, useEffect } from "react";
import { reportService } from "../services";

function Reports() {
  const [period, setPeriod] = useState("monthly");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getReport(period);
      setReport(data);
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Laporan</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("daily")}
            className={`px-4 py-2 rounded ${period === "daily" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Harian
          </button>
          <button
            onClick={() => setPeriod("weekly")}
            className={`px-4 py-2 rounded ${period === "weekly" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`px-4 py-2 rounded ${period === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Logs</h3>
              <p className="text-3xl font-bold text-blue-600">
                {report.summary.totalLogs}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Menit</h3>
              <p className="text-3xl font-bold text-green-600">
                {report.summary.totalMinutes}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Jam</h3>
              <p className="text-3xl font-bold text-purple-600">
                {report.summary.totalHours}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Project */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Waktu Per Proyek</h2>
              <div className="space-y-3">
                {Object.entries(report.summary.byProject).map(
                  ([projectName, data]) => (
                    <div key={projectName} className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{projectName}</span>
                        <span className="text-gray-600">
                          {formatDuration(data.duration)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {data.tasks.length} task(s): {data.tasks.join(", ")}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* By Status */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Waktu Per Status</h2>
              <div className="space-y-3">
                {Object.entries(report.summary.byStatus).map(
                  ([status, duration]) => (
                    <div
                      key={status}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <span className="font-medium capitalize">
                        {status.replace("_", " ")}
                      </span>
                      <span className="text-gray-600">
                        {formatDuration(duration)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Recent Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Proyek
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Durasi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.logs.slice(0, 10).map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.task?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.task?.project?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.start_time).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.duration ? formatDuration(log.duration) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="text-center py-12 text-gray-500">
          Tidak ada data untuk periode ini.
        </div>
      )}
    </div>
  );
}

export default Reports;
