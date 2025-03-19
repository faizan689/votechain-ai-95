
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      
      <Footer />
    </div>
  );
};

export default Index;
