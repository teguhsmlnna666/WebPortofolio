import { useEffect, useLayoutEffect, useState } from "react";
import { Menu, X, Sun, Moon, ArrowUpRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));

  // =====================================================
  // DAFTAR SECTION
  // =====================================================
  const sections = ["about", "portfolio", "reports", "gallery", "contact"];

  // =====================================================
  // DARK MODE
  // =====================================================
  const toggleDarkMode = () => {
    const html = document.documentElement;

    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  // =====================================================
  // SCROLL EFFECT NAVBAR
  // =====================================================
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =====================================================
  // DETEKSI SECTION AKTIF
  // =====================================================
  useEffect(() => {
    // Hanya mendeteksi section ketika berada di Home
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      let currentSection = "home";

      for (const section of sections) {
        const element = document.getElementById(section);

        if (!element) continue;

        if (scrollPosition >= element.offsetTop) {
          currentSection = section;
        }
      }

      setActiveSection(currentSection);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  // =====================================================
  // HANDLE NAVIGASI KE SECTION
  // =====================================================
  const goToSection = (section) => {
    setMobileOpen(false);
    setActiveSection(section);

    // Jika sedang di halaman selain Home
    if (location.pathname !== "/") {
      navigate(`/#${section}`);
      return;
    }

    // Jika sudah berada di Home
    const element = document.getElementById(section);

    if (!element) return;

    window.history.replaceState(null, "", `/#${section}`);

    const navbarOffset = 80;

    window.scrollTo({
      top: element.offsetTop - navbarOffset,
      behavior: "smooth",
    });
  };

  // =====================================================
  // KEMBALI KE HOME
  // =====================================================
  const goHome = () => {
    setMobileOpen(false);
    setActiveSection("home");

    if (location.pathname !== "/") {
      navigate("/");
      return;
    }

    window.history.replaceState(null, "", "/");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // STYLE NAV ITEM
  // =====================================================
  const getNavClass = (section) => {
    const isActive = location.pathname === "/" && activeSection === section;

    return `
      relative text-sm font-medium transition-colors
      ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
    `;
  };

  // =====================================================
  // HANDLE HASH / PINDAH HALAMAN
  // =====================================================
  useLayoutEffect(() => {
    if (location.pathname !== "/") return;

    const hash = window.location.hash;

    if (!hash) return;

    const section = hash.replace("#", "");
    const element = document.getElementById(section);

    if (!element) return;

    // Beri sedikit delay supaya DOM benar-benar siap
    requestAnimationFrame(() => {
      const navbarOffset = 80;

      window.scrollTo({
        top: element.offsetTop - navbarOffset,
        behavior: "instant",
      });

      setActiveSection(section);
    });
  }, [location.pathname, location.hash]);

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header
        className={`
          fixed left-0 right-0 top-0 z-50
          transition-all duration-300
          ${scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : "bg-transparent"}
        `}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* =================================================
              LOGO
          ================================================== */}
          <button onClick={() => navigate("/admin")} className="group flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">Teguh.</span>

            <ArrowUpRight
              size={15}
              className="text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </button>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}
          <nav className="hidden items-center gap-8 md:flex">
            <button
              onClick={goHome}
              className={`
                relative text-sm font-medium transition-colors
                ${
                  location.pathname === "/" && activeSection === "home"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Home
              {location.pathname === "/" && activeSection === "home" && (
                <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>

            {sections.map((section) => (
              <button key={section} onClick={() => goToSection(section)} className={getNavClass(section)}>
                {section.charAt(0).toUpperCase() + section.slice(1)}

                {location.pathname === "/" && activeSection === section && (
                  <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            ))}

            {/* ===============================================
                DARK MODE
            ================================================ */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="ml-2 rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </nav>

          {/* =================================================
              MOBILE ACTIONS
          ================================================== */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}
        {mobileOpen && (
          <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col px-6 py-6">
              {/* Home */}
              <button
                onClick={goHome}
                className={`
                  border-b border-border py-4 text-left text-sm font-medium
                  ${activeSection === "home" && location.pathname === "/" ? "text-foreground" : "text-muted-foreground"}
                `}
              >
                Home
              </button>

              {/* Sections */}
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => goToSection(section)}
                  className={`
                    border-b border-border py-4 text-left text-sm font-medium
                    ${
                      activeSection === section && location.pathname === "/"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  `}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
