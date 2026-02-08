import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Notification from "../components/Notification";

function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/employee-profiles/${id}`);
      const data = response.data.data || response.data;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      showNotification("Gagal memuat profil", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Profil tidak ditemukan</p>
        <button
          onClick={() => navigate("/employee-management")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Kembali ke Manajemen Karyawan
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() =>
            setNotification({ show: false, message: "", type: "" })
          }
        />
      )}

      {/* Header with back button and actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/employee-management")}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali
          </button>
          <div className="flex space-x-3">
            <Link
              to="/employee-profile"
              state={{ editUserId: profile.user_id }}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profil
            </Link>
            <Link
              to="/work-targets"
              state={{ assignToUserId: profile.user_id }}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Beri Target
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Photo and Basic Info */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
          <div className="flex items-center">
            {profile.photo ? (
              <img
                src={`/storage/${profile.photo}`}
                alt={profile.full_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-4xl font-bold text-blue-600">
                  {profile.full_name?.charAt(0) || "U"}
                </span>
              </div>
            )}
            <div className="ml-6 text-white">
              <h1 className="text-3xl font-bold">{profile.full_name}</h1>
              <p className="text-blue-100 text-lg mt-1">
                {profile.position || "Karyawan"}
              </p>
              <div className="flex items-center mt-3 space-x-4">
                <span className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Bergabung: {profile.join_date || "-"}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    profile.employment_status === "permanent"
                      ? "bg-green-500"
                      : profile.employment_status === "contract"
                        ? "bg-blue-500"
                        : profile.employment_status === "probation"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                  }`}
                >
                  {profile.employment_status === "permanent"
                    ? "Karyawan Tetap"
                    : profile.employment_status === "contract"
                      ? "Kontrak"
                      : profile.employment_status === "probation"
                        ? "Probation"
                        : profile.employment_status === "internship"
                          ? "Magang"
                          : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Sections */}
        <div className="p-6 space-y-6">
          {/* Personal Data */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Data Pribadi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">NIK</label>
                <p className="font-medium">{profile.nik || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Employee ID</label>
                <p className="font-medium">{profile.employee_id || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Tempat, Tanggal Lahir
                </label>
                <p className="font-medium">
                  {profile.birth_place || "-"}, {profile.birth_date || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Jenis Kelamin</label>
                <p className="font-medium">
                  {profile.gender === "male"
                    ? "Laki-laki"
                    : profile.gender === "female"
                      ? "Perempuan"
                      : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Status Pernikahan
                </label>
                <p className="font-medium">
                  {profile.marital_status === "single"
                    ? "Belum Menikah"
                    : profile.marital_status === "married"
                      ? "Menikah"
                      : profile.marital_status === "divorced"
                        ? "Cerai"
                        : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">No. Telepon</label>
                <p className="font-medium flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {profile.phone || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          {profile.address && (
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Alamat
              </h3>
              <p className="text-gray-700">{profile.address}</p>
              <p className="text-gray-600 mt-1">
                {profile.city}, {profile.province} {profile.postal_code}
              </p>
            </div>
          )}

          {/* Education */}
          {profile.last_education && (
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                  />
                </svg>
                Pendidikan
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">
                    Pendidikan Terakhir
                  </label>
                  <p className="font-medium">{profile.last_education}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Institusi</label>
                  <p className="font-medium">{profile.institution || "-"}</p>
                </div>
                {profile.major && (
                  <div>
                    <label className="text-sm text-gray-600">Jurusan</label>
                    <p className="font-medium">{profile.major}</p>
                  </div>
                )}
                {profile.graduation_year && (
                  <div>
                    <label className="text-sm text-gray-600">Tahun Lulus</label>
                    <p className="font-medium">{profile.graduation_year}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {profile.emergency_contact_name && (
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Kontak Darurat
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Nama</label>
                  <p className="font-medium">
                    {profile.emergency_contact_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Telepon</label>
                  <p className="font-medium">
                    {profile.emergency_contact_phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Hubungan</label>
                  <p className="font-medium">
                    {profile.emergency_contact_relation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Account */}
          {profile.bank_name && (
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Rekening Bank
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Bank</label>
                  <p className="font-medium">{profile.bank_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Nomor Rekening
                  </label>
                  <p className="font-medium">{profile.bank_account_number}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Atas Nama</label>
                  <p className="font-medium">{profile.bank_account_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Dokumen
            </h3>
            {profile.ktp_file || profile.ijazah_file || profile.cv_file ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.ktp_file && (
                  <a
                    href={`/storage/${profile.ktp_file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    KTP
                  </a>
                )}
                {profile.ijazah_file && (
                  <a
                    href={`/storage/${profile.ijazah_file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Ijazah
                  </a>
                )}
                {profile.cv_file && (
                  <a
                    href={`/storage/${profile.cv_file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    CV
                  </a>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Belum ada dokumen yang diupload</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetail;
