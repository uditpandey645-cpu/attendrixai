import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      {/* Gradient Glow */}
      <div className="absolute inset-0 rounded-2xl gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-sm group-hover:shadow-glow transition-shadow duration-300">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
