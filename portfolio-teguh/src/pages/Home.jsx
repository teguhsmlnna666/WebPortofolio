import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  Database,
  ExternalLink,
  GraduationCap,
  Layers3,
  Mail,
  MapPin,
  Smartphone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";
import CardFanCarousel from "../components/ui/card-fan-carousel";
import Footer from "../components/ui/Footer";
import Toast from "../components/ui/Toast";
import { gallery } from "../data/gallery";

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;

const skills = [
  {
    icon: Code2,
    title: "Web Development",
    description: "Membangun antarmuka website dengan HTML, CSS, JavaScript, React, dan teknologi web lainnya.",
    tags: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    icon: Layers3,
    title: "Programming",
    description: "Mempelajari konsep pemrograman, algoritma, struktur data, OOP, serta pengembangan aplikasi.",
    tags: ["Java", "Python", "Kotlin"],
  },
  {
    icon: Smartphone,
    title: "Mobile Development",
    description: "Mengembangkan aplikasi mobile menggunakan Flutter dan memahami konsep widget serta layouting.",
    tags: ["Flutter", "Dart", "Android"],
  },
  {
    icon: Database,
    title: "Data & AI",
    description: "Mengeksplorasi data science, machine learning, deep learning, dan pengolahan data.",
    tags: ["Python", "PyTorch", "Pandas"],
  },
];

const journey = [
  {
    year: "2024",
    title: "Memulai Perjalanan Informatika",
    description: "Memulai perkuliahan Informatika di Universitas Andalas dan membangun fondasi pemrograman.",
  },
  {
    year: "2025",
    title: "Web & Mobile Development",
    description: "Mulai mengembangkan berbagai proyek web dan mempelajari pengembangan aplikasi mobile.",
  },
  {
    year: "2026",
    title: "Data, AI & Software Development",
    description:
      "Memperluas pembelajaran ke bidang data, machine learning, deep learning, serta pengembangan software.",
  },
];

function SectionHeading({ number, eyebrow, title, description }) {
  return (
    <div className="mb-14 grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
      <div>
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span className="text-secondary">{number}</span>
          {eyebrow}
        </p>
      </div>

      <div>
        <h2 className="max-w-4xl text-4xl font-bold leading-tight tracking-[-0.035em] sm:text-5xl lg:text-6xl">
          {title}
        </h2>

        {description && <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export default function Home() {
  const [projectFilter, setProjectFilter] = useState("All");

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);

  const projectCategories = ["All", "Web", "Java", "Mobile"];

  const filteredProjects =
    projectFilter === "All" ? projects : projects.filter((project) => project.category === projectFilter);

  const [contactSending, setContactSending] = useState(false);
  const [contactToast, setContactToast] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (contactSending) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    setContactSending(true);
    setContactToast(null);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const validationMessage = data.errors ? Object.values(data.errors).flat()[0] : data.message;

        throw new Error(validationMessage || "Gagal mengirim pesan.");
      }

      form.reset();

      setContactToast({
        message: "Pesan berhasil dikirim.",
        type: "success",
      });
    } catch (error) {
      setContactToast({
        message: error.message || "Terjadi kesalahan saat mengirim pesan.",
        type: "error",
      });
    } finally {
      setContactSending(false);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);

        if (!response.ok) {
          throw new Error("Gagal mengambil data project.");
        }

        const data = await response.json();

        const projectData = Array.isArray(data) ? data : data.data || [];

        setProjects(projectData);
      } catch (error) {
        console.error("Gagal mengambil project:", error);
        setProjects([]);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_URL}/reports`);

        if (!response.ok) {
          throw new Error("Gagal mengambil data laporan.");
        }

        const data = await response.json();

        const reportData = Array.isArray(data) ? data : data.data || [];

        const latestReports = reportData
          .filter((report) => report.status === "published")
          .sort((a, b) => Number(b.week) - Number(a.week))
          .slice(0, 4);

        setReports(latestReports);
      } catch (error) {
        console.error("Gagal mengambil laporan:", error);
        setReports([]);
      }
    };

    fetchReports();
  }, []);

  return (
    <main className="overflow-hidden">
      <Toast
        message={contactToast?.message}
        type={contactToast?.type || "success"}
        onClose={() => setContactToast(null)}
      />
      {/* =====================================================
          HERO
      ====================================================== */}
      <section id="home" className="relative flex min-h-[calc(100vh-5rem)] items-center px-6 pb-20 pt-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[5%] top-[20%] h-72 w-72 rounded-full bg-secondary/20 blur-[110px]" />
          <div className="absolute bottom-[10%] right-[5%] h-96 w-96 rounded-full bg-primary/10 blur-[130px]" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Hero text */}
          <motion.div initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground shadow-sm">
              <Sparkles size={14} />
              Informatics Student
            </div> */}

            <h1 className="max-w-5xl text-6xl font-black leading-[0.88] tracking-[-0.06em] sm:text-7xl md:text-8xl xl:text-[7.5rem]">
              TEGUH
              <br />
              <span className="text-muted-foreground">ESA</span> MAULANNA<span className="text-secondary">.</span>
            </h1>

            <div className="mt-5 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Hola! I'm Teguh Esa Maulanna, A Student of Informatic's 24 Universitas Andalas
              </p>

              <div className="hidden sm:block">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
                  <ArrowDown size={22} />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <GraduationCap size={17} />
                Universitas Andalas
              </span>

              <span className="flex items-center gap-2">
                <MapPin size={17} />
                Padang, Indonesia
              </span>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#portfolio"
                className="group inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                View Portfolio
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>

              <a
                href="#reports"
                className="group inline-flex items-center gap-3 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold transition duration-300 hover:-translate-y-1 hover:border-secondary"
              >
                Explore Reports
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="absolute -inset-5 rounded-[2.5rem] border border-border/50" />

            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
              <img src="/images/profil.jpg" alt="Teguh Esa Maulanna" className="h-full w-full object-cover" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-white/65">Portfolio / 2026</p>

                <h2 className="mt-2 text-2xl font-bold">Teguh Esa Maulanna</h2>
              </div> */}
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-4 top-12 rounded-2xl border border-border bg-background/90 px-5 py-4 shadow-xl backdrop-blur-xl sm:-left-12"
            >
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Currently</p>
              <p className="mt-1 text-sm font-semibold">Learning & Building</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-4 bottom-16 rounded-2xl border border-border bg-background/90 px-5 py-4 shadow-xl backdrop-blur-xl sm:-right-12"
            >
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Focus</p>
              <p className="mt-1 text-sm font-semibold">Web · Mobile · Data</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ====================================================== */}
      <section id="about" className="scroll-mt-24 border-t border-border px-6 pt-5 pb-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            number="01"
            eyebrow="About Me"
            title={
              <>
                Learning technology by <span className="text-muted-foreground">actually building things.</span>
              </>
            }
            description="Saya merupakan mahasiswa Informatika Universitas Andalas yang terus mengembangkan kemampuan melalui perkuliahan, praktikum, proyek, dan eksplorasi mandiri."
          />

          <div className="grid gap-5 lg:grid-cols-12">
            {/* Profile */}
            <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-card lg:col-span-5">
              <img
                src="/images/profil2.jpg"
                alt="Teguh Esa Maulanna"
                className="block aspect-[4/3] h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </div>

            {/* Bio */}
            <div className="rounded-[2rem] border border-border bg-card p-7 lg:col-span-7 lg:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/20">
                <UserRound size={21} />
              </div>

              <h3 className="mt-8 text-2xl font-bold">A student with curiosity for technology.</h3>

              <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
                I enjoy listening to music, with music i can face all my deadline. My vision is to develop impactful
                technology and explore the world, combining my passion for coding with my dream of discovering new
                places and ideas.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border p-5">
                  <p className="text-3xl font-bold">2024</p>
                  <p className="mt-1 text-sm text-muted-foreground">Started Journey</p>
                </div>

                <div className="rounded-2xl border border-border p-5">
                  <p className="text-3xl font-bold">∞</p>
                  <p className="mt-1 text-sm text-muted-foreground">Things to Learn</p>
                </div>

                <div className="rounded-2xl border border-border p-5">
                  <p className="text-3xl font-bold">01</p>
                  <p className="mt-1 text-sm text-muted-foreground">Continuous Journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SKILLS
      ====================================================== */}
      <section id="skills" className="scroll-mt-24 border-t border-border px-6 py-28 pt-5 pb-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            number="02"
            eyebrow="Capabilities"
            title={
              <>
                Things I <span className="text-muted-foreground">learn and work with.</span>
              </>
            }
            description="Beberapa teknologi yang saya gunakan dan terus saya kembangkan melalui perkuliahan, praktikum, serta berbagai proyek yang saya kerjakan."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((skill, index) => {
              const Icon = skill.icon;

              return (
                <motion.div
                  key={skill.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group rounded-[1.75rem] border border-border bg-card p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl lg:p-9"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background">
                      <Icon size={21} />
                    </div>

                    <ArrowUpRight
                      size={20}
                      className="text-muted-foreground transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </div>

                  <h3 className="mt-8 text-2xl font-bold">{skill.title}</h3>

                  <p className="mt-3 leading-7 text-muted-foreground">{skill.description}</p>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {skill.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          LEARNING JOURNEY
      ====================================================== */}
      <section id="learning" className="scroll-mt-24 border-t border-border px-6 py-28 pt-5 pb-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            number="03"
            eyebrow="Learning Journey"
            title={
              <>
                From learning <span className="text-muted-foreground">to building.</span>
              </>
            }
            description="Perjalanan akademik dan teknologi yang terus berkembang dari tahun ke tahun."
          />

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute bottom-0 left-[11px] top-0 w-px bg-border md:left-1/2 md:-translate-x-1/2" />

            <div className="space-y-10">
              {journey.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`relative grid gap-6 pl-10 md:grid-cols-2 md:gap-16 md:pl-0 ${
                    index % 2 === 0 ? "" : "md:text-right"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background md:left-1/2 md:-translate-x-1/2`}
                  >
                    <div className="h-2 w-2 rounded-full bg-secondary" />
                  </div>

                  <div className={index % 2 === 0 ? "md:col-start-1" : "md:col-start-2"}>
                    <p className="text-sm font-bold text-secondary">{item.year}</p>

                    <h3 className="mt-2 text-2xl font-bold">{item.title}</h3>

                    <p className="mt-3 leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PORTFOLIO
      ====================================================== */}
      <section id="portfolio" className="scroll-mt-24 border-t border-border px-6 py-28 pt-5 pb-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            number="04"
            eyebrow="Selected Work"
            title={
              <>
                Projects I've <span className="text-muted-foreground">worked on.</span>
              </>
            }
            description="Beberapa proyek yang saya telah saya kerjakan dalam bidang ini."
          />

          {/* FILTER */}
          <div className="mb-10 flex flex-wrap gap-2">
            {projectCategories.map((category) => {
              const active = projectFilter === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setProjectFilter(category)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-secondary hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* PROJECT GRID */}
          <AnimatePresence mode="popLayout">
            <div key={projectFilter} className="grid gap-5 md:grid-cols-2">
              {filteredProjects.map((project, index) => (
                <motion.article
                  key={project.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -20,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                  }}
                  className="group overflow-hidden rounded-[1.75rem] border border-border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={
                        project.cover_image
                          ? `${STORAGE_URL}/${project.cover_image}`
                          : "/images/project-placeholder.png"
                      }
                      alt={project.title}
                    />

                    {/* DARK OVERLAY */}
                    <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/25" />

                    {/* NUMBER */}
                    <div className="absolute left-5 top-5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-xs font-semibold text-white backdrop-blur-md">
                        {String(project.id).padStart(2, "0")}
                      </span>
                    </div>

                    {/* CATEGORY */}
                    <div className="absolute right-5 top-5">
                      <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                        {project.category}
                      </span>
                    </div>

                    {/* VIEW ICON */}
                    <div className="absolute bottom-5 right-5 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowUpRight size={19} />
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-7">
                    <div className="flex items-start justify-between gap-5">
                      <h3 className="text-2xl font-bold tracking-tight">{project.title}</h3>

                      <span className="mt-1 text-xs text-muted-foreground">{project.category}</span>
                    </div>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{project.description}</p>

                    {/* TECHNOLOGY */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.tech_stack?.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition group-hover:border-secondary/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
                      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                        Project / {String(project.id).padStart(2, "0")}
                      </span>

                      <a
                        href={project.github_url || "#"}
                        onClick={(event) => {
                          if (!project.github_url) {
                            event.preventDefault();
                          }
                        }}
                        className="group/link inline-flex items-center gap-2 text-sm font-medium transition hover:text-secondary"
                      >
                        GitHub
                        <ExternalLink
                          size={15}
                          className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                        />
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </AnimatePresence>

          {/* EMPTY STATE */}
          {filteredProjects.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-border p-16 text-center">
              <p className="text-lg font-semibold">Belum ada project pada kategori ini.</p>

              <p className="mt-2 text-sm text-muted-foreground">
                Project dengan kategori {projectFilter} akan ditampilkan di sini.
              </p>
            </div>
          )}

          {/* VIEW ALL */}
          <div className="mt-10 flex justify-center">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-secondary"
            >
              View All Projects
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          REPORTS
      ====================================================== */}
      <section id="reports" className="scroll-mt-24 border-t border-border px-6 py-28 pt-5 pb-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            number="05"
            eyebrow="Reports & Documentation"
            title={
              <>
                Documenting the <span className="text-muted-foreground">learning process.</span>
              </>
            }
            description="Kumpulan laporan dan dokumentasi dari praktikum di perkuliahan."
          />

          <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
            {reports.map((report) => (
              <Link
                key={report.id || report.slug}
                to={`/reports/${report.slug}`}
                className="group grid gap-5 border-b border-border p-6 last:border-b-0 md:grid-cols-[90px_180px_1fr_auto] md:items-center md:p-7"
              >
                {/* Nomor laporan */}
                <span className="text-3xl font-bold text-muted-foreground/50">{report.week}</span>

                {/* Kategori */}
                <span className="w-fit rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition group-hover:border-primary group-hover:text-primary">
                  {report.category}
                </span>

                {/* Judul dan deskripsi */}
                <div>
                  <h3 className="text-xl font-semibold transition-colors group-hover:text-primary">{report.title}</h3>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{report.description}</p>
                </div>

                {/* Icon */}
                <ArrowUpRight
                  size={20}
                  className="text-muted-foreground transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground"
                />
              </Link>
            ))}
          </div>

          {/* Tombol menuju halaman Reports lengkap */}
          <div className="mt-8 flex justify-center">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-secondary"
            >
              View All Reports
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
    GALLERY
====================================================== */}
      <section id="gallery" className="scroll-mt-24 border-t border-border px-6 py-28 pt-5 pb-12 g:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            number="06"
            eyebrow="Gallery"
            title={
              <>
                Moments from <span className="text-muted-foreground">the journey.</span>
              </>
            }
            description="Dokumentasi visual dari berbagai tempat yang pernah saya kunjungi."
          />

          <div className="-mt-28 mb-8">
            <CardFanCarousel
              cards={gallery.map((item, index) => ({
                imgUrl: item.image,
                alt: item.title || `Gallery ${index + 1}`,
              }))}
            />
          </div>

          <div className="mt-4 flex justify-center">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-secondary"
            >
              View All Gallery
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
      CONTACT
      ====================================================== */}
      <section id="contact" className="scroll-mt-24 border-t border-border px-6 py-28 pt-5 pb-12lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            number="07"
            eyebrow="Contact"
            title={
              <>
                Let's work <span className="text-muted-foreground">together.</span>
              </>
            }
            description="Punya pertanyaan, ide project, atau ingin berdiskusi? Jangan ragu untuk menghubungi saya."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-border bg-card p-7 md:p-9"
            >
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Get in touch</p>

              <h3 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Let's connect.</h3>

              <p className="mt-4 leading-7 text-muted-foreground">
                Saya terbuka untuk berdiskusi mengenai project, teknologi, kolaborasi, maupun kesempatan untuk belajar
                dan berkembang bersama.
              </p>

              <div className="mt-8 space-y-4">
                {/* Email */}
                <a
                  href="mailto:teguhesamaulanna665@gmail.com"
                  className="group flex items-center gap-4 rounded-2xl border border-border p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-secondary"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                    <Mail size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                    <p className="mt-1 truncate text-sm font-medium">teguhesamaulanna665@gmail.com</p>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="ml-auto shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/teguhsmlnna666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-border p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-secondary"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                    <FaGithub size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">GitHub</p>
                    <p className="mt-1 truncate text-sm font-medium">github.com/teguhsmlnna666</p>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="ml-auto shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/teguh-esa-maulanna-83820531b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-border p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-secondary"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-sm font-bold">
                    in
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">LinkedIn</p>
                    <p className="mt-1 truncate text-sm font-medium">linkedin.com/in/teguh-esa-maulanna</p>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="ml-auto shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </a>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl border border-border bg-card p-7 md:p-9"
            >
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                      Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Nama kamu"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">
                      Email
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="email@example.com"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="Topik pesan"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium">
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    required
                    placeholder="Tulis pesan kamu..."
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={contactSending}
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all duration-300 hover:-translate-y-1 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {contactSending ? "Sending..." : "Send Message"}

                  {!contactSending && (
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  )}
                </button>
              </form>
            </motion.div>
          </div>
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
