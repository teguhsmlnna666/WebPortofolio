import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Image as ImageIcon, LogOut, Moon, Sun, Upload, X } from "lucide-react";

const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

function AdminProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const token = localStorage.getItem("admin_token");

  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }

    return false;
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [coverPreview, setCoverPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Web",
    status: "draft",
    tech_stack: "",
    github_url: "",
    demo_url: "",
    cover_image: "",
  });

  /*
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
    }
  }, [token, navigate]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Project Untuk Edit
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!isEdit || !token) {
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/admin/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil data project.");
        }

        const project = result.data;

        setForm({
          title: project.title || "",
          description: project.description || "",
          category: project.category || "Web",
          status: project.status || "draft",
          tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join(", ") : "",
          github_url: project.github_url || "",
          demo_url: project.demo_url || "",
          cover_image: project.cover_image || "",
        });

        if (project.cover_image) {
          setCoverPreview(`${STORAGE_URL}/${project.cover_image}`);
        }
      } catch (err) {
        console.error("Gagal mengambil project:", err);
        setError(err.message || "Gagal mengambil data project.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, isEdit, token]);

  /*
  |--------------------------------------------------------------------------
  | Theme
  |--------------------------------------------------------------------------
  */

  const toggleTheme = () => {
    const html = document.documentElement;
    const nextTheme = !isDark;

    html.classList.toggle("dark", nextTheme);

    localStorage.setItem("theme", nextTheme ? "dark" : "light");

    setIsDark(nextTheme);
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");

      navigate("/");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Form Input
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Cover Image
  |--------------------------------------------------------------------------
  */

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Format gambar harus JPG, JPEG, PNG, atau WEBP.");

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB.");

      event.target.value = "";
      return;
    }

    setError("");
    setSuccess("");

    setCoverFile(file);

    const previewUrl = URL.createObjectURL(file);

    setCoverPreview(previewUrl);

    /*
     * Karena gambar baru belum diupload,
     * path cover_image dikosongkan terlebih dahulu.
     */
    setForm((prev) => ({
      ...prev,
      cover_image: "",
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Upload Cover
  |--------------------------------------------------------------------------
  */

  const handleUploadCover = async () => {
    if (!coverFile) {
      setError("Silakan pilih gambar terlebih dahulu.");
      return;
    }

    try {
      setUploadingCover(true);
      setError("");
      setSuccess("");

      const uploadData = new FormData();

      uploadData.append("cover", coverFile);

      const response = await fetch(`${API_URL}/upload/cover`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengupload cover.");
      }

      /*
       * Menyesuaikan kemungkinan response:
       *
       * {
       *   success: true,
       *   data: {
       *      path: "projects/covers/..."
       *   }
       * }
       *
       * atau:
       *
       * {
       *   success: true,
       *   data: "projects/covers/..."
       * }
       */

      const uploadedPath = result?.data?.path || result?.data?.cover_image || result?.data?.url || result?.data;

      if (!uploadedPath) {
        throw new Error("Path gambar tidak ditemukan dari response upload.");
      }

      setForm((prev) => ({
        ...prev,
        cover_image: uploadedPath,
      }));

      setCoverFile(null);
      setSuccess("Cover berhasil diupload.");
    } catch (err) {
      console.error("Upload cover error:", err);
      setError(err.message || "Gagal mengupload cover.");
    } finally {
      setUploadingCover(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Cover
  |--------------------------------------------------------------------------
  */

  const handleRemoveCover = () => {
    setCoverPreview("");
    setCoverFile(null);

    setForm((prev) => ({
      ...prev,
      cover_image: "",
    }));

    setSuccess("");
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Judul project wajib diisi.");
      return;
    }

    /*
     * Jika ada gambar baru yang sudah dipilih tetapi belum
     * diupload melalui tombol Upload Cover, upload dahulu.
     */
    if (coverFile && !form.cover_image) {
      setError("Silakan klik tombol Upload Cover terlebih dahulu.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("status", form.status);

      /*
       * tech_stack dikirim sebagai array.
       */
      const techStack = form.tech_stack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      techStack.forEach((tech) => {
        formData.append("tech_stack[]", tech);
      });

      if (form.github_url.trim()) {
        formData.append("github_url", form.github_url.trim());
      }

      if (form.demo_url.trim()) {
        formData.append("demo_url", form.demo_url.trim());
      }

      /*
       * Jika cover sudah melalui endpoint upload/cover,
       * kirim path hasil upload.
       */
      if (form.cover_image) {
        formData.append("cover_image", form.cover_image);
      }

      let url = `${API_URL}/projects`;
      let method = "POST";

      if (isEdit) {
        url = `${API_URL}/projects/${id}`;

        /*
         * Laravel menerima PUT melalui method spoofing
         * ketika menggunakan multipart/form-data.
         */
        formData.append("_method", "PUT");
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        /*
         * Laravel validation error
         */
        if (result.errors) {
          const firstError = Object.values(result.errors)?.[0]?.[0];

          throw new Error(firstError || "Data project tidak valid.");
        }

        throw new Error(result.message || "Gagal menyimpan project.");
      }

      setSuccess(isEdit ? "Project berhasil diperbarui." : "Project berhasil ditambahkan.");

      setTimeout(() => {
        navigate("/admin/projects");
      }, 700);
    } catch (err) {
      console.error("Submit project error:", err);

      setError(err.message || "Gagal menyimpan project.");
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <p className="text-sm text-muted-foreground">Memuat project...</p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <div>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            to="/admin/projects"
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-border
              px-4
              py-2
              text-sm
              font-medium
              text-muted-foreground
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-secondary
              hover:text-foreground
            "
          >
            <ArrowLeft
              size={16}
              className="
                transition-transform
                duration-300
                group-hover:-translate-x-0.5
              "
            />
            Kembali ke Projects
          </Link>

          <div className="flex items-center gap-2">
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-border
                px-4
                py-2
                text-sm
                font-medium
                text-muted-foreground
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-secondary
                hover:text-foreground
              "
            >
              <LogOut size={15} />
              Logout
            </button>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="
                inline-flex
                items-center
                justify-center
                rounded-full
                border
                border-border
                p-2.5
                text-muted-foreground
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
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-6 pb-10 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Admin</p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {isEdit ? "Edit Project" : "Tambah Project"}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {isEdit
              ? "Perbarui informasi project yang ditampilkan pada portfolio."
              : "Tambahkan project baru yang akan ditampilkan pada portfolio."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="
              mb-6
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/5
              px-5
              py-4
              text-sm
              text-red-600
              dark:text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            className="
              mb-6
              rounded-2xl
              border
              border-emerald-500/20
              bg-emerald-500/5
              px-5
              py-4
              text-sm
              text-emerald-600
              dark:text-emerald-400
            "
          >
            {success}
          </div>
        )}

        {/* Form Card */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <form onSubmit={handleSubmit} className="space-y-7 p-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium">
                Judul Project
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Contoh: Expense Tracker"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  text-sm
                  text-foreground
                  outline-none
                  transition-all
                  placeholder:text-muted-foreground
                  focus:border-foreground
                "
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium">
                Deskripsi
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Jelaskan project secara singkat..."
                className="
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  text-sm
                  text-foreground
                  outline-none
                  transition-all
                  placeholder:text-muted-foreground
                  focus:border-foreground
                "
              />
            </div>

            {/* Category & Status */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Category */}
              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium">
                  Kategori
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-border
                    bg-background
                    px-4
                    py-3
                    text-sm
                    text-foreground
                    outline-none
                    transition-all
                    focus:border-foreground
                  "
                >
                  <option value="Web">Web</option>
                  <option value="Java">Java</option>
                  <option value="Mobile">Mobile</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-border
                    bg-background
                    px-4
                    py-3
                    text-sm
                    text-foreground
                    outline-none
                    transition-all
                    focus:border-foreground
                  "
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label htmlFor="tech_stack" className="mb-2 block text-sm font-medium">
                Tech Stack
              </label>

              <input
                id="tech_stack"
                name="tech_stack"
                type="text"
                value={form.tech_stack}
                onChange={handleChange}
                placeholder="React, Laravel, Tailwind CSS"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  text-sm
                  text-foreground
                  outline-none
                  transition-all
                  placeholder:text-muted-foreground
                  focus:border-foreground
                "
              />

              <p className="mt-2 text-xs text-muted-foreground">Pisahkan setiap teknologi menggunakan koma.</p>
            </div>

            {/* GitHub */}
            <div>
              <label htmlFor="github_url" className="mb-2 block text-sm font-medium">
                GitHub URL
              </label>

              <input
                id="github_url"
                name="github_url"
                type="url"
                value={form.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username/project"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  text-sm
                  text-foreground
                  outline-none
                  transition-all
                  placeholder:text-muted-foreground
                  focus:border-foreground
                "
              />
            </div>

            {/* Demo */}
            <div>
              <label htmlFor="demo_url" className="mb-2 block text-sm font-medium">
                Demo URL
              </label>

              <input
                id="demo_url"
                name="demo_url"
                type="url"
                value={form.demo_url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  text-sm
                  text-foreground
                  outline-none
                  transition-all
                  placeholder:text-muted-foreground
                  focus:border-foreground
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
                            border
                            border-border
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-muted-foreground
                            transition-all
                            duration-300
                            hover:-translate-y-0.5
                            hover:bg-secondary
                            hover:text-foreground
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
                          duration-300
                          hover:-translate-y-0.5
                          hover:bg-secondary
                          hover:text-foreground
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
                          duration-300
                          hover:-translate-y-0.5
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

            {/* Form Actions */}
            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-6">
              <Link
                to="/admin/projects"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-border
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-muted-foreground
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-secondary
                  hover:text-foreground
                "
              >
                <ArrowLeft size={16} />
                Batal
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-border
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-muted-foreground
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-secondary
                  hover:text-foreground
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Check size={16} />

                {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AdminProjectForm;
