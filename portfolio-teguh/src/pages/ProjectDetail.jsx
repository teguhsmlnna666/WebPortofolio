import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  FolderOpen,
} from "lucide-react";

export default function ProjectDetail() {
  const { slug } = useParams();

  const project = projects.find(
    (item) => item.slug === slug
  );

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            404
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Project Tidak Ditemukan
          </h1>

          <p className="mt-3 text-muted-foreground">
            Project yang kamu cari tidak tersedia.
          </p>

          <Link
            to="/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            Kembali ke Projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 pb-12 pt-8 text-foreground md:px-10 lg:px-16">
      <article className="mx-auto max-w-5xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-primary">
              <FolderOpen size={14} />
              {project.category}
            </span>

            <span className="text-sm text-muted-foreground">
              Project #{String(project.id).padStart(2, "0")}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {project.title}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            {project.description}
          </p>
        </header>

        {/* =====================================================
            COVER IMAGE
        ====================================================== */}

        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card">
          <img
            src={project.image}
            alt={project.title}
            className="aspect-video w-full object-cover"
          />
        </div>

        {/* =====================================================
            PROJECT INFORMATION
        ====================================================== */}

        <section className="mt-10 grid gap-6 md:grid-cols-2">

          {/* Technology */}

          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-primary">
              Technologies
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech?.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Category */}

          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-primary">
              Category
            </p>

            <p className="mt-4 text-lg font-semibold">
              {project.category}
            </p>
          </div>
        </section>

        {/* =====================================================
            DESCRIPTION
        ====================================================== */}

        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">
            Tentang Project
          </h2>

          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
            {project.description}
          </p>
        </section>

        {/* =====================================================
            PROJECT LINK
        ====================================================== */}

        {project.github && project.github !== "#" && (
          <section className="mt-10">
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <ExternalLink size={16} />
              Lihat di GitHub
            </a>
          </section>
        )}

        {/* =====================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <div className="mt-16 border-t border-border pt-8">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-secondary"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Lihat semua project
          </Link>
        </div>
      </article>
    </main>
  );
}