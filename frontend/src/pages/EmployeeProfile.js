import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import Notification from "../components/Notification";
import { authService } from "../services";

function EmployeeProfile() {
  const location = useLocation();
  const editUserId = location.state?.editUserId; // ID user yang mau diedit (dari EmployeeManagement)

  const currentUser = authService.getCurrentUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(!!editUserId); // Auto edit mode jika dari management
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Check if user is admin
  const isAdmin = currentUser?.role === "admin";
  const isReadOnly = !isAdmin;

  const [formData, setFormData] = useState({
    nik: "",
    full_name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    birth_date: "",
    birth_place: "",
    gender: "male",
    marital_status: "single",
    join_date: "",
    employee_id: "",
    position: "",
    employment_status: "permanent",
    last_education: "SMA",
    institution: "",
    major: "",
    graduation_year: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  });

  const [files, setFiles] = useState({
    ktp_file: null,
    ijazah_file: null,
    cv_file: null,
    photo: null,
  });

  const [previewUrls, setPreviewUrls] = useState({
    ktp_file: null,
    ijazah_file: null,
    cv_file: null,
    photo: null,
  });

  useEffect(() => {
    fetchProfile();
  }, [editUserId]);

  const fetchProfile = async () => {
    try {
      // Jika ada editUserId (dari management), load profile user tersebut
      // Jika tidak ada, load profile sendiri
      const endpoint = editUserId
        ? `/employee-profiles/${editUserId}`
        : "/employee-profiles/me";
      const response = await api.get(endpoint);
      const data = response.data.data || response.data;
      setProfile(data);

      if (data) {
        setFormData({
          nik: data.nik || "",
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          province: data.province || "",
          postal_code: data.postal_code || "",
          birth_date: data.birth_date || "",
          birth_place: data.birth_place || "",
          gender: data.gender || "male",
          marital_status: data.marital_status || "single",
          join_date: data.join_date || "",
          employee_id: data.employee_id || "",
          position: data.position || "",
          employment_status: data.employment_status || "permanent",
          last_education: data.last_education || "SMA",
          institution: data.institution || "",
          major: data.major || "",
          graduation_year: data.graduation_year || "",
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
          emergency_contact_relation: data.emergency_contact_relation || "",
          bank_name: data.bank_name || "",
          bank_account_number: data.bank_account_number || "",
          bank_account_name: data.bank_account_name || "",
        });

        setPreviewUrls({
          ktp_file: data.ktp_file ? `/storage/${data.ktp_file}` : null,
          ijazah_file: data.ijazah_file ? `/storage/${data.ijazah_file}` : null,
          cv_file: data.cv_file ? `/storage/${data.cv_file}` : null,
          photo: data.photo ? `/storage/${data.photo}` : null,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showNotification("Gagal memuat profil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];

    if (file) {
      // Validasi ukuran file
      const maxSizes = {
        photo: 1048576, // 1MB untuk foto
        ktp_file: 2097152, // 2MB untuk dokumen
        ijazah_file: 2097152, // 2MB untuk dokumen
        cv_file: 2097152, // 2MB untuk dokumen
      };

      const maxSize = maxSizes[name] || 2097152;

      if (file.size > maxSize) {
        const maxSizeMB = maxSize / 1048576;
        showNotification(
          `Ukuran file ${file.name} terlalu besar! Maksimal ${maxSizeMB}MB. File Anda: ${(file.size / 1048576).toFixed(2)}MB`,
          "error",
        );
        // Reset input
        e.target.value = "";
        return;
      }

      // Validasi tipe file
      const allowedTypes = {
        photo: ["image/jpeg", "image/png"],
        ktp_file: ["application/pdf", "image/jpeg", "image/png"],
        ijazah_file: ["application/pdf", "image/jpeg", "image/png"],
        cv_file: ["application/pdf"],
      };

      const allowed = allowedTypes[name] || [];
      if (!allowed.includes(file.type)) {
        showNotification(
          `Tipe file tidak didukung! File harus berformat: ${allowed.map((t) => t.split("/")[1].toUpperCase()).join(", ")}`,
          "error",
        );
        e.target.value = "";
        return;
      }

      setFiles((prev) => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Jika edit user lain, tambahkan user_id
      if (editUserId) {
        submitData.append("user_id", editUserId);
      }

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      Object.keys(files).forEach((key) => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      await api.post("/employee-profiles", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showNotification(
        editUserId
          ? "Profil karyawan berhasil diupdate!"
          : "Profil berhasil disimpan!",
        "success",
      );
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      showNotification(
        error.response?.data?.message || "Gagal menyimpan profil",
        "error",
      );
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

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {editUserId
                ? `Edit Profil: ${profile?.full_name || "Karyawan"}`
                : "Profil Pribadi"}
            </h2>
            <p className="text-gray-600 mt-1">
              {isAdmin
                ? "Kelola data profil karyawan"
                : "Lihat data profil Anda (untuk update hubungi admin)"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isReadOnly && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                <p className="text-sm text-yellow-800">
                  <svg
                    className="w-5 h-5 inline-block mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Read Only - Hubungi admin untuk edit
                </p>
              </div>
            )}
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Profil
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing && isAdmin ? (
          /* Edit Form for Admin */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Foto Profil</h3>
              <div className="flex items-center space-x-4">
                {previewUrls.photo && (
                  <img
                    src={previewUrls.photo}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Foto (JPG/PNG, Max 1MB)
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Personal Data */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Data Pribadi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIK
                  </label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleInputChange}
                    maxLength="16"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Nama lengkap sesuai KTP"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    name="birth_place"
                    value={formData.birth_place}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Pernikahan
                  </label>
                  <select
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single">Belum Menikah</option>
                    <option value="married">Menikah</option>
                    <option value="divorced">Cerai</option>
                    <option value="widowed">Duda/Janda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Alamat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kota/Kabupaten
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    maxLength="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Employment Data */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Data Kepegawaian</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Karyawan
                  </label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Bergabung
                  </label>
                  <input
                    type="date"
                    name="join_date"
                    value={formData.join_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posisi/Jabatan
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Kepegawaian
                  </label>
                  <select
                    name="employment_status"
                    value={formData.employment_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="permanent">Tetap</option>
                    <option value="contract">Kontrak</option>
                    <option value="internship">Magang</option>
                    <option value="probation">Probation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Pendidikan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pendidikan Terakhir
                  </label>
                  <select
                    name="last_education"
                    value={formData.last_education}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SMA">SMA/SMK</option>
                    <option value="D3">Diploma (D3)</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Magister (S2)</option>
                    <option value="S3">Doktor (S3)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institusi/Universitas
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jurusan
                  </label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun Lulus
                  </label>
                  <input
                    type="number"
                    name="graduation_year"
                    value={formData.graduation_year}
                    onChange={handleInputChange}
                    min="1950"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Kontak Darurat</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hubungan
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_relation"
                    value={formData.emergency_contact_relation}
                    onChange={handleInputChange}
                    placeholder="Orang Tua/Saudara/Pasangan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bank Account */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Rekening Bank</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    placeholder="BCA, Mandiri, BRI, dll"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    name="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pemilik Rekening
                  </label>
                  <input
                    type="text"
                    name="bank_account_name"
                    value={formData.bank_account_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Documents Upload */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Dokumen Resmi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KTP (PDF/JPG/PNG, Max 2MB)
                  </label>
                  {previewUrls.ktp_file &&
                    !previewUrls.ktp_file.startsWith("data:") && (
                      <a
                        href={previewUrls.ktp_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm mb-2 block"
                      >
                        Lihat file saat ini
                      </a>
                    )}
                  <input
                    type="file"
                    name="ktp_file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ijazah (PDF/JPG/PNG, Max 2MB)
                  </label>
                  {previewUrls.ijazah_file &&
                    !previewUrls.ijazah_file.startsWith("data:") && (
                      <a
                        href={previewUrls.ijazah_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm mb-2 block"
                      >
                        Lihat file saat ini
                      </a>
                    )}
                  <input
                    type="file"
                    name="ijazah_file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CV (PDF, Max 2MB)
                  </label>
                  {previewUrls.cv_file &&
                    !previewUrls.cv_file.startsWith("data:") && (
                      <a
                        href={previewUrls.cv_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm mb-2 block"
                      >
                        Lihat file saat ini
                      </a>
                    )}
                  <input
                    type="file"
                    name="cv_file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {profile ? (
              <>
                {/* Photo and Basic Info */}
                <div className="flex items-start space-x-6 border-b pb-6">
                  {profile.photo ? (
                    <img
                      src={`/storage/${profile.photo}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                      <span className="text-4xl text-gray-500">
                        {profile.full_name?.charAt(0) ||
                          currentUser?.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {profile.full_name || currentUser?.name}
                    </h3>
                    <p className="text-gray-600">
                      {profile.position ||
                        currentUser?.job_description ||
                        "Belum ada posisi"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      ID: {profile.employee_id || "-"}
                    </p>
                    {profile.is_verified ? (
                      <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        ✓ Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                        Menunggu Verifikasi
                      </span>
                    )}
                  </div>
                </div>

                {/* Personal Data */}
                <div className="border-b pb-6">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">
                    Data Pribadi
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">NIK:</span>{" "}
                      <span className="font-medium">{profile.nik || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Telepon:</span>{" "}
                      <span className="font-medium">
                        {profile.phone || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Tempat, Tanggal Lahir:
                      </span>{" "}
                      <span className="font-medium">
                        {profile.birth_place
                          ? `${profile.birth_place}, ${profile.birth_date || "-"}`
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Jenis Kelamin:</span>{" "}
                      <span className="font-medium">
                        {profile.gender === "male"
                          ? "Laki-laki"
                          : profile.gender === "female"
                            ? "Perempuan"
                            : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>{" "}
                      <span className="font-medium">
                        {profile.marital_status === "single"
                          ? "Belum Menikah"
                          : profile.marital_status === "married"
                            ? "Menikah"
                            : profile.marital_status === "divorced"
                              ? "Cerai"
                              : profile.marital_status === "widowed"
                                ? "Duda/Janda"
                                : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {profile.address && (
                  <div className="border-b pb-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">
                      Alamat
                    </h4>
                    <p className="text-gray-700">{profile.address}</p>
                    <p className="text-gray-600 mt-1">
                      {profile.city}, {profile.province} {profile.postal_code}
                    </p>
                  </div>
                )}

                {/* Employment */}
                {profile.join_date && (
                  <div className="border-b pb-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">
                      Data Kepegawaian
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">
                          Tanggal Bergabung:
                        </span>{" "}
                        <span className="font-medium">{profile.join_date}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>{" "}
                        <span className="font-medium">
                          {profile.employment_status === "permanent"
                            ? "Tetap"
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
                )}

                {/* Education */}
                {profile.last_education && (
                  <div className="border-b pb-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">
                      Pendidikan
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">
                          Pendidikan Terakhir:
                        </span>{" "}
                        <span className="font-medium">
                          {profile.last_education}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Institusi:</span>{" "}
                        <span className="font-medium">
                          {profile.institution || "-"}
                        </span>
                      </div>
                      {profile.major && (
                        <div>
                          <span className="text-gray-600">Jurusan:</span>{" "}
                          <span className="font-medium">{profile.major}</span>
                        </div>
                      )}
                      {profile.graduation_year && (
                        <div>
                          <span className="text-gray-600">Tahun Lulus:</span>{" "}
                          <span className="font-medium">
                            {profile.graduation_year}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {profile.emergency_contact_name && (
                  <div className="border-b pb-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">
                      Kontak Darurat
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Nama:</span>{" "}
                        <span className="font-medium">
                          {profile.emergency_contact_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Telepon:</span>{" "}
                        <span className="font-medium">
                          {profile.emergency_contact_phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Hubungan:</span>{" "}
                        <span className="font-medium">
                          {profile.emergency_contact_relation}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Account */}
                {profile.bank_name && (
                  <div className="border-b pb-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">
                      Rekening Bank
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Bank:</span>{" "}
                        <span className="font-medium">{profile.bank_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Nomor Rekening:</span>{" "}
                        <span className="font-medium">
                          {profile.bank_account_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Atas Nama:</span>{" "}
                        <span className="font-medium">
                          {profile.bank_account_name}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">
                    Dokumen Resmi
                  </h4>
                  {profile.ktp_file ||
                  profile.ijazah_file ||
                  profile.cv_file ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {profile.ktp_file && (
                        <a
                          href={`/storage/${profile.ktp_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-center hover:bg-blue-100"
                        >
                          📄 KTP
                        </a>
                      )}
                      {profile.ijazah_file && (
                        <a
                          href={`/storage/${profile.ijazah_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-center hover:bg-blue-100"
                        >
                          📄 Ijazah
                        </a>
                      )}
                      {profile.cv_file && (
                        <a
                          href={`/storage/${profile.cv_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-center hover:bg-blue-100"
                        >
                          📄 CV
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Belum ada dokumen yang diupload
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <p className="text-gray-600 mt-4 mb-2">
                  Profil belum dilengkapi
                </p>
                {isAdmin ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Lengkapi Profil
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Hubungi admin untuk melengkapi profil Anda
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeProfile;
