import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const slideIn: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

export const letterAnimation: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
    }
  })
};

export const letterHover = {
  scale: 1.1,
  y: -3,
  color: "#000000",
  transition: { duration: 0.2 }
};

export const tricolorGradient = {
  backgroundImage: "linear-gradient(to right, #FF9933, #FFFFFF, #138808)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

export const logoTransition = {
  light: {
    filter: "none",
    transition: { duration: 0.3 }
  },
  dark: {
    filter: "brightness(0) invert(1)",
    transition: { duration: 0.3 }
  }
};
