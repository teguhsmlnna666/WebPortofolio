import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Image as ImageIcon, LogOut, Moon, Sun, Upload, X } from "lucide-react";

import Toast from "../../components/ui/Toast";

const API_URL = "http://127.0.0.1:8000/api";

export default function AdminReportCreate() {
  const navigate = useNavigate();

  const token = localStorage.getItem("admin_token");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    week: "",
    description: "",
    cover_image: "",
    status: "draft",
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState("");

  const [toast, setToast] = useState(null);

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const toggleTheme = () => {
    const nextTheme = !isDark;

    setIsDark(nextTheme);

    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      navigate("/admin/login", { replace: true });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setCoverFile(file);

    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);

    setForm((current) => ({
      ...current,
      cover_image: "",
    }));

    setError("");
  };

  const handleUploadCover = async () => {
    if (!coverFile) {
      setError("Pilih gambar cover terlebih dahulu.");
      showToast("Pilih gambar cover terlebih dahulu.", "error");
      return;
    }

    setError("");
    setUploadingCover(true);

    try {
      const formData = new FormData();

      formData.append("image", coverFile);

      const response = await fetch(`${API_URL}/upload/cover`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengupload cover.");
      }

      setForm((current) => ({
        ...current,
        cover_image: data.data.path,
      }));

      setCoverPreview(data.data.url);
      setCoverFile(null);

      showToast("Cover berhasil diupload.", "success");
    } catch (err) {
      setError(err.message || "Gagal mengupload cover.");
      showToast(err.message || "Gagal mengupload cover.", "error");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview("");

    setForm((current) => ({
      ...current,
      cover_image: "",
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (coverFile && !form.cover_image) {
      const message = 'Cover sudah dipilih tetapi belum diupload. Klik "Upload Cover" terlebih dahulu.';

      setError(message);
      showToast("Upload cover terlebih dahulu.", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...form,
          blocks: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal membuat laporan.");
      }

      showToast("Laporan berhasil dibuat.", "success");

      navigate(`/admin/reports/${data.data.id}/edit`);
    } catch (err) {
      setError(err.message || "Gagal membuat laporan.");
      showToast(err.message || "Gagal membuat laporan.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />

      {/* Top Controls */}
      <div className="fixed left-6 right-6 top-6 z-50 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/admin/reports")}
          className="
            group
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-border/70
            bg-background/70
            px-4
            py-2.5
            text-sm
            font-medium
            text-muted-foreground
            shadow-lg
            backdrop-blur-xl
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:bg-secondary
            hover:text-foreground
          "
        >
          <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Reports</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            className="
              inline-flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-border/70
              bg-background/70
              text-muted-foreground
              shadow-lg
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-secondary
              hover:text-foreground
            "
          >
            <LogOut size={17} />
          </button>

          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? "Light mode" : "Dark mode"}
            className="
              inline-flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-border/70
              bg-background/70
              text-muted-foreground
              shadow-lg
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-secondary
              hover:text-foreground
            "
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>

      {/* Header */}
      <section className="px-6 pb-8 pt-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Admin / Reports</p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Tambah laporan</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Buat laporan baru dengan melengkapi informasi laporan.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div
            className="
              rounded-[1.75rem]
              border
              border-border
              bg-card
              p-6
              shadow-sm
              md:p-8
            "
          >
            {error && (
              <div
                className="
                  mb-6
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  px-4
                  py-3
                  text-sm
                  text-red-600
                  dark:text-red-400
                "
              >
                <X size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Informasi */}
              <div>
                <h2 className="text-xl font-semibold">Informasi Laporan</h2>

                <p className="mt-1 text-sm text-muted-foreground">Masukkan informasi dasar laporan.</p>
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium">Judul Laporan</label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Contoh: Praktikum Deep Learning"
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-border
                    bg-background
                    px-4
                    py-3
                    text-sm
                    text-foreground
                    outline-none
                    transition
                    placeholder:text-muted-foreground
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/10
                  "
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-sm font-medium">Slug</label>

                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="praktikum-deep-learning"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-border
                    bg-background
                    px-4
                    py-3
                    text-sm
                    text-foreground
                    outline-none
                    transition
                    placeholder:text-muted-foreground
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/10
                  "
                />

                <p className="mt-2 text-xs text-muted-foreground">Kosongkan jika ingin dibuat otomatis.</p>
              </div>

              {/* Category + Week */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Kategori</label>

                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Deep Learning"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-border
                      bg-background
                      px-4
                      py-3
                      text-sm
                      text-foreground
                      outline-none
                      transition
                      placeholder:text-muted-foreground
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/10
                    "
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Week / Pekan</label>

                  <input
                    type="text"
                    name="week"
                    value={form.week}
                    onChange={handleChange}
                    placeholder="Pekan 1"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-border
                      bg-background
                      px-4
                      py-3
                      text-sm
                      text-foreground
                      outline-none
                      transition
                      placeholder:text-muted-foreground
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/10
                    "
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium">Deskripsi</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Deskripsi singkat laporan..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-border
                    bg-background
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-foreground
                    outline-none
                    transition
                    placeholder:text-muted-foreground
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/10
                  "
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="mb-2 block text-sm font-medium">Cover Image</label>

                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-dashed
                    border-border
                    bg-background
                  "
                >
                  {!coverPreview ? (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                      <div
                        className="
                          flex
                          h-14
                          w-14
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-border
                          bg-card
                        "
                      >
                        <ImageIcon size={24} className="text-muted-foreground" />
                      </div>

                      <p className="mt-4 text-sm font-medium">Pilih gambar cover</p>

                      <p className="mt-1 text-xs text-muted-foreground">JPG, JPEG, PNG, atau WEBP. Maksimal 5 MB.</p>

                      <label
                        className="
                          mt-5
                          inline-flex
                          cursor-pointer
                          items-center
                          gap-2
                          rounded-full
                          border
                          border-border
                          px-4
                          py-2.5
                          text-sm
                          font-medium
                          transition-all
                          hover:bg-secondary
                        "
                      >
                        <ImageIcon size={16} />
                        Pilih Gambar
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="p-5">
                      {/* Preview */}
                      <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
                        <img src={coverPreview} alt="Preview cover" className="h-64 w-full object-cover md:h-80" />
                      </div>

                      {/* Cover Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {!form.cover_image && (
                          <button
                            type="button"
                            onClick={handleUploadCover}
                            disabled={uploadingCover}
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              bg-primary
                              px-4
                              py-2.5
                              text-sm
                              font-medium
                              text-primary-foreground
                              transition-all
                              hover:-translate-y-0.5
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                            "
                          >
                            <Upload size={16} />

                            {uploadingCover ? "Mengupload..." : "Upload Cover"}
                          </button>
                        )}

                        <label
                          className="
                            inline-flex
                            cursor-pointer
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-border
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            transition-all
                            hover:bg-secondary
                          "
                        >
                          <ImageIcon size={16} />
                          Ganti Gambar
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleCoverChange}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleRemoveCover}
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-red-500/20
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-red-600
                            transition-all
                            hover:bg-red-500/10
                            dark:text-red-400
                          "
                        >
                          <X size={16} />
                          Hapus
                        </button>
                      </div>

                      {/* Upload Status */}
                      {form.cover_image && (
                        <p
                          className="
                            mt-3
                            inline-flex
                            items-center
                            gap-1.5
                            text-xs
                            text-emerald-600
                            dark:text-emerald-400
                          "
                        >
                          <Check size={14} />
                          Cover berhasil diupload.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-border
                    bg-background
                    px-4
                    py-3
                    text-sm
                    text-foreground
                    outline-none
                    transition
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/10
                  "
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Submit */}
              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  border-t
                  border-border
                  pt-6
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <button
                  type="button"
                  onClick={() => navigate("/admin/reports")}
                  className="
                    rounded-full
                    border
                    border-border
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-muted-foreground
                    transition-all
                    hover:bg-secondary
                    hover:text-foreground
                  "
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading || uploadingCover}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-full
                    px-6
                    py-3
                    text-sm
                    font-medium
                    border border-border
                    text-muted-foreground
                    hover:bg-secondary
                    hover:text-foreground
                    transition-all
                    hover:-translate-y-0.5
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading ? "Menyimpan..." : "Buat Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
