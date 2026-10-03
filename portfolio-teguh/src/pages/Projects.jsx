import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

import Footer from "../components/ui/Footer";

const categories = ["All", "Web", "Java", "Mobile"];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        const result = await response.json();

        if (result.success) {
          setProjects(result.data);
        }
      } catch (error) {
        console.error("Gagal mengambil projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesCategory = activeCategory === "All" || project.category === activeCategory;

      if (!query) {
        return matchesCategory;
      }

      const searchableText = [project.title, project.description, project.category, ...(project.tech_stack || [])]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(query);
    });
  }, [projects, activeCategory, searchQuery]);

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setSearchQuery("");
    }

    setIsSearchOpen((prev) => !prev);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* =========================================================
          BACK BUTTON
      ========================================================== */}

      <Link
        to="/#portfolio"
        className="
          group fixed left-6 top-6 z-50
          inline-flex items-center gap-2
          rounded-full
          border border-border/70
          bg-background/70
          px-4 py-2.5
          text-sm font-medium
          text-muted-foreground
          shadow-lg
          backdrop-blur-xl
          transition-all duration-300
          hover:-translate-y-0.5
          hover:bg-secondary
          hover:text-foreground
        "
      >
        <ArrowLeft
          size={16}
          className="
            transition-transform duration-300
            group-hover:-translate-x-1
          "
        />

        <span>Back to Projects</span>
      </Link>

      {/* =========================================================
          SEARCH BAR
      ========================================================== */}

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{
              opacity: 0,
              scaleX: 0.92,
            }}
            animate={{
              opacity: 1,
              scaleX: 1,
            }}
            exit={{
              opacity: 0,
              scaleX: 0.92,
            }}
            transition={{
              duration: 0.2,
            }}
            style={{
              width: "min(600px, calc(100vw - 8rem))",
              transformOrigin: "right center",
            }}
            className="
              fixed right-32 top-6 z-50
              overflow-hidden
              rounded-full
              border border-border/70
              bg-background/70
              shadow-lg
              backdrop-blur-xl
            "
          >
            <div className="flex h-11 items-center gap-3 px-4">
              <Search size={17} className="shrink-0 text-muted-foreground" />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                autoFocus
                placeholder="Cari project..."
                className="
                  h-full
                  w-full
                  bg-transparent
                  text-sm
                  text-foreground
                  outline-none
                  placeholder:text-muted-foreground
                "
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Hapus pencarian"
                  className="
                    shrink-0
                    rounded-full
                    p-1.5
                    text-muted-foreground
                    transition-colors
                    hover:bg-secondary
                    hover:text-foreground
                  "
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          SEARCH BUTTON
      ========================================================== */}

      <button
        type="button"
        onClick={handleSearchToggle}
        aria-label={isSearchOpen ? "Tutup pencarian" : "Cari project"}
        className="
          fixed right-20 top-6 z-50
          rounded-full
          border border-border/70
          bg-background/70
          p-2.5
          text-muted-foreground
          shadow-lg
          backdrop-blur-xl
          transition-all duration-300
          hover:-translate-y-0.5
          hover:bg-secondary
          hover:text-foreground
        "
      >
        {isSearchOpen ? <X size={17} /> : <Search size={17} />}
      </button>

      {/* =========================================================
          HEADER
      ========================================================== */}

      <section className="px-6 pb-10 pt-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Portfolio & Projects</p>

            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
              My projects <span className="text-muted-foreground">& works.</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          FILTER
      ========================================================== */}

      <section className="px-6 pb-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Category Filter */}

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`
                    rounded-full
                    border
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition-all
                    duration-300
                    ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Result Count */}

          <p className="text-sm text-muted-foreground">
            {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
          </p>
        </div>
      </section>

      {/* =========================================================
          PROJECT CARDS
      ========================================================== */}

      <section className="px-6 pb-24 pt-2 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {filteredProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id || project.slug}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                  }}
                >
                  <Link
                    to={`/projects/${project.slug}`}
                    className="
                        group
                        flex
                        h-full
                        flex-col
                        overflow-hidden
                        rounded-[1.75rem]
                        border
                        border-border
                        bg-card
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-xl
                      "
                  >
                    {/* Image */}

                    <div className="relative aspect-video overflow-hidden bg-secondary">
                      <img
                        src={
                          project.cover_image
                            ? `${STORAGE_URL}/${project.cover_image}`
                            : "/images/project-placeholder.png"
                        }
                        alt={project.title}
                        className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-105
                          "
                      />

                      <div
                        className="
                            absolute inset-0
                            bg-black/10
                            opacity-0
                            transition-opacity
                            duration-300
                            group-hover:opacity-100
                          "
                      />
                    </div>

                    {/* Card Content */}

                    <div className="flex flex-1 flex-col p-6">
                      {/* Category */}

                      <div className="flex items-center justify-between">
                        <span
                          className="
                              rounded-full
                              border
                              border-border
                              px-3 py-1.5
                              text-xs
                              font-medium
                              text-muted-foreground
                            "
                        >
                          {project.category}
                        </span>

                        <span className="text-xs text-muted-foreground">{String(project.id).padStart(2, "0")}</span>
                      </div>

                      {/* Title */}

                      <h2
                        className="
                            mt-5
                            text-xl
                            font-semibold
                            leading-7
                            transition-colors
                            duration-300
                            group-hover:text-secondary
                          "
                      >
                        {project.title}
                      </h2>

                      {/* Description */}

                      <p
                        className="
                            mt-3
                            line-clamp-3
                            text-sm
                            leading-6
                            text-muted-foreground
                          "
                      >
                        {project.description}
                      </p>

                      {/* Technologies */}

                      {project.tech_stack?.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {project.tech_stack.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="
                                    rounded-full
                                    bg-secondary/60
                                    px-2.5 py-1
                                    text-[11px]
                                    font-medium
                                    text-muted-foreground
                                  "
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* View Project */}

                      <div
                        className="
                            mt-auto
                            flex
                            items-center
                            justify-between
                            border-t
                            border-border
                            pt-5
                          "
                      >
                        <span className="text-sm font-medium">Lihat project</span>

                        <span
                          className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-border
                              transition-all
                              duration-300
                              group-hover:bg-secondary
                            "
                        >
                          <ArrowRight
                            size={16}
                            className="
                                transition-transform
                                duration-300
                                group-hover:translate-x-0.5
                              "
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            /* =====================================================
               EMPTY STATE
            ====================================================== */

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="
                flex
                min-h-[300px]
                flex-col
                items-center
                justify-center
                rounded-[2rem]
                border
                border-dashed
                border-border
                px-6
                text-center
              "
            >
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
                <Search size={22} className="text-muted-foreground" />
              </div>

              <h2 className="mt-5 text-xl font-semibold">Project tidak ditemukan</h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Tidak ada project yang sesuai dengan pencarian atau kategori yang dipilih.
              </p>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                }}
                className="
                  mt-6
                  rounded-full
                  bg-primary
                  px-5 py-3
                  text-sm
                  font-medium
                  text-primary-foreground
                  transition-transform
                  hover:-translate-y-0.5
                "
              >
                Reset Filter
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <div className="border-t border-border" />
      {/* =====================================================
                FOOTER
            ====================================================== */}
      <Footer />
    </main>
  );
}
