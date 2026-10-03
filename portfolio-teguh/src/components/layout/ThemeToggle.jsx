import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

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

  return (
    <button
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
      className="fixed right-6 top-6 z-50 rounded-full border border-border bg-background/80 p-2.5 text-muted-foreground backdrop-blur-xl transition-colors hover:text-foreground"
    >
      {darkMode ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}