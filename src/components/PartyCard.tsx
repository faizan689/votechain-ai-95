
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type PartyCardProps = {
  id: string;
  name: string;
  symbol: string;
  color: string;
  logoPath: string;
  selected: boolean;
  onSelect: (id: string) => void;
};

const PartyCard = ({ 
  id, 
  name, 
  symbol, 
  color, 
  logoPath,
  selected, 
  onSelect 
}: PartyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect(id)}
      className={cn(
        "relative p-6 rounded-2xl cursor-pointer transition-all duration-300",
        "border border-border hover:border-primary/20",
        "glass flex flex-col items-center justify-center gap-4",
        "h-44 md:h-56 w-full overflow-hidden",
        selected ? "ring-2 ring-primary" : ""
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
          >
            <Check size={14} />
          </motion.div>
        </div>
      )}
      
      <motion.div 
        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-white overflow-hidden`}
        style={{ border: `2px solid ${color}` }}
      >
        <img src={logoPath} alt={`${name} logo`} className="w-full h-full object-contain p-1" />
      </motion.div>
      
      <div className="text-center">
        <motion.h3 
          whileHover={{ scale: 1.05 }}
          className="font-medium text-lg"
        >
          {name}
        </motion.h3>
        <p className="text-sm text-muted-foreground mt-1">{symbol}</p>
      </div>
      
      <motion.div
        initial={false}
        animate={{ opacity: selected || isHovered ? 1 : 0, scale: selected || isHovered ? 1 : 0.8 }}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
          zIndex: -1
        }}
      />
    </motion.div>
  );
};

export default PartyCard;
