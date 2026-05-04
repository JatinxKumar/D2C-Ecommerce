import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PremiumCarousel = ({ heroBanners }) => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  // Auto slide
  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroBanners.length);
    }, 4000);

    return () => clearInterval(t);
  }, [heroBanners.length]);

  return (
    <div className="relative w-full h-[260px] overflow-hidden">

      {/* CARDS */}
      <div className="relative h-full flex items-center justify-center">

        {heroBanners.map((item, i) => {
          const offset = i - index;

          return (
            <motion.div
              key={i}
              className="absolute w-[85%] h-full rounded-3xl overflow-hidden shadow-xl"
              
              animate={{
                scale: offset === 0 ? 1 : 0.9,
                x: offset * 40,
                opacity: Math.abs(offset) > 1 ? 0 : 1,
                filter: offset === 0 ? "blur(0px)" : "blur(4px)",
                zIndex: 10 - Math.abs(offset),
              }}

              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
              }}
            >
              {/* IMAGE */}
              <img
                src={item.image}
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable="false"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              {/* TEXT */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-[10px] uppercase tracking-widest text-white/70">
                  {item.badge}
                </p>

                <h2 className="text-lg font-bold mt-1 leading-tight">
                  {item.title}
                </h2>

                <p className="text-xs text-white/70 mt-1 line-clamp-2">
                  {item.subtitle}
                </p>

                <button 
                  onClick={() => navigate(item.link || '/shop')}
                  className="mt-3 px-4 py-1.5 bg-white text-black rounded-full text-xs font-semibold hover:bg-gray-100 transition-colors active:scale-95"
                >
                  Shop Now →
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DOTS */}
      <div className="absolute bottom-2 w-full flex justify-center gap-1.5">
        {heroBanners.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PremiumCarousel;