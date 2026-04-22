import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Cpu, Shield, Award, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import creatorImage from "@/assets/creator-udit-pandey.png";
import faceScanImage from "@/assets/face-scan-tech.jpg";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden"
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-card/80 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="overflow-y-auto max-h-[90vh]">
              {/* Two Column Layout */}
              <div className="flex flex-col md:flex-row">
                {/* Left Column - Creator Photo */}
                <div className="relative md:w-2/5 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5">
                  {/* Decorative scan lines */}
                  <div className="absolute inset-0 overflow-hidden opacity-20">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute h-px bg-gradient-to-r from-transparent via-primary to-transparent w-full"
                        style={{ top: `${10 + i * 12}%` }}
                      />
                    ))}
                  </div>
                  
                  {/* Creator Full Photo */}
                  <div className="relative h-64 md:h-full min-h-[400px]">
                    <img
                      src={creatorImage}
                      alt="Udit Pandey - Creator of Attendrix"
                      className="w-full h-full object-contain object-center"
                    />
                    {/* Gradient overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent md:hidden" />
                  </div>
                  
                  {/* Name badge on photo */}
                  <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                    <div className="bg-card/90 backdrop-blur-md rounded-xl p-4 border border-border/50 shadow-lg">
                      <h2 className="text-xl md:text-2xl font-bold text-foreground">
                        UDIT PANDEY
                      </h2>
                      <p className="text-primary font-medium text-sm">
                        Founder & Lead Developer
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Content */}
                <div className="md:w-3/5 p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <p className="text-muted-foreground text-sm">
                      Expert in Face Recognition & Biometric Technology
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex gap-2 mt-3">
                      <a
                        href="https://www.linkedin.com/in/udit-pandey-b30191384"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn profile of Udit Pandey"
                      >
                        <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      </a>
                      <a
                        href="https://github.com/uditpandey645-cpu"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub profile of Udit Pandey"
                      >
                        <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                          <Github className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* About Section with Face Scan Image */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">About</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Udit Pandey is a visionary technologist and the mastermind behind PresentX — 
                          a cutting-edge face recognition attendance system. With extensive expertise in 
                          artificial intelligence, computer vision, and biometric security, Udit has 
                          pioneered innovative solutions that revolutionize identity verification.
                        </p>
                      </div>
                      {/* Face Scan Tech Image */}
                      <div className="sm:w-32 sm:h-32 w-full h-32 rounded-lg overflow-hidden border-2 border-primary/30 shadow-lg shrink-0">
                        <img
                          src={faceScanImage}
                          alt="Face Recognition Technology"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expertise Grid */}
                  <h3 className="font-semibold text-foreground mb-2 text-sm">Areas of Expertise</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {expertise.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border/50"
                      >
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-xs">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Technology Stats */}
                  <div className="border-t border-border/50 pt-4">
                    <h3 className="font-semibold text-foreground mb-2 text-sm">The Technology Behind PresentX</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="text-lg font-bold text-gradient">&lt;1s</div>
                        <div className="text-[10px] text-muted-foreground">Recognition</div>
                      </div>
                      <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="text-lg font-bold text-gradient">99.9%</div>
                        <div className="text-[10px] text-muted-foreground">Accuracy</div>
                      </div>
                      <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="text-lg font-bold text-gradient">256-bit</div>
                        <div className="text-[10px] text-muted-foreground">Encryption</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatorModal;
