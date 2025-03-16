
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Lock, Layers } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-32 pb-20 md:pt-40 md:pb-32"
      >
        <div className="container mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight mb-6"
          >
            Secure. Transparent.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Democratic.
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            A next-generation secure voting platform leveraging blockchain technology 
            to ensure the integrity and transparency of the democratic process.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-primary text-primary-foreground rounded-lg px-6 py-3 flex items-center justify-center gap-2 shadow-button"
              >
                <span>Start Voting</span>
                <ArrowRight size={18} />
              </motion.button>
            </Link>
            
            <Link to="/about">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="border border-border rounded-lg px-6 py-3 hover:bg-secondary transition-colors"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Features Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-display font-semibold mb-4">Why Choose E-Secure?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our platform combines cutting-edge technology with a user-friendly interface 
              to create the most secure voting experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8 text-primary" />,
                title: "Secure Authentication",
                description: "Multi-factor authentication ensures only eligible voters participate, preventing fraud."
              },
              {
                icon: <Lock className="w-8 h-8 text-primary" />,
                title: "Encrypted Ballots",
                description: "Every vote is encrypted and anonymized before being added to the blockchain ledger."
              },
              {
                icon: <Layers className="w-8 h-8 text-primary" />,
                title: "Immutable Records",
                description: "Blockchain technology creates a tamper-proof record of every vote that can be verified."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass border border-border rounded-2xl p-6 h-full"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="glass border border-border rounded-2xl overflow-hidden"
          >
            <div className="lg:flex">
              <div className="p-10 lg:p-16 lg:w-2/3">
                <h2 className="text-3xl font-display font-semibold mb-4">
                  Ready to Experience Secure Digital Voting?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl">
                  Join millions of voters who trust our platform for secure, 
                  transparent, and accessible democratic participation.
                </p>
                
                <Link to="/auth">
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-primary text-primary-foreground rounded-lg px-6 py-3 flex items-center justify-center gap-2 shadow-button"
                  >
                    <span>Start the Process</span>
                    <ArrowRight size={18} />
                  </motion.button>
                </Link>
              </div>
              
              <div className="lg:w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-display text-4xl font-bold">E</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
