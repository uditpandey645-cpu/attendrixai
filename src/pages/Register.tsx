import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Camera,
  Upload,
  CheckCircle,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import CameraView from "@/components/camera/CameraView";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  loadFaceModels,
  getSingleFaceDescriptor,
  loadImage,
} from "@/lib/faceApi";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    department: "",
    email: "",
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFaceModels().catch(() => {
      toast.error("Failed to load face recognition models");
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setUseCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setUseCamera(false);
    toast.success("Photo captured successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.employeeId || !formData.email) {
        toast.error("Please fill in all required fields");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!capturedImage) {
        toast.error("Please capture or upload a photo");
        return;
      }
      setSubmitting(true);
      try {
        await loadFaceModels();
        const img = await loadImage(capturedImage);
        const descriptor = await getSingleFaceDescriptor(img);

        if (!descriptor) {
          toast.error("No face detected in the photo. Please use a clearer image.");
          setSubmitting(false);
          return;
        }

        // Insert profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            name: formData.name,
            employee_id: formData.employeeId,
            email: formData.email,
            department: formData.department || null,
          })
          .select()
          .single();

        if (profileError) {
          if (profileError.code === "23505") {
            toast.error("Employee ID already registered");
          } else {
            toast.error(profileError.message);
          }
          setSubmitting(false);
          return;
        }

        // Insert embedding
        const { error: embError } = await supabase.from("face_embeddings").insert({
          profile_id: profile.id,
          embedding: Array.from(descriptor),
        });

        if (embError) {
          toast.error("Failed to save face data: " + embError.message);
          setSubmitting(false);
          return;
        }

        toast.success("Registration successful!");
        setStep(3);
      } catch (err) {
        console.error(err);
        toast.error("Registration failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Register for Face Attendance
            </h1>
            <p className="text-muted-foreground">
              Complete the registration to start using face-based attendance
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-12"
          >
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      s <= step
                        ? "gradient-primary text-primary-foreground shadow-glow"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 rounded-full transition-colors ${
                        s < step ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border/50 shadow-card p-8"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                      <p className="text-sm text-muted-foreground">Enter your details</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID *</Label>
                      <Input
                        id="employeeId"
                        name="employeeId"
                        placeholder="EMP-001"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        placeholder="Engineering"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full gap-2">
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.form>
              )}

              {/* Step 2: Photo Capture */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Face Photo</h2>
                      <p className="text-sm text-muted-foreground">Capture or upload your photo</p>
                    </div>
                  </div>

                  {!useCamera && !capturedImage && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setUseCamera(true)}
                        className="h-32 flex-col gap-3"
                      >
                        <Camera className="w-8 h-8 text-primary" />
                        <span>Use Camera</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-32 flex-col gap-3"
                      >
                        <Upload className="w-8 h-8 text-primary" />
                        <span>Upload Photo</span>
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  )}

                  {useCamera && (
                    <div className="space-y-4">
                      <CameraView onCapture={handleCapture} />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setUseCamera(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {capturedImage && !useCamera && (
                    <div className="space-y-4">
                      <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border-4 border-success shadow-lg">
                        <img
                          src={capturedImage}
                          alt="Captured"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => setCapturedImage(null)}
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-center text-sm text-success flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Photo captured successfully
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="hero"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={!capturedImage}
                      className="flex-1 gap-2"
                    >
                      Complete Registration
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow"
                  >
                    <CheckCircle className="w-12 h-12 text-primary-foreground" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Registration Complete!
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    You can now use face recognition to mark attendance
                  </p>

                  <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-semibold text-foreground mb-4">Your Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {formData.name}</p>
                      <p><span className="text-muted-foreground">Employee ID:</span> {formData.employeeId}</p>
                      <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                      {formData.department && (
                        <p><span className="text-muted-foreground">Department:</span> {formData.department}</p>
                      )}
                    </div>
                  </div>

                  <Button variant="hero" size="lg" asChild>
                    <a href="/attendance" className="gap-2">
                      Mark Attendance
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
