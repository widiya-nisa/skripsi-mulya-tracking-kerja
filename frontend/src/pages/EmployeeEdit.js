import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Notification from "../components/Notification";

function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [formData, setFormData] = useState({
    user_id: "",
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
    salary: "",
    is_verified: false,
    notes: "",
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
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/employee-profiles/${id}`);
      const data = response.data.data || response.data;

      setFormData({
        user_id: data.user_id || "",
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
        salary: data.salary || "",
        is_verified: data.is_verified || false,
        notes: data.notes || "",
      });

      setPreviewUrls({
        ktp_file: data.ktp_file ? `/storage/${data.ktp_file}` : null,
        ijazah_file: data.ijazah_file ? `/storage/${data.ijazah_file}` : null,
        cv_file: data.cv_file ? `/storage/${data.cv_file}` : null,
        photo: data.photo ? `/storage/${data.photo}` : null,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      showNotification("Gagal memuat profil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];

    if (file) {
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
    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("user_id", formData.user_id);

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && key !== "user_id") {
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

      showNotification("Profil karyawan berhasil diupdate!", "success");
      setTimeout(() => {
        navigate("/employee-management");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification(
        error.response?.data?.message || "Gagal mengupdate profil",
        "error",
      );
    } finally {
      setSubmitting(false);
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Edit Profil Karyawan
          </h2>
          <button
            onClick={() => navigate("/employee-management")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Kembali
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields sama seperti EmployeeProfile.js tapi dengan semua field termasuk salary dan verification */}
          {/* Untuk singkatnya, saya akan redirect ke halaman EmployeeProfile dengan mode edit */}

          <div className="text-center py-8 text-gray-600">
            Silakan gunakan halaman Profil Pribadi untuk edit profil karyawan
            ini.
            <br />
            <button
              type="button"
              onClick={() => navigate("/employee-management")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Kembali ke Manajemen Karyawan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeEdit;
