import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Scan, 
  Shield, 
  Zap, 
  Users, 
  Clock, 
  Lock,
  ArrowRight,
  CheckCircle,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import FeatureCard from "@/components/features/FeatureCard";
import heroImage from "@/assets/hero-face-recognition.jpg";

const features = [
  {
    icon: Scan,
    title: "Real-Time Face Recognition",
    description: "Advanced AI-powered face detection that works instantly with your webcam for seamless attendance marking."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized algorithms ensure face matching happens in milliseconds, not seconds."
  },
  {
    icon: Shield,
    title: "Secure & Encrypted",
    description: "All face data is encrypted and stored securely. Your biometric data stays protected."
  },
  {
    icon: Users,
    title: "Multi-User Support",
    description: "Handle hundreds of registered users efficiently with smart indexing and matching."
  },
  {
    icon: Clock,
    title: "Timestamped Logs",
    description: "Every attendance entry is automatically timestamped with precise date and time records."
  },
  {
    icon: Lock,
    title: "Anti-Spoofing",
    description: "Built-in protection against photo spoofing and duplicate attendance attempts."
  }
];

const steps = [
  { step: "01", title: "Register", description: "Upload your face photo and personal details" },
  { step: "02", title: "Scan", description: "Look at the camera for instant recognition" },
  { step: "03", title: "Done", description: "Attendance marked automatically" }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Next-Gen Attendance System
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
            >
              Mark Attendance with
              <span className="text-gradient"> Your Face</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              A modern, secure, and blazing-fast face recognition system for 
              seamless attendance tracking. No cards, no pins—just your face.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/attendance">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                  <Camera className="w-5 h-5" />
                  Mark Attendance
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="glass" size="xl" className="gap-2 w-full sm:w-auto">
                  <Users className="w-5 h-5" />
                  Register Now
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto"
            >
              {[
                { value: "<1s", label: "Recognition" },
                { value: "99.9%", label: "Accuracy" },
                { value: "1GB", label: "Storage" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-16 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/20">
                <img 
                  src={heroImage} 
                  alt="Face Recognition Technology" 
                  className="w-full h-auto object-cover max-h-[400px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
              >
                <div className="text-6xl font-bold text-primary/10 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-12 -right-4 w-8 h-8 text-primary/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for modern attendance management
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto rounded-3xl gradient-primary p-12 text-center overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <CheckCircle className="w-16 h-16 text-primary-foreground mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
                Join organizations that trust PresenX for their attendance management
              </p>
              <Link to="/register">
                <Button 
                  size="xl" 
                  className="bg-card text-primary hover:bg-card/90 shadow-lg"
                >
                  Register Your Organization
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 PresenX. Created by Udit Pandey. Secure face recognition for modern organizations.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
