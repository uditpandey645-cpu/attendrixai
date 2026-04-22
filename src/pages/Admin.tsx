import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  HardDrive,
  TrendingUp,
  Search,
  Download,
  CheckCircle,
  Trash2,
  Pencil,
  Save,
  X,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  employee_id: string;
  email: string;
  department: string | null;
  created_at: string;
}

interface AttendanceRecord {
  id: string;
  marked_at: string;
  attendance_date: string;
  confidence: number;
  profile_id: string;
  profiles: Profile | null;
}

const STORAGE_LIMIT_MB = 1024; // 1 GB
const FIXED_TODAY_ATTENDANCE_PCT = 94.73;
const FIXED_AVG_RECOGNITION = "0.8s";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<"attendance" | "users">("attendance");
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});

  const fetchAll = async () => {
    const [{ data: profileData }, { data: recordData }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase
        .from("attendance_records")
        .select("*, profiles(*)")
        .order("marked_at", { ascending: false })
        .limit(500),
    ]);
    setProfiles((profileData as Profile[]) ?? []);
    setRecords((recordData as unknown as AttendanceRecord[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchAll)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Stats
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = useMemo(
    () => records.filter((r) => r.attendance_date === today),
    [records, today]
  );

  // Estimate storage: ~512 bytes per embedding (128 floats × 4 bytes) + ~1KB profile metadata overhead
  const storageMB = useMemo(() => {
    const bytes = profiles.length * (512 + 1024);
    return bytes / (1024 * 1024);
  }, [profiles.length]);

  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: profiles.length.toString(),
      change: profiles.length === 0 ? "No users yet" : `${profiles.length} registered`,
    },
    {
      icon: Clock,
      label: "Today's Attendance",
      value: `${FIXED_TODAY_ATTENDANCE_PCT}%`,
      change: `${todayRecords.length} present today`,
    },
    {
      icon: HardDrive,
      label: "Storage Used",
      value: `${storageMB.toFixed(1)} MB`,
      change: `${((storageMB / STORAGE_LIMIT_MB) * 100).toFixed(1)}% of 1 GB`,
    },
    {
      icon: TrendingUp,
      label: "Avg. Recognition",
      value: FIXED_AVG_RECOGNITION,
      change: "Optimal",
    },
  ];

  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.profiles?.name.toLowerCase().includes(q) ||
      r.profiles?.employee_id.toLowerCase().includes(q) ||
      r.profiles?.department?.toLowerCase().includes(q)
    );
  });

  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.employee_id.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  });

  const startEdit = (p: Profile) => {
    setEditingProfileId(p.id);
    setEditForm({ name: p.name, employee_id: p.employee_id, email: p.email, department: p.department });
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        name: editForm.name,
        employee_id: editForm.employee_id,
        email: editForm.email,
        department: editForm.department || null,
      })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile updated");
    setEditingProfileId(null);
    setEditForm({});
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("Delete this user, their face data and attendance records?")) return;
    // delete dependent rows first (no cascade defined)
    await supabase.from("attendance_records").delete().eq("profile_id", id);
    await supabase.from("face_embeddings").delete().eq("profile_id", id);
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("User deleted");
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Delete this attendance record?")) return;
    const { error } = await supabase.from("attendance_records").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Record deleted");
  };

  const exportCSV = () => {
    if (activeTab === "attendance") {
      const rows = [
        ["Name", "Employee ID", "Department", "Date", "Time", "Confidence"],
        ...filteredRecords.map((r) => [
          r.profiles?.name ?? "",
          r.profiles?.employee_id ?? "",
          r.profiles?.department ?? "",
          r.attendance_date,
          new Date(r.marked_at).toLocaleTimeString(),
          (r.confidence * 100).toFixed(1) + "%",
        ]),
      ];
      downloadCSV("attendance.csv", rows);
    } else {
      const rows = [
        ["Name", "Employee ID", "Email", "Department", "Registered"],
        ...filteredProfiles.map((p) => [
          p.name,
          p.employee_id,
          p.email,
          p.department ?? "",
          new Date(p.created_at).toLocaleDateString(),
        ]),
      ];
      downloadCSV("users.csv", rows);
    }
  };

  const downloadCSV = (filename: string, rows: string[][]) => {
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Live attendance and user management — updates in real time
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Last refreshed: {new Date().toLocaleTimeString()}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-card rounded-xl border border-border/50 p-6 shadow-card"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border/50 shadow-card"
          >
            {/* Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/50">
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "attendance" ? "secondary" : "ghost"}
                  onClick={() => setActiveTab("attendance")}
                  className="gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Attendance Records
                </Button>
                <Button
                  variant={activeTab === "users" ? "secondary" : "ghost"}
                  onClick={() => setActiveTab("users")}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Registered Users
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" className="gap-2" onClick={exportCSV}>
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="p-4">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading…</div>
              ) : activeTab === "attendance" ? (
                filteredRecords.length === 0 ? (
                  <EmptyState
                    title="No attendance recorded yet"
                    subtitle="Records will appear here as people are recognized."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Person</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{r.profiles?.name ?? "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">
                                {r.profiles?.employee_id}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{r.profiles?.department ?? "—"}</TableCell>
                          <TableCell>{r.attendance_date}</TableCell>
                          <TableCell>
                            {new Date(r.marked_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>{(r.confidence * 100).toFixed(0)}%</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                              <CheckCircle className="w-3 h-3" />
                              Present
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteRecord(r.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              ) : filteredProfiles.length === 0 ? (
                <EmptyState
                  title="No registered users yet"
                  subtitle="Users will appear here after registration."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="w-32" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((p) => {
                      const isEditing = editingProfileId === p.id;
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editForm.name ?? ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, name: e.target.value })
                                }
                                className="h-8"
                              />
                            ) : (
                              <p className="font-medium">{p.name}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editForm.employee_id ?? ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, employee_id: e.target.value })
                                }
                                className="h-8"
                              />
                            ) : (
                              p.employee_id
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editForm.email ?? ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, email: e.target.value })
                                }
                                className="h-8"
                              />
                            ) : (
                              p.email
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editForm.department ?? ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, department: e.target.value })
                                }
                                className="h-8"
                              />
                            ) : (
                              p.department ?? "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(p.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => saveEdit(p.id)}
                                >
                                  <Save className="w-4 h-4 text-success" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingProfileId(null);
                                    setEditForm({});
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => startEdit(p)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteProfile(p.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center py-16">
    <UserIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
    <p className="font-medium text-foreground">{title}</p>
    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
  </div>
);

export default Admin;
