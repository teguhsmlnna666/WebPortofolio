import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Image as ImageIcon, Moon, Save, Sun, Upload, X } from "lucide-react";

import ReportBlockEditor from "../../components/admin/ReportBlockEditor";
import Toast from "../../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;

export default function AdminReportEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState("");

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("admin_token");

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
    }

    fetchReport();
  }, [id]);

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

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data laporan.");
      }

      const foundReport = data.data.find((item) => item.id === Number(id));

      if (!foundReport) {
        throw new Error("Laporan tidak ditemukan.");
      }

      setReport({
        ...foundReport,
        blocks: foundReport.blocks || [],
      });

      if (foundReport.cover_image) {
        const coverUrl = foundReport.cover_image.startsWith("http")
          ? foundReport.cover_image
          : `${STORAGE_URL}/${foundReport.cover_image}`;

        setCoverPreview(coverUrl);
      } else {
        setCoverPreview("");
      }

      setCoverFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshReport = async () => {
    await fetchReport();
  };

  const handleChange = (field, value) => {
    setReport((current) => ({
      ...current,
      [field]: value,
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
  };

  const handleUploadCover = async () => {
    if (!coverFile) {
      setError("Pilih gambar cover terlebih dahulu.");

      showToast("Pilih gambar cover terlebih dahulu.", "error");

      return;
    }

    setUploadingCover(true);
    setError("");

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

      const uploadedPath = data.data.path;
      const uploadedUrl = data.data.url;

      setCoverPreview(uploadedUrl);

      setReport((current) => ({
        ...current,
        cover_image: uploadedPath,
      }));

      setCoverFile(null);

      showToast("Cover berhasil diupload.", "success");
    } catch (err) {
      setError(err.message);

      showToast(err.message || "Gagal mengupload cover.", "error");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview("");

    setReport((current) => ({
      ...current,
      cover_image: null,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const requestData = {
        title: report.title,
        slug: report.slug,
        category: report.category,
        week: report.week,
        description: report.description,
        cover_image: report.cover_image || null,
        status: report.status,
      };

      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan perubahan laporan.");
      }

      setReport({
        ...data.data,
        blocks: data.data.blocks || [],
      });

      if (data.data.cover_image) {
        const coverUrl = data.data.cover_image.startsWith("http")
          ? data.data.cover_image
          : `${STORAGE_URL}/${data.data.cover_image}`;

        setCoverPreview(coverUrl);
      } else {
        setCoverPreview("");
      }

      showToast("Laporan berhasil disimpan.", "success");
    } catch (err) {
      setError(err.message);

      showToast(err.message || "Gagal menyimpan perubahan laporan.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              border
              border-border
              bg-card
            "
          >
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">Memuat laporan...</p>
        </div>
      </main>
    );
  }

  if (error && !report) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <div
          className="
            rounded-[1.75rem]
            border
            border-border
            bg-card
            p-8
            shadow-sm
          "
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>

          <button
            type="button"
            onClick={() => navigate("/admin/reports")}
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-primary
              px-5
              py-2.5
              text-sm
              font-medium
              text-primary-foreground
              transition-all
              hover:-translate-y-0.5
            "
          >
            <ArrowLeft size={16} />
            Kembali ke Reports
          </button>
        </div>
      </main>
    );
  }

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
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Admin / Reports / Edit</p>

          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Edit laporan</h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Kelola informasi dan isi laporan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingCover}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-full
                px-5
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
              <Save size={16} />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
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

          {/* Informasi Laporan */}
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
            <div className="mb-7">
              <h2 className="text-xl font-semibold">Informasi Laporan</h2>

              <p className="mt-1 text-sm text-muted-foreground">Perbarui informasi dasar laporan.</p>
            </div>

            <div className="space-y-7">
              {/* Judul */}
              <div>
                <label className="mb-2 block text-sm font-medium">Judul</label>

                <input
                  type="text"
                  value={report.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
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
                  placeholder="Masukkan judul laporan"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-sm font-medium">Slug</label>

                <input
                  type="text"
                  value={report.slug || ""}
                  onChange={(e) => handleChange("slug", e.target.value)}
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
                  placeholder="contoh: praktikum-deep-learning"
                />
              </div>

              {/* Category + Week */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Kategori</label>

                  <input
                    type="text"
                    value={report.category || ""}
                    onChange={(e) => handleChange("category", e.target.value)}
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
                    placeholder="Contoh: Deep Learning"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Week / Pekan</label>

                  <input
                    type="text"
                    value={report.week || ""}
                    onChange={(e) => handleChange("week", e.target.value)}
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
                    placeholder="Contoh: Pekan 1"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium">Deskripsi</label>

                <textarea
                  rows={4}
                  value={report.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
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
                  placeholder="Masukkan deskripsi laporan"
                />
              </div>

              {/* Cover */}
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

                      <p className="mt-4 text-sm font-medium">Belum ada cover</p>

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
                      <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
                        <img src={coverPreview} alt="Cover laporan" className="h-64 w-full object-cover md:h-80" />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {coverFile && (
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

                      {coverFile && (
                        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">⚠ Gambar baru belum diupload.</p>
                      )}

                      {!coverFile && report.cover_image && (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                          <Check size={14} />
                          Cover tersimpan.
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
                  value={report.status || "draft"}
                  onChange={(e) => handleChange("status", e.target.value)}
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

              {/* Save */}
              <div className="flex justify-end border-t border-border pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || uploadingCover}
                  className="
                    inline-flex
                    items-center
                    gap-2
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
                  <Save size={16} />

                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>

          {/* Isi Laporan */}
          <div className="mt-10">
            <div className="mb-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Content</p>

              <h2 className="mt-2 text-2xl font-semibold">Isi Laporan</h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Susun laporan menggunakan block seperti heading, paragraf, kode, dan divider.
              </p>
            </div>

            <ReportBlockEditor reportId={report.id} initialBlocks={report.blocks} onSaved={refreshReport} />
          </div>
        </div>
      </section>
    </main>
  );
}
