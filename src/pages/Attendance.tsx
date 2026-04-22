import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  CheckCircle,
  Clock,
  User,
  Loader2,
  RefreshCw,
  Users,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import CameraView from "@/components/camera/CameraView";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  loadFaceModels,
  getAllFaceDescriptors,
  loadImage,
  matchFaces,
  MATCH_THRESHOLD,
  type DetectedFace,
  type MatchResult,
} from "@/lib/faceApi";

type Status = "idle" | "scanning" | "results";

interface ProfileLite {
  id: string;
  name: string;
  employee_id: string;
  department: string | null;
}

interface RecognizedPerson {
  profile: ProfileLite;
  confidence: number;
  distance: number;
  marked: boolean;
  reason?: string;
}

interface AttendanceRow {
  id: string;
  marked_at: string;
  confidence: number;
  profiles: ProfileLite | null;
}

const Attendance = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognized, setRecognized] = useState<RecognizedPerson[]>([]);
  const [unknownCount, setUnknownCount] = useState(0);
  const [totalFaces, setTotalFaces] = useState(0);
  const [recent, setRecent] = useState<AttendanceRow[]>([]);
  const [modelsReady, setModelsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFaceModels()
      .then(() => setModelsReady(true))
      .catch(() => toast.error("Failed to load face recognition models"));
  }, []);

  useEffect(() => {
    fetchRecent();
    const channel = supabase
      .channel("attendance-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance_records" },
        () => fetchRecent()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecent = async () => {
    const { data } = await supabase
      .from("attendance_records")
      .select("id, marked_at, confidence, profiles(id, name, employee_id, department)")
      .order("marked_at", { ascending: false })
      .limit(10);
    setRecent((data as unknown as AttendanceRow[]) ?? []);
  };

  const processImage = async (imageData: string) => {
    if (!modelsReady) {
      toast.error("Models still loading, please wait...");
      return;
    }
    setCapturedImage(imageData);
    setStatus("scanning");

    try {
      const img = await loadImage(imageData);
      const faces: DetectedFace[] = await getAllFaceDescriptors(img);
      setTotalFaces(faces.length);

      if (faces.length === 0) {
        toast.error("No faces detected in the image");
        setStatus("results");
        setRecognized([]);
        setUnknownCount(0);
        return;
      }

      // Fetch all stored embeddings + profiles
      const { data: embeddings, error: embErr } = await supabase
        .from("face_embeddings")
        .select("profile_id, embedding");

      if (embErr) {
        toast.error("Failed to load registered faces");
        setStatus("idle");
        return;
      }

      if (!embeddings || embeddings.length === 0) {
        toast.error("No registered users yet. Please register first.");
        setStatus("results");
        setRecognized([]);
        setUnknownCount(faces.length);
        return;
      }

      const matches: MatchResult[] = matchFaces(
        faces,
        embeddings.map((e) => ({
          profile_id: e.profile_id,
          embedding: e.embedding as number[],
        })),
        MATCH_THRESHOLD
      );

      const unknown = faces.length - matches.length;
      setUnknownCount(unknown);

      if (matches.length === 0) {
        setRecognized([]);
        setStatus("results");
        toast.error("No registered faces recognized");
        return;
      }

      const profileIds = matches.map((m) => m.profileId);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, employee_id, department")
        .in("id", profileIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      // Mark attendance for each matched user
      const today = new Date().toISOString().split("T")[0];
      const results: RecognizedPerson[] = [];

      for (const m of matches) {
        const profile = profileMap.get(m.profileId);
        if (!profile) continue;

        const { error: insertErr } = await supabase.from("attendance_records").insert({
          profile_id: m.profileId,
          confidence: m.confidence,
          attendance_date: today,
        });

        if (insertErr) {
          // Duplicate (already marked today)
          results.push({
            profile,
            confidence: m.confidence,
            distance: m.distance,
            marked: false,
            reason: insertErr.code === "23505" ? "Already marked today" : "Insert failed",
          });
        } else {
          results.push({
            profile,
            confidence: m.confidence,
            distance: m.distance,
            marked: true,
          });
        }
      }

      setRecognized(results);
      setStatus("results");
      const newlyMarked = results.filter((r) => r.marked).length;
      if (newlyMarked > 0) {
        toast.success(`Attendance marked for ${newlyMarked} ${newlyMarked === 1 ? "person" : "people"}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Face recognition failed");
      setStatus("idle");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => processImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setStatus("idle");
    setCapturedImage(null);
    setRecognized([]);
    setUnknownCount(0);
    setTotalFaces(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mark Attendance
            </h1>
            <p className="text-muted-foreground">
              Capture a photo or upload a group image — we'll recognize everyone in it
            </p>
            {!modelsReady && (
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading face recognition models...
              </div>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Mode toggle */}
                      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
                        <button
                          onClick={() => setMode("camera")}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            mode === "camera"
                              ? "bg-card text-foreground shadow-sm"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Camera className="w-4 h-4 inline mr-2" />
                          Camera
                        </button>
                        <button
                          onClick={() => setMode("upload")}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            mode === "upload"
                              ? "bg-card text-foreground shadow-sm"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Upload className="w-4 h-4 inline mr-2" />
                          Upload Group Photo
                        </button>
                      </div>

                      {mode === "camera" ? (
                        <>
                          <CameraView onCapture={processImage} />
                        </>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors bg-muted/30"
                        >
                          <Upload className="w-12 h-12 text-muted-foreground" />
                          <p className="text-foreground font-medium">Click to upload an image</p>
                          <p className="text-sm text-muted-foreground">
                            Supports group photos with multiple faces
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {status === "scanning" && (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="aspect-video rounded-xl bg-camera-bg flex items-center justify-center relative overflow-hidden"
                    >
                      {capturedImage && (
                        <img
                          src={capturedImage}
                          alt="Processing"
                          className="absolute inset-0 w-full h-full object-cover opacity-30"
                        />
                      )}
                      <div className="text-center relative z-10">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                          <div className="absolute inset-0 rounded-full border-4 border-primary flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                          </div>
                        </div>
                        <p className="text-lg font-medium text-foreground">
                          Detecting faces & matching identities...
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {status === "results" && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {capturedImage && (
                        <div className="rounded-xl overflow-hidden border border-border/50 max-h-72">
                          <img src={capturedImage} alt="Processed" className="w-full object-contain max-h-72" />
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{totalFaces}</p>
                          <p className="text-xs text-muted-foreground">Faces detected</p>
                        </div>
                        <div className="bg-success/10 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-success">
                            {recognized.filter((r) => r.marked).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Marked present</p>
                        </div>
                        <div className="bg-destructive/10 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-destructive">{unknownCount}</p>
                          <p className="text-xs text-muted-foreground">Unknown</p>
                        </div>
                      </div>

                      {recognized.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Recognized people
                          </h3>
                          {recognized.map((r) => (
                            <div
                              key={r.profile.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                r.marked
                                  ? "border-success/30 bg-success/5"
                                  : "border-border bg-muted/30"
                              }`}
                            >
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  r.marked ? "bg-success/20" : "bg-muted"
                                }`}
                              >
                                {r.marked ? (
                                  <CheckCircle className="w-5 h-5 text-success" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {r.profile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {r.profile.employee_id}
                                  {r.reason && ` • ${r.reason}`}
                                </p>
                              </div>
                              <div className="text-right text-xs">
                                <p className="font-medium text-foreground">
                                  {(r.confidence * 100).toFixed(0)}%
                                </p>
                                <p className="text-muted-foreground">confidence</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button onClick={reset} variant="outline" className="w-full gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Scan another image
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Recent attendance */}
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

              {recent.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent attendance</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((row) => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {row.profiles?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.profiles?.employee_id}
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-foreground">
                          {new Date(row.marked_at).toLocaleTimeString()}
                        </p>
                        <p className="text-muted-foreground">
                          {(row.confidence * 100).toFixed(0)}%
                        </p>
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
