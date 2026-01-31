import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Cpu, Shield, Award, Linkedin, Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import creatorImage from "@/assets/creator-udit-pandey.png";

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatorModal = ({ isOpen, onClose }: CreatorModalProps) => {
  const expertise = [
    { icon: Brain, title: "AI & Machine Learning", desc: "Deep learning models for facial recognition" },
    { icon: Cpu, title: "Computer Vision", desc: "Real-time image processing & analysis" },
    { icon: Shield, title: "Biometric Security", desc: "Anti-spoofing & identity verification" },
    { icon: Award, title: "Innovation Leader", desc: "Pioneering face matching solutions" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-card rounded-2xl border border-border/50 shadow-xl z-50 overflow-hidden"
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-10"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header with gradient */}
              <div className="relative h-32 gradient-primary">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                </div>
                
                {/* Decorative scan lines */}
                <div className="absolute inset-0 overflow-hidden opacity-30">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent w-full"
                      style={{ top: `${20 + i * 20}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Creator Photo */}
              <div className="relative -mt-16 px-6">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-card shadow-xl mx-auto md:mx-0">
                  <img
                    src={creatorImage}
                    alt="Udit Pandey"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                      UDIT PANDEY
                    </h2>
                    <p className="text-primary font-medium">
                      Founder & Lead Developer — Attendrix
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Expert in Face Recognition & Biometric Technology
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Github className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* About Section */}
                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-foreground mb-2">About</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Udit Pandey is a visionary technologist and the mastermind behind Attendrix — 
                    a cutting-edge face recognition attendance system. With extensive expertise in 
                    artificial intelligence, computer vision, and biometric security, Udit has 
                    pioneered innovative solutions that revolutionize how organizations handle 
                    identity verification and attendance management.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                    His work combines state-of-the-art deep learning algorithms with practical 
                    enterprise applications, achieving industry-leading accuracy rates of 99.9% 
                    in face matching while maintaining sub-second recognition speeds. Udit's 
                    commitment to security ensures that Attendrix incorporates advanced anti-spoofing 
                    measures and encrypted biometric data storage.
                  </p>
                </div>

                {/* Expertise Grid */}
                <h3 className="font-semibold text-foreground mb-3">Areas of Expertise</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {expertise.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
                    >
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Technology Section */}
                <div className="border-t border-border/50 pt-4">
                  <h3 className="font-semibold text-foreground mb-3">The Technology Behind Attendrix</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-2xl font-bold text-gradient">&lt;1s</div>
                      <div className="text-xs text-muted-foreground">Recognition Speed</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-2xl font-bold text-gradient">99.9%</div>
                      <div className="text-xs text-muted-foreground">Accuracy Rate</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-2xl font-bold text-gradient">256-bit</div>
                      <div className="text-xs text-muted-foreground">Encryption</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatorModal;
