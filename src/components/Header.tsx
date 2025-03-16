
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun, Shield } from "lucide-react";
import { letterAnimation, letterHover } from "@/lib/animations";

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };
  
  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Check if route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "py-4 glass" 
          : "py-6 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white dark:bg-transparent">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.2 
              }}
              className="w-full h-full relative"
            >
              <img 
                src="/lovable-uploads/d0974539-57ce-49dc-977e-a395c82acfa1.png" 
                alt="VoteGuard Logo"
                className="w-full h-full object-contain"
              />
              {/* SVG overlay for dark mode color adjustment */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
                <svg width="0" height="0">
                  <defs>
                    <filter id="recolor" colorInterpolationFilters="sRGB">
                      <feColorMatrix
                        type="matrix"
                        values="1 0 0 0 1
                                0 1 0 0 1
                                0 0 1 0 1
                                0 0 0 1 0"
                      />
                    </filter>
                  </defs>
                </svg>
                <div 
                  className="w-full h-full"
                  style={{ filter: 'url(#recolor)', mixBlendMode: 'overlay' }}
                ></div>
              </div>
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-display font-semibold tracking-tight"
          >
            <div className="flex">
              {Array.from("Vote").map((letter, i) => (
                <motion.span
                  key={`title-${i}`}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  whileHover={letterHover}
                  variants={letterAnimation}
                  className="text-xl"
                  style={{ display: "inline-block" }}
                >
                  {letter}
                </motion.span>
              ))}
              {Array.from("Guard").map((letter, i) => (
                <motion.span
                  key={`subtitle-${i}`}
                  custom={i + 4} // offset by 4 (length of "Vote")
                  initial="hidden"
                  animate="visible"
                  whileHover={letterHover}
                  variants={letterAnimation}
                  className="text-xl text-primary"
                  style={{ display: "inline-block" }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          {['', 'auth', 'about'].map((path, index) => (
            <motion.div
              key={path}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Link 
                to={path === '' ? '/' : `/${path}`}
                className={`relative font-medium transition-colors duration-200 ${
                  isActive(path === '' ? '/' : `/${path}`) 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {path === '' ? 'Home' : path.charAt(0).toUpperCase() + path.slice(1)}
                {isActive(path === '' ? '/' : `/${path}`) && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-secondary text-secondary-foreground transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
