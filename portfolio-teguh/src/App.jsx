import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop";
import ThemeToggle from "./components/layout/ThemeToggle";

import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";
import Gallery from "./pages/Gallery";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminReports from "./pages/admin/AdminReports";
import ProtectedRoute from "./pages/admin/ProtectedRoute";
import AdminReportCreate from "./pages/admin/AdminReportCreate";
import AdminReportEdit from "./pages/admin/AdminReportEdit";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminProjectForm from "./pages/admin/AdminProjectForm";

function AppLayout() {
  const location = useLocation();

  const isReportsPage = location.pathname === "/reports";

  const isReportDetail = location.pathname.startsWith("/reports/");

  const isProjectsPage = location.pathname === "/projects";

  const isProjectDetail = location.pathname.startsWith("/projects/");

  const isGalleryPage = location.pathname === "/gallery";

  /*
   * Semua halaman admin tidak menggunakan Navbar
   * maupun ThemeToggle global.
   */
  const isAdminPage = location.pathname.startsWith("/admin");

  const hideNavbar =
    isReportsPage || isReportDetail || isProjectsPage || isProjectDetail || isGalleryPage || isAdminPage;

  return (
    <>
      <ScrollToTop />

      {/* Navbar hanya tampil di halaman public tertentu */}
      {!hideNavbar && <Navbar />}

      {/* ThemeToggle global hanya tampil di halaman public
          yang memang tidak menggunakan Navbar */}
      {hideNavbar && !isAdminPage && <ThemeToggle />}

      <Routes>
        {/* ==============================
            PUBLIC PAGES
        =============================== */}

        <Route path="/" element={<Home />} />

        <Route path="/projects" element={<Projects />} />

        <Route path="/projects/:slug" element={<ProjectDetail />} />

        <Route path="/reports" element={<Reports />} />

        <Route path="/reports/:slug" element={<ReportDetail />} />

        <Route path="/gallery" element={<Gallery />} />

        {/* ==============================
            ADMIN
        =============================== */}

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports/new" element={<AdminReportCreate />} />
          <Route path="/admin/reports/:id/edit" element={<AdminReportEdit />} />
          <Route path="/admin/projects" element={<AdminProjects />} />
          <Route path="/admin/projects/create" element={<AdminProjectForm />} />
          <Route path="/admin/projects/:id/edit" element={<AdminProjectForm />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
