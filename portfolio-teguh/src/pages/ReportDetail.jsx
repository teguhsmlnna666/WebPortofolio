import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarDays, FolderOpen } from "lucide-react";

const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

export default function ReportDetail() {
  const { slug } = useParams();

  const [apiReport, setApiReport] = useState(null);

  const [loading, setLoading] = useState(true);

  /*
   * ============================================
   * AMBIL DATA DARI LARAVEL
   * ============================================
   */

  useEffect(() => {
    let cancelled = false;

    const fetchReport = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/reports/${slug}`, {
          headers: {
            Accept: "application/json",
          },
        });

        /*
         * Jika Laravel tidak menemukan report,
         * kita tetap menggunakan reports.js.
         */
        if (!response.ok) {
          if (!cancelled) {
            setApiReport(null);
          }

          return;
        }

        const data = await response.json();

        if (data.success && data.data && !cancelled) {
          setApiReport(data.data);
        }
      } catch (error) {
        if (!cancelled) {
          setApiReport(null);
        }

        console.error("Gagal mengambil laporan dari API:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /*
   * ============================================
   * LOADING
   * ============================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <p className="text-sm text-muted-foreground">Memuat laporan...</p>
      </main>
    );
  }

  const report = apiReport;

  /*
   * ============================================
   * 404
   * ============================================
   */

  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">404</p>

          <h1 className="mt-3 text-3xl font-bold">Laporan Tidak Ditemukan</h1>

          <p className="mt-3 text-muted-foreground">Laporan yang kamu cari tidak tersedia.</p>

          <Link
            to="/reports"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            Kembali ke Reports
          </Link>
        </div>
      </main>
    );
  }

  /*
   * ============================================
   * CEK APAKAH INI DATA LARAVEL
   * ============================================
   */

  const category = report.category;
  const date = report.week ? `Pekan ${report.week}` : formatDate(report.created_at);
  const title = report.title;
  const description = report.description || "";
  const coverImage = report.cover_image ? getImageUrl(report.cover_image) : null;

  return (
    <main className="min-h-screen bg-background px-6 pb-12 pt-8 text-foreground md:px-10 lg:px-16">
      <article className="mx-auto max-w-4xl">
        {/* ======================================
            HEADER
        ======================================= */}

        <header>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-primary">
              <FolderOpen size={14} />
              {category}
            </span>

            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays size={15} />
              {date}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">{title}</h1>

          {description && <p className="mt-5 text-lg leading-8 text-muted-foreground">{description}</p>}
        </header>

        {/* ======================================
            COVER IMAGE
        ======================================= */}

        {coverImage && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card">
            <img src={coverImage} alt={title} className="aspect-video w-full object-cover" />
          </div>
        )}

        {/* ======================================
            CONTENT
        ======================================= */}

        <div className="mt-12">
          <BlockRenderer blocks={report.blocks || []} />
        </div>

        {/* ======================================
            BOTTOM NAVIGATION
        ======================================= */}

        <div className="mt-16 border-t border-border pt-8">
          <Link
            to="/reports"
            className="group inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-secondary"
          >
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
            Lihat semua laporan
          </Link>
        </div>
      </article>
    </main>
  );
}

/*
 * ==================================================
 * BLOCK RENDERER
 * ==================================================
 */

function BlockRenderer({ blocks = [] }) {
  return (
    <div className="text-base leading-8 text-muted-foreground">
      {blocks
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((block) => (
          <RenderBlock key={block.id} block={block} />
        ))}
    </div>
  );
}

/*
 * ==================================================
 * RENDER SATU BLOCK
 * ==================================================
 */

function RenderBlock({ block }) {
  const metadata = block.metadata || {};

  /*
   * ===============================================
   * PARAGRAPH
   * ===============================================
   */

  if (block.type === "paragraph") {
    return <p className="mb-6 whitespace-pre-line">{block.content}</p>;
  }

  /*
   * ===============================================
   * HEADING
   * ===============================================
   */

  if (block.type === "heading") {
    return <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-foreground">{block.content}</h2>;
  }

  /*
   * ===============================================
   * BULLET LIST
   * ===============================================
   */

  if (block.type === "bullet_list") {
    const items = (block.content || "").split("\n").filter((item) => item.trim() !== "");

    return (
      <ul className="mb-6 list-disc space-y-2 pl-6">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  /*
   * ===============================================
   * NUMBERED LIST
   * ===============================================
   */

  if (block.type === "numbered_list") {
    const items = (block.content || "").split("\n").filter((item) => item.trim() !== "");

    return (
      <ol className="mb-6 list-decimal space-y-2 pl-6">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  }

  /*
   * ===============================================
   * QUOTE
   * ===============================================
   */

  if (block.type === "quote") {
    return (
      <blockquote className="my-6 border-l-2 border-primary pl-5 italic text-muted-foreground">
        {block.content}
      </blockquote>
    );
  }

  /*
   * ===============================================
   * CODE
   * ===============================================
   */

  if (block.type === "code") {
    return (
      <div className="my-6 overflow-hidden rounded-xl border border-border bg-gray-950">
        {metadata.language && (
          <div className="border-b border-white/10 px-4 py-2 text-xs text-gray-400">{metadata.language}</div>
        )}

        <pre className="overflow-x-auto p-5 text-sm leading-6 text-white">
          <code>{block.content || ""}</code>
        </pre>
      </div>
    );
  }

  /*
   * ===============================================
   * LINK
   * ===============================================
   */

  if (block.type === "link") {
    const label = metadata.label || block.content || "Buka Link";
    const url = metadata.url || "";

    if (!url) {
      return null;
    }

    return (
      <div className="my-6">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-border
          px-5
          py-3
          text-sm
          font-medium
          text-primary
          transition-all
          hover:-translate-y-0.5
          hover:bg-secondary
        "
        >
          {label}

          <ArrowUpRight size={16} />
        </a>
      </div>
    );
  }

  /*
   * ===============================================
   * IMAGE
   * ===============================================
   */

  if (block.type === "image") {
    const imageUrl = metadata.url || (block.content ? `${STORAGE_URL}/${block.content}` : "");

    if (!imageUrl) {
      return null;
    }

    const alignment = metadata.alignment || "center";

    return (
      <figure className="my-8">
        <div
          className={`flex ${
            alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center"
          }`}
        >
          <img
            src={imageUrl}
            alt={metadata.caption || "Gambar laporan"}
            className="max-w-full rounded-xl border border-border object-contain"
          />
        </div>

        {metadata.caption && (
          <figcaption className="mt-3 text-center text-sm text-muted-foreground">{metadata.caption}</figcaption>
        )}
      </figure>
    );
  }

  /*
   * ===============================================
   * TABLE
   * ===============================================
   */

  if (block.type === "table") {
    const headers = metadata.headers || [];

    const rows = metadata.rows || [];

    if (headers.length === 0) {
      return null;
    }

    return (
      <div className="my-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="border-b border-r border-border bg-secondary px-4 py-3 text-left font-semibold text-foreground last:border-r-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border last:border-b-0">
                {headers.map((_, columnIndex) => (
                  <td key={columnIndex} className="border-r border-border px-4 py-3 last:border-r-0">
                    {row[columnIndex] || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /*
   * ===============================================
   * DIVIDER
   * ===============================================
   */

  if (block.type === "divider") {
    return (
      <div className="my-10">
        <hr className="border-border" />
      </div>
    );
  }

  /*
   * ===============================================
   * FALLBACK
   * ===============================================
   */

  return null;
}

/*
 * ==================================================
 * IMAGE URL HELPER
 * ==================================================
 */

function getImageUrl(path) {
  if (!path) {
    return "";
  }

  /*
   * Kalau sudah URL lengkap,
   * gunakan langsung.
   */
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  /*
   * Kalau path dari Laravel storage.
   */
  return `${STORAGE_URL}/${path}`;
}

/*
 * ==================================================
 * DATE FORMAT
 * ==================================================
 */

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
