import { useEffect, useMemo, useState } from "react";
import { Link} from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Search, X} from "lucide-react";
import { motion } from "motion/react";

import Footer from "../components/ui/Footer";

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;

const categories = ["All", "Deep Learning", "Big Data", "Mobile", "Web"];

export default function Reports() {
  const [activeCategory, setActiveCategory] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  /* =========================================================
     DATA DARI LARAVEL
  ========================================================== */

  const [apiReports, setApiReports] = useState([]);

  const [loadingApiReports, setLoadingApiReports] = useState(true);

  /* =========================================================
     AMBIL REPORT DARI LARAVEL
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const fetchReports = async () => {
      try {
        setLoadingApiReports(true);

        const response = await fetch(`${API_URL}/reports`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil laporan dari API.");
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data) && !cancelled) {
          /*
           * Hanya laporan published yang
           * ditampilkan ke halaman publik.
           */
          const publishedReports = data.data.filter((report) => report.status === "published");

          setApiReports(publishedReports);
        }
      } catch (error) {
        /*
         * Jika Laravel sedang tidak aktif,
         * halaman tidak menampilkan data laporan.
         */
        console.error("Gagal mengambil laporan Laravel:", error);

        if (!cancelled) {
          setApiReports([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingApiReports(false);
        }
      }
    };

    fetchReports();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     FORMAT REPORT DARI LARAVEL
  ========================================================== */

  const allReports = useMemo(() => {
    return apiReports
      .map((report) => ({
        ...report,

        source: "api",

        /*
         * Reports.jsx menggunakan
         * report.image.
         */
        image: report.cover_image ? getImageUrl(report.cover_image) : null,

        /*
         * Reports.jsx menggunakan
         * report.date.
         */
        date: report.week ? `Pekan ${report.week}` : formatDate(report.created_at),

        /*
         * Backend belum memiliki
         * tags seperti reports.js.
         */
        tags: [],
      }))
      .sort((a, b) => {
        const weekA = Number(a.week) || 0;
        const weekB = Number(b.week) || 0;

        return weekB - weekA;
      });
  }, [apiReports]);

  /* =========================================================
     FILTER REPORT
  ========================================================== */

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allReports.filter((report) => {
      const matchesCategory = activeCategory === "All" || report.category === activeCategory;

      if (!query) {
        return matchesCategory;
      }

      const searchableText = [report.title, report.description, report.category, ...(report.tags || [])]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(query);
    });
  }, [allReports, activeCategory, searchQuery]);

  /* =========================================================
     SEARCH TOGGLE
  ========================================================== */

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setSearchQuery("");
    }

    setIsSearchOpen((prev) => !prev);
  };

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* =========================================================
          BACK BUTTON
      ========================================================== */}

      <Link
        to="/#reports"
        className="
          group
          fixed
          left-6
          top-6
          z-50
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
        <ArrowLeft
          size={16}
          className="
            transition-transform
            duration-300
            group-hover:-translate-x-1
          "
        />

        <span>Back to Reports</span>
      </Link>

      {/* =========================================================
          SEARCH BAR
      ========================================================== */}

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
            width: "min(500px, calc(100vw - 18rem))",
            transformOrigin: "right center",
          }}
          className="
      fixed
      right-44
      top-6
      z-50
      overflow-hidden
      rounded-full
      border
      border-border/70
      bg-background/70
      shadow-lg
      backdrop-blur-xl
    "
        >
          <div className="flex h-10 items-center gap-3 px-4">
            <Search size={17} className="shrink-0 text-muted-foreground" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoFocus
              placeholder="Cari laporan..."
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

      {/* =========================================================
          TOP RIGHT CONTROLS
      ========================================================== */}

      <div
        className="
          fixed
          right-20
          top-6
          z-50
          flex
          items-center
          gap-2
        "
      >
        {/* Search */}

        <button
          type="button"
          onClick={handleSearchToggle}
          aria-label={isSearchOpen ? "Tutup pencarian" : "Cari laporan"}
          title={isSearchOpen ? "Tutup pencarian" : "Cari laporan"}
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
          {isSearchOpen ? <X size={17} /> : <Search size={17} />}
        </button>
      </div>

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
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Reports & Documentation</p>

            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
              My learning <span className="text-muted-foreground">process & documentation.</span>
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
            {loadingApiReports
              ? "Memuat..."
              : `${filteredReports.length} ${filteredReports.length === 1 ? "report" : "reports"}`}
          </p>
        </div>
      </section>

      {/* =========================================================
          REPORT CARDS
      ========================================================== */}

      <section className="px-6 pb-24 pt-2 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {filteredReports.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id || report.slug}
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
                    to={`/reports/${report.slug}`}
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
                      {report.image ? (
                        <img
                          src={report.image}
                          alt={report.title}
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-105
                          "
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-6 text-center">
                          <span className="text-sm text-muted-foreground">Cover image belum tersedia</span>
                        </div>
                      )}

                      <div
                        className="
                          absolute
                          inset-0
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
                      {/* Category + Date */}

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="
                            rounded-full
                            border
                            border-border
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-muted-foreground
                          "
                        >
                          {report.category}
                        </span>

                        {report.date && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              text-xs
                              text-muted-foreground
                            "
                          >
                            <CalendarDays size={14} />

                            {report.date}
                          </span>
                        )}
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
                        {report.title}
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
                        {report.description}
                      </p>

                      {/* Tags */}

                      {report.tags?.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {report.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="
                                rounded-full
                                bg-secondary/60
                                px-2.5
                                py-1
                                text-[11px]
                                font-medium
                                text-muted-foreground
                              "
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Read Report */}

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
                        <span className="text-sm font-medium">Baca laporan</span>

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

              <h2 className="mt-5 text-xl font-semibold">Laporan tidak ditemukan</h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Tidak ada laporan yang sesuai dengan pencarian atau kategori yang dipilih.
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
                  px-5
                  py-3
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

/* =========================================================
   IMAGE URL HELPER
========================================================== */

function getImageUrl(path) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${STORAGE_URL}/${path}`;
}

/* =========================================================
   DATE FORMAT
========================================================== */

function formatDate(date) {
  if (!date) {
    return "";
  }

  try {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return date;
  }
}
