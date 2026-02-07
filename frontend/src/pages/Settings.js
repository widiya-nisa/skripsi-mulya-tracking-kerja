import React, { useState, useEffect } from "react";
import Notification from "../components/Notification";

function Settings() {
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loginLogo, setLoginLogo] = useState(null);
  const [loginLogoPreview, setLoginLogoPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem("appLogo");
    const savedLoginLogo = localStorage.getItem("loginLogo");
    if (savedLogo) {
      setLogoPreview(savedLogo);
    }
    if (savedLoginLogo) {
      setLoginLogoPreview(savedLoginLogo);
    }
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        setMessage("Ukuran file maksimal 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (logo) {
      localStorage.setItem("appLogo", logo);
      setNotification({
        message: "Logo aplikasi berhasil disimpan!",
        type: "success",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleRemove = () => {
    localStorage.removeItem("appLogo");
    setLogo(null);
    setLogoPreview(null);
    setNotification({
      message: "Logo aplikasi berhasil dihapus!",
      type: "success",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleLoginLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        setMessage("Ukuran file maksimal 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLoginLogoPreview(reader.result);
        setLoginLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLoginLogo = () => {
    if (loginLogo) {
      localStorage.setItem("loginLogo", loginLogo);
      setNotification({
        message: "Logo halaman login berhasil disimpan!",
        type: "success",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleRemoveLoginLogo = () => {
    localStorage.removeItem("loginLogo");
    setLoginLogo(null);
    setLoginLogoPreview(null);
    setNotification({
      message: "Logo halaman login berhasil dihapus!",
      type: "success",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="p-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h1>
        <p className="text-gray-600">
          Kelola tampilan dan konfigurasi aplikasi
        </p>
      </div>

      {/* Logo Settings Card */}
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Logo Aplikasi
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.includes("berhasil")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-4">
          {/* Logo Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center bg-gray-50">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="max-w-[200px] max-h-[200px] object-contain"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>Tidak ada logo</p>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Logo Baru
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#001f3f] file:text-white hover:file:bg-[#003366] file:cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: JPG, PNG, GIF. Maksimal 2MB. Rekomendasi ukuran: 200x200px
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={!logo}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                logo
                  ? "bg-[#001f3f] text-white hover:bg-[#003366]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Simpan Logo
            </button>
            {logoPreview && (
              <button
                onClick={handleRemove}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
              >
                Hapus Logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Page Logo Settings Card */}
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mt-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Logo Halaman Login
        </h2>

        <div className="space-y-4">
          {/* Login Logo Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Logo Login
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center bg-gray-50">
              {loginLogoPreview ? (
                <img
                  src={loginLogoPreview}
                  alt="Login Logo Preview"
                  className="max-w-[200px] max-h-[200px] object-contain"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>Tidak ada logo login</p>
                </div>
              )}
            </div>
          </div>

          {/* File Upload for Login Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Logo Login Baru
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLoginLogoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#001f3f] file:text-white hover:file:bg-[#003366] file:cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: JPG, PNG, GIF. Maksimal 2MB. Rekomendasi ukuran: 300x300px
            </p>
          </div>

          {/* Action Buttons for Login Logo */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSaveLoginLogo}
              disabled={!loginLogo}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                loginLogo
                  ? "bg-[#001f3f] text-white hover:bg-[#003366]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Simpan Logo Login
            </button>
            {loginLogoPreview && (
              <button
                onClick={handleRemoveLoginLogo}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
              >
                Hapus Logo Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 max-w-2xl">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informasi:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>
                Logo sidebar akan muncul di sidebar kiri atas (setelah login)
              </li>
              <li>Logo login akan muncul di halaman login</li>
              <li>
                Gunakan gambar dengan background transparan untuk hasil terbaik
              </li>
              <li>Logo disimpan di browser (localStorage)</li>
              <li>Setiap user bisa mengatur logo di browser masing-masing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
