
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-secondary/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      <div className="relative">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32"
        >
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span>Blockchain Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Verified Voters Only</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-success" />
              <span>Public Transparency</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight mb-6 leading-tight"
            >
              The Future of{" "}
              <span className="text-gradient bg-gradient-to-r from-bjp via-congress to-aap bg-clip-text text-transparent">
                Democratic Voting
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 text-balance font-body leading-relaxed"
            >
              Experience secure, transparent, and verifiable elections powered by cutting-edge 
              blockchain technology and biometric authentication.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="xl"
                  variant="gradient"
                  className="w-full sm:w-auto group relative overflow-hidden"
                >
                  <span className="flex items-center gap-3">
                    Start Voting Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              
              <Link to="/about" className="w-full sm:w-auto">
                <Button 
                  size="xl"
                  variant="glass"
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Vote Integrity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">System Security</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Transparency</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
