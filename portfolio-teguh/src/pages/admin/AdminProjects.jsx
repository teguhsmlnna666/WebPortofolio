import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Moon, Sun, Plus, Pencil, Trash2 } from "lucide-react";

import Toast from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const API_URL = "http://127.0.0.1:8000/api";

export default function AdminProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const token = localStorage.getItem("admin_token");

  /*
   * ============================================
   * TOAST
   * ============================================
   */

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  /*
   * ============================================
   * CEK LOGIN
   * ============================================
   */

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchProjects();
  }, []);

  /*
   * ============================================
   * FETCH PROJECTS
   * ============================================
   */

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data project.");
      }

      setProjects(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================
   * DELETE PROJECT
   * ============================================
   */

  const handleDelete = (id) => {
    setConfirmDelete({
      open: true,
      id,
    });
  };

  const confirmDeleteProject = async () => {
    const id = confirmDelete.id;

    if (!id) return;

    setConfirmDelete({
      open: false,
      id: null,
    });

    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus project.");
      }

      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== id));

      showToast("Project berhasil dihapus.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  /*
   * ============================================
   * LOGOUT
   * ============================================
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
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");

    navigate("/");
  };

  /*
   * ============================================
   * DARK / LIGHT MODE
   * ============================================
   */

  const toggleTheme = () => {
    const html = document.documentElement;
    const nextTheme = !isDark;

    html.classList.toggle("dark", nextTheme);

    localStorage.setItem("theme", nextTheme ? "dark" : "light");

    setIsDark(nextTheme);
  };

  return (
    <main className="min-h-screen bg-background px-6 pb-24 pt-8 text-foreground md:px-10 lg:px-16">
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />

      <ConfirmDialog
        open={confirmDelete.open}
        title="Hapus Project?"
        message="Yakin ingin menghapus project ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDeleteProject}
        onCancel={() =>
          setConfirmDelete({
            open: false,
            id: null,
          })
        }
      />

      <div className="mx-auto max-w-7xl">
        {/* ======================================
            TOP NAVIGATION
        ======================================= */}

        <div className="flex items-center justify-between">
          <Link
            to="/admin"
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
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
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
                text-foreground
                transition-all
                hover:-translate-y-0.5
                hover:bg-secondary
              "
            >
              <LogOut size={15} />
              Logout
            </button>

            <button
              type="button"
              onClick={toggleTheme}
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
                text-foreground
                transition-all
                hover:-translate-y-0.5
                hover:bg-secondary
              "
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {/* ======================================
            PAGE HEADER
        ======================================= */}

        <header className="mt-5">
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Projects</h1>
        </header>

        {/* ======================================
            PROJECT HEADER
        ======================================= */}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Daftar Project</h2>

            <p className="mt-2 text-sm text-muted-foreground">{projects.length} project</p>
          </div>

          <Link
            to="/admin/projects/create"
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
            <Plus size={16} />
            Tambah Project
          </Link>
        </div>

        {/* ======================================
            ERROR
        ======================================= */}

        {error && (
          <div className="mt-6 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-foreground">{error}</div>
        )}

        {/* ======================================
            LOADING / EMPTY / TABLE
        ======================================= */}

        {loading ? (
          <div className="mt-6 rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">Memuat project...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Belum ada project.</p>

            <Link
              to="/admin/projects/create"
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-primary
                px-5
                py-3
                text-sm
                font-medium
                text-primary-foreground
                transition-transform
                hover:-translate-y-0.5
              "
            >
              <Plus size={16} />
              Tambah Project
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">No</th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Project</th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Kategori</th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project, index) => (
                    <tr key={project.id} className="border-b border-border last:border-b-0">
                      <td className="px-6 py-5 text-sm text-muted-foreground">{index + 1}</td>

                      <td className="px-6 py-5">
                        <div>
                          <p className="font-medium text-foreground">{project.title}</p>

                          <p className="mt-1 text-xs text-muted-foreground">/{project.slug}</p>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-muted-foreground">{project.category || "-"}</td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                          {project.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/projects/${project.id}/edit`}
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              border
                              border-border
                              px-3.5
                              py-2
                              text-xs
                              font-medium
                              text-foreground
                              transition-all
                              hover:-translate-y-0.5
                              hover:bg-secondary
                            "
                          >
                            <Pencil size={13} />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(project.id)}
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              border
                              border-border
                              px-3.5
                              py-2
                              text-xs
                              font-medium
                              text-foreground
                              transition-all
                              hover:-translate-y-0.5
                              hover:bg-secondary
                            "
                          >
                            <Trash2 size={13} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
