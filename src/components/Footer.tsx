
import { motion } from "framer-motion";
import { Shield, Lock, Layers } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary/50 border-t border-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold">E</span>
              </div>
              <span className="font-display font-semibold tracking-tight">E-Secure</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              A secure, transparent, and modern blockchain-based digital voting system 
              designed to ensure election integrity.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-medium mb-4">Security Features</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield size={16} className="text-primary" />
                <span>Blockchain Verification</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock size={16} className="text-primary" />
                <span>Encrypted Voting Records</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers size={16} className="text-primary" />
                <span>Immutable Audit Trail</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Security Information
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            © {currentYear} E-Secure Voting System. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Help Center
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
