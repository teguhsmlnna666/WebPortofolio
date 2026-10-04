import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Moon, Sun, Plus, Pencil, Trash2 } from "lucide-react";

import Toast from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
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
   * CEK LOGIN & AMBIL DATA
   * ============================================
   */

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchReports();
  }, []);

  /*
   * ============================================
   * FETCH REPORTS
   * ============================================
   */

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/reports`, {
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data laporan.");
      }

      setReports(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================
   * DELETE REPORT
   * ============================================
   */

  const handleDelete = (id) => {
    setConfirmDelete({
      open: true,
      id,
    });
  };

  const confirmDeleteReport = async () => {
    const id = confirmDelete.id;

    if (!id) return;

    setConfirmDelete({
      open: false,
      id: null,
    });

    try {
      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus laporan.");
      }

      setReports((currentReports) => currentReports.filter((report) => report.id !== id));

      showToast("Laporan berhasil dihapus.", "success");
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
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Hapus Laporan?"
        message="Yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDeleteReport}
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
          {/* Back to Dashboard */}

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

          {/* Admin Controls */}

          <div className="flex items-center gap-2">
            {/* Logout */}

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

            {/* Theme Toggle */}

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
          {/* <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Admin</p> */}

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Reports</h1>
{/* 
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Kelola laporan praktikum portfolio, mulai dari membuat, mengedit, hingga menghapus laporan.
          </p> */}
        </header>

        {/* ======================================
            REPORT HEADER
        ======================================= */}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Daftar Laporan</h2>

            <p className="mt-2 text-sm text-muted-foreground">{reports.length} laporan</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/reports/new")}
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
              transition-transform
              hover:-translate-y-0.5
            "
          >
            <Plus size={16} />
            Tambah Laporan
          </button>
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
            <p className="text-sm text-muted-foreground">Memuat laporan...</p>
          </div>
        ) : reports.length === 0 ? (
          /* ======================================
             EMPTY STATE
          ======================================= */

          <div className="mt-6 rounded-3xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Belum ada laporan.</p>

            <button
              type="button"
              onClick={() => navigate("/admin/reports/new")}
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
              Tambah Laporan
            </button>
          </div>
        ) : (
          /* ======================================
             REPORT TABLE
          ======================================= */

          <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Judul</th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Kategori</th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Week</th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-border last:border-b-0">
                      {/* Judul */}

                      <td className="px-6 py-5">
                        <div>
                          <p className="font-medium text-foreground">{report.title}</p>

                          <p className="mt-1 text-xs text-muted-foreground">/{report.slug}</p>
                        </div>
                      </td>

                      {/* Kategori */}

                      <td className="px-6 py-5 text-sm text-muted-foreground">{report.category}</td>

                      {/* Week */}

                      <td className="px-6 py-5 text-sm text-muted-foreground">{report.week || "-"}</td>

                      {/* Status */}

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                          {report.status}
                        </span>
                      </td>

                      {/* Aksi */}

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          {/* Edit */}

                          <button
                            type="button"
                            onClick={() => navigate(`/admin/reports/${report.id}/edit`)}
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
                          </button>

                          {/* Hapus */}

                          <button
                            type="button"
                            onClick={() => handleDelete(report.id)}
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
