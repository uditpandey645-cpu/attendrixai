import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import CameraView from "@/components/camera/CameraView";
import { toast } from "sonner";

type AttendanceStatus = "idle" | "scanning" | "success" | "failed";

interface AttendanceRecord {
  name: string;
  employeeId: string;
  time: string;
  date: string;
}

const Attendance = () => {
  const [status, setStatus] = useState<AttendanceStatus>("idle");
  const [faceDetected, setFaceDetected] = useState(false);
  const [matchedUser, setMatchedUser] = useState<AttendanceRecord | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);

  // Simulate face matching
  const handleFaceMatch = () => {
    if (!faceDetected) {
      toast.error("No face detected. Please position your face in the frame.");
      return;
    }

    setStatus("scanning");
    
    // Simulate matching process
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        const now = new Date();
        const record: AttendanceRecord = {
          name: "John Doe",
          employeeId: "EMP-001",
          time: now.toLocaleTimeString(),
          date: now.toLocaleDateString(),
        };
        setMatchedUser(record);
        setRecentAttendance(prev => [record, ...prev.slice(0, 4)]);
        setStatus("success");
        toast.success("Attendance marked successfully!");
      } else {
        setStatus("failed");
        toast.error("Face not recognized. Please try again or register.");
      }
    }, 2000);
  };

  const resetStatus = () => {
    setStatus("idle");
    setMatchedUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mark Your Attendance
            </h1>
            <p className="text-muted-foreground">
              Position your face in the camera frame for recognition
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Camera Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl border border-border/50 shadow-card p-6"
              >
                <AnimatePresence mode="wait">
                  {status === "idle" && (
                    <motion.div
                      key="camera"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <CameraView 
                        onFaceDetected={setFaceDetected}
                        showOverlay={true}
                      />
                      
                      <div className="mt-6 flex justify-center">
                        <Button
                          onClick={handleFaceMatch}
                          variant="hero"
                          size="xl"
                          disabled={!faceDetected}
                          className="gap-2"
                        >
                          <Camera className="w-5 h-5" />
                          Mark Attendance
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {status === "scanning" && (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="aspect-video rounded-xl bg-camera-bg flex items-center justify-center"
                    >
                      <div className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                          <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                          </div>
                        </div>
                        <p className="text-lg font-medium text-foreground">Verifying face...</p>
                        <p className="text-sm text-muted-foreground mt-2">Please wait</p>
                      </div>
                    </motion.div>
                  )}

                  {status === "success" && matchedUser && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="aspect-video rounded-xl bg-success/5 border-2 border-success flex items-center justify-center"
                    >
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.5 }}
                          className="w-24 h-24 rounded-full bg-success flex items-center justify-center mx-auto mb-6"
                        >
                          <CheckCircle className="w-12 h-12 text-success-foreground" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          Welcome, {matchedUser.name}!
                        </h2>
                        <p className="text-success font-medium mb-4">
                          Attendance marked successfully
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
                          <Clock className="w-4 h-4" />
                          {matchedUser.time} • {matchedUser.date}
                        </div>
                        
                        <Button
                          onClick={resetStatus}
                          variant="outline"
                          className="mt-6 gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Mark Another
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {status === "failed" && (
                    <motion.div
                      key="failed"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="aspect-video rounded-xl bg-destructive/5 border-2 border-destructive flex items-center justify-center"
                    >
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.5 }}
                          className="w-24 h-24 rounded-full bg-destructive flex items-center justify-center mx-auto mb-6"
                        >
                          <XCircle className="w-12 h-12 text-destructive-foreground" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          Face Not Recognized
                        </h2>
                        <p className="text-muted-foreground mb-6">
                          We couldn't match your face. Please try again or register.
                        </p>
                        <div className="flex gap-4 justify-center">
                          <Button
                            onClick={resetStatus}
                            variant="outline"
                            className="gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                          </Button>
                          <Button
                            variant="hero"
                            asChild
                          >
                            <a href="/register">Register</a>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Recent Attendance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border/50 shadow-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Activity
              </h3>

              {recentAttendance.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent attendance</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAttendance.map((record, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {record.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.employeeId}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-foreground">{record.time}</p>
                        <p className="text-xs text-muted-foreground">{record.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
