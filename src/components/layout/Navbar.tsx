import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, LayoutDashboard, UserPlus, Sparkles, Scan } from "lucide-react";
import { motion } from "framer-motion";
import CreatorModal from "./CreatorModal";
import attendrixLogo from "@/assets/attendrix-logo.png";

const Navbar = () => {
  const location = useLocation();
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: null },
    { path: "/register", label: "Register", icon: UserPlus },
    { path: "/attendance", label: "Mark Attendance", icon: Scan },
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={attendrixLogo} alt="PresenX Logo" className="w-10 h-10 rounded-xl object-contain" />
              <span className="font-bold text-xl text-foreground">PresenX</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={`gap-2 ${isActive ? "bg-secondary" : ""}`}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Creator Button & Mobile Menu */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatorModalOpen(true)}
                className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Creator</span>
              </Button>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Users className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Creator Modal */}
      <CreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
