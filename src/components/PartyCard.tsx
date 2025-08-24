
import React from "react";
import { motion } from "framer-motion";
import { Check, Shield, Award } from "lucide-react";
import Tilt from "react-parallax-tilt";

interface PartyCardProps {
  id: string;
  name: string;
  symbol: string;
  color: string;
  logoPath: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

const PartyCard = ({ id, name, symbol, color, logoPath, selected, onSelect }: PartyCardProps) => {
  const getPartyTheme = (color: string) => {
    const colorMap: Record<string, string> = {
      "#FF9933": "bjp",
      "#0078D7": "congress", 
      "#019934": "aap",
      "#6B7280": "nota"
    };
    return colorMap[color] || "primary";
  };

  const partyTheme = getPartyTheme(color);

  return (
    <Tilt
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      scale={1.02}
      transitionSpeed={1200}
      className="h-full"
    >
      <motion.div
        layout
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(id)}
        className={`
          relative h-full rounded-2xl overflow-hidden cursor-pointer group
          transition-all duration-500 ease-out
          ${selected 
            ? `ring-4 ring-${partyTheme} shadow-2xl shadow-${partyTheme}/30 bg-gradient-to-br from-card to-muted/20` 
            : "ring-2 ring-border hover:ring-primary/40 shadow-lg hover:shadow-xl bg-card"}
        `}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current to-transparent" 
               style={{ color }} />
        </div>

        {/* Card Content */}
        <div className="relative p-8 h-full flex flex-col">
          {/* Selection Badge */}
          {selected && (
            <motion.div 
              className={`absolute top-4 right-4 bg-${partyTheme} text-white rounded-full p-2 shadow-lg`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Check className="w-5 h-5" />
            </motion.div>
          )}

          {/* Trust Indicator */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Verified</span>
            </div>
          </div>

          {/* Logo Section */}
          <div className="flex-1 flex items-center justify-center mb-6">
            <motion.div 
              className={`
                relative w-32 h-32 rounded-full flex items-center justify-center
                bg-gradient-to-br from-background to-muted shadow-inner
                ${selected ? 'shadow-xl' : 'shadow-md'}
                overflow-hidden group-hover:shadow-lg transition-all duration-300
              `}
              whileHover={{ rotate: 5 }}
            >
              <motion.img 
                src={logoPath} 
                alt={`${name} logo`} 
                className="w-24 h-24 object-contain filter group-hover:brightness-110 transition-all duration-300" 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              />
              
              {/* Glow Effect */}
              {selected && (
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` 
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.div>
          </div>
          
          {/* Party Information */}
          <div className="text-center space-y-3">
            <motion.h3 
              className="font-heading font-semibold text-lg text-foreground leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {name}
            </motion.h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Award className="w-4 h-4" />
                <span className="font-medium">Symbol: {symbol}</span>
              </div>
              
              {selected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-${partyTheme}/10 text-${partyTheme}`}
                >
                  <Check className="w-3 h-3" />
                  Selected Choice
                </motion.div>
              )}
            </div>
          </div>

          {/* Interactive Border */}
          <div 
            className={`
              absolute inset-0 rounded-2xl pointer-events-none
              transition-all duration-300
              ${selected 
                ? `bg-gradient-to-r from-${partyTheme}/20 via-transparent to-${partyTheme}/20` 
                : 'bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100'}
            `}
          />
        </div>
      </motion.div>
    </Tilt>
  );
};

export default PartyCard;

