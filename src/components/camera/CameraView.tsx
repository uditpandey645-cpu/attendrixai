import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraViewProps {
  onCapture?: (imageData: string) => void;
  onFaceDetected?: (detected: boolean) => void;
  autoCapture?: boolean;
  showOverlay?: boolean;
}

const CameraView = ({ 
  onCapture, 
  onFaceDetected,
  autoCapture = false,
  showOverlay = true 
}: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please ensure camera permissions are granted.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      onCapture?.(imageData);
      return imageData;
    }
    return null;
  }, [isStreaming, onCapture]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Simulate face detection for demo (in real app, use face-api.js)
  useEffect(() => {
    if (!isStreaming) return;
    
    const interval = setInterval(() => {
      // Simulated face detection - will be replaced with real face-api.js
      const detected = Math.random() > 0.3;
      setFaceDetected(detected);
      onFaceDetected?.(detected);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, onFaceDetected]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Camera Container */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-camera-bg shadow-xl">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-camera-bg"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Starting camera...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-camera-bg"
            >
              <div className="text-center p-6">
                <CameraOff className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={startCamera} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Face Detection Overlay */}
        {showOverlay && isStreaming && !error && (
          <>
            {/* Corner Markers */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-primary/60 rounded-tl-lg" />
              <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-primary/60 rounded-tr-lg" />
              <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-primary/60 rounded-bl-lg" />
              <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-primary/60 rounded-br-lg" />
            </div>

            {/* Center Face Guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{
                  borderColor: faceDetected 
                    ? "hsl(var(--success))" 
                    : "hsl(var(--primary) / 0.5)",
                  boxShadow: faceDetected 
                    ? "0 0 30px hsl(var(--success) / 0.5)" 
                    : "none",
                }}
                transition={{ duration: 0.3 }}
                className="w-48 h-64 rounded-full border-4 border-dashed"
              />
            </div>

            {/* Scan Line Animation */}
            <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
              <motion.div
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"
              />
            </div>

            {/* Status Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                  faceDetected 
                    ? "bg-success/20 text-success" 
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {faceDetected ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Face Detected</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">Position your face</span>
                  </>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>

      {/* Capture Button */}
      {isStreaming && !error && !autoCapture && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-6"
        >
          <Button
            onClick={captureImage}
            variant="hero"
            size="xl"
            className="gap-2"
            disabled={!faceDetected}
          >
            <Camera className="w-5 h-5" />
            Capture Photo
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default CameraView;
