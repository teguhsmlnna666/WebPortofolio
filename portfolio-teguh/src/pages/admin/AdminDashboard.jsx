import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText, FolderKanban, Image, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }

    return false;
  });

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
      const token = localStorage.getItem("admin_token");

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

      navigate("/");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <div>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            to="/reports"
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
            Back to Reports
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

            {/* Theme Toggle */}
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
      <div className="mx-auto max-w-5xl px-6 pt-0 pb-8 lg:px-8 lg:pt-0 lg:pb-10">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Admin</p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Manage Portfolio</h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Tempat mengelola konten portfolio.</p>
        </div>

        {/* Menu */}
        <div className="space-y-4">
          {/* Reports */}
          <Link
            to="/admin/reports"
            className="
              group
              block
              rounded-[1.75rem]
              border
              border-border
              bg-card
              p-6
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <div className="flex items-center gap-5">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-border
                  text-foreground
                "
              >
                <FileText size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">Reports</h2>

                <p className="mt-1 text-sm text-muted-foreground">Kelola laporan praktikum portfolio.</p>
              </div>

              <ArrowRight
                size={20}
                className="
                  shrink-0
                  text-muted-foreground
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                  group-hover:text-foreground
                "
              />
            </div>
          </Link>

          {/* Projects */}
          <Link
            to="/admin/projects"
            className="
    group
    block
    rounded-[1.75rem]
    border
    border-border
    bg-card
    p-6
    shadow-sm
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-lg
  "
          >
            <div className="flex items-center gap-5">
              <div
                className="
        flex
        h-12
        w-12
        shrink-0
        items-center
        justify-center
        rounded-2xl
        border
        border-border
        text-foreground
      "
              >
                <FolderKanban size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">Projects</h2>

                <p className="mt-1 text-sm text-muted-foreground">Kelola project yang ditampilkan pada portfolio.</p>
              </div>

              <ArrowRight
                size={20}
                className="
        shrink-0
        text-muted-foreground
        transition-transform
        duration-300
        group-hover:translate-x-1
        group-hover:text-foreground
      "
              />
            </div>
          </Link>

          {/* Gallery */}
          <div
            className="
              rounded-[1.75rem]
              border
              border-border
              bg-card
              p-6
              shadow-sm
              transition-all
              duration-300
            "
          >
            <div className="flex items-center gap-5">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-border
                  text-muted-foreground
                "
              >
                <Image size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold">Gallery</h2>

                  <span
                    className="
                      rounded-full
                      border
                      border-border
                      px-3
                      py-1
                      text-xs
                      font-medium
                      text-muted-foreground
                    "
                  >
                    Coming Soon
                  </span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Kelola foto dan karya yang ditampilkan pada gallery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
