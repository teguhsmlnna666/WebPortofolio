import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { gallery } from "../data/gallery";
import Footer from "../components/ui/Footer";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  const openImage = (image) => {
    setSelectedImage(image);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const showPrevious = () => {
    if (!selectedImage) return;

    const currentIndex = gallery.findIndex((item) => item.id === selectedImage.id);

    const previousIndex = currentIndex === 0 ? gallery.length - 1 : currentIndex - 1;

    setSelectedImage(gallery[previousIndex]);
  };

  const showNext = () => {
    if (!selectedImage) return;

    const currentIndex = gallery.findIndex((item) => item.id === selectedImage.id);

    const nextIndex = currentIndex === gallery.length - 1 ? 0 : currentIndex + 1;

    setSelectedImage(gallery[nextIndex]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* =========================================================
          BACK BUTTON
      ========================================================== */}

      <Link
        to="/#gallery"
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

        <span>Back to Gallery</span>
      </Link>

      {/* =========================================================
          HEADER
      ========================================================== */}

      <section className="px-6 pb-12 pt-24 lg:px-8">
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
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Gallery</p>

            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
              Moments <span className="text-muted-foreground">& memories.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Kumpulan dokumentasi dan momen dari tempat yang pernah saya kunjungi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          GALLERY GRID
      ========================================================== */}

      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {gallery.map((item, index) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => openImage(item)}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                }}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[1.5rem]
                  border
                  border-border
                  bg-card
                  text-left
                  outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary
                "
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />
                </div>

                {/* Overlay */}

                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-end
                    bg-gradient-to-t
                    from-black/60
                    via-black/10
                    to-transparent
                    p-5
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                >
                  <span className="text-sm font-medium text-white">{item.title}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          LIGHTBOX
      ========================================================== */}

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/80
              p-6
              backdrop-blur-md
            "
            onClick={closeImage}
          >
            {/* Close */}

            <button
              type="button"
              onClick={closeImage}
              aria-label="Tutup gallery"
              className="
                absolute
                right-6
                top-6
                z-10
                rounded-full
                border
                border-white/20
                bg-black/30
                p-2.5
                text-white
                backdrop-blur-xl
                transition-colors
                hover:bg-white/10
              "
            >
              <X size={20} />
            </button>

            {/* Previous */}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="Gambar sebelumnya"
              className="
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                rounded-full
                border
                border-white/20
                bg-black/30
                p-3
                text-white
                backdrop-blur-xl
                transition-colors
                hover:bg-white/10
                md:left-8
              "
            >
              <ChevronLeft size={22} />
            </button>

            {/* Image */}

            <motion.img
              key={selectedImage.id}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              transition={{
                duration: 0.2,
              }}
              src={selectedImage.image}
              alt={selectedImage.title}
              onClick={(event) => event.stopPropagation()}
              className="
                max-h-[85vh]
                max-w-[90vw]
                rounded-2xl
                object-contain
                shadow-2xl
              "
            />

            {/* Next */}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Gambar berikutnya"
              className="
                absolute
                right-4
                top-1/2
                z-10
                -translate-y-1/2
                rounded-full
                border
                border-white/20
                bg-black/30
                p-3
                text-white
                backdrop-blur-xl
                transition-colors
                hover:bg-white/10
                md:right-8
              "
            >
              <ChevronRight size={22} />
            </button>

            {/* Image Counter */}

            <div
              className="
                absolute
                bottom-6
                left-1/2
                -translate-x-1/2
                rounded-full
                border
                border-white/20
                bg-black/30
                px-4
                py-2
                text-xs
                font-medium
                text-white
                backdrop-blur-xl
              "
            >
              {gallery.findIndex((item) => item.id === selectedImage.id) + 1} / {gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-border" />
      {/* =====================================================
          FOOTER
      ====================================================== */}
      <Footer />
    </main>
  );
}
