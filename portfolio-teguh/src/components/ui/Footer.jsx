import { motion } from "motion/react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

const FooterLogo = ({ className = "" }) => {
  return <div className={`text-2xl font-bold tracking-tight ${className}`}>Teguh.</div>;
};

export default function Footer1() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Portfolio", href: "/#portfolio" },
    { label: "Reports", href: "/reports" },
    { label: "Gallery", href: "/#gallery" },
  ];

  const socialItems = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/teguhsmlnna",
      icon: FaInstagram,
    },
    {
      label: "GitHub",
      href: "https://github.com/teguhsmlnna666",
      icon: FaGithub,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/teguh-esa-maulanna-83820531b/",
      icon: FaLinkedin,
    },
  ];

  return (
    <footer className="w-full overflow-hidden bg-background py-12 text-foreground">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          margin: "0px 0px -100px 0px",
        }}
        variants={containerVariants}
        className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 lg:px-8"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <FooterLogo />
        </motion.div>

        {/* Navigation */}
        <motion.nav
          variants={itemVariants}
          className="relative z-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium"
        >
          {navItems.map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="group relative px-2 py-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                {item.label}
              </span>

              <motion.span
                className="absolute inset-0 -z-0 rounded-md bg-secondary"
                initial={{
                  scale: 0,
                  opacity: 0,
                }}
                whileHover={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              />
            </motion.a>
          ))}
        </motion.nav>

        {/* Social Media */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          {socialItems.map((item) => {
            const Icon = item.icon;

            return (
              <motion.a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                whileHover={{
                  scale: 1.08,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-full border border-border
                  text-muted-foreground
                  transition-colors duration-300
                  hover:bg-secondary
                  hover:text-foreground
                "
              >
                <Icon size={17} />
              </motion.a>
            );
          })}
        </motion.div>
      </motion.div>
    </footer>
  );
}
