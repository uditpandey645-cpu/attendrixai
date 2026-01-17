import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Clock, 
  HardDrive, 
  TrendingUp,
  Search,
  Filter,
  Download,
  UserPlus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2
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

// Mock data
const stats = [
  { icon: Users, label: "Total Users", value: "128", change: "+12 this month", color: "primary" },
  { icon: Clock, label: "Today's Attendance", value: "94", change: "73% present", color: "success" },
  { icon: HardDrive, label: "Storage Used", value: "256 MB", change: "25% of 1 GB", color: "warning" },
  { icon: TrendingUp, label: "Avg. Recognition", value: "0.8s", change: "Optimal", color: "accent" },
];

const attendanceRecords = [
  { id: 1, name: "John Doe", employeeId: "EMP-001", department: "Engineering", time: "09:02 AM", date: "2024-01-15", status: "present" },
  { id: 2, name: "Jane Smith", employeeId: "EMP-002", department: "Design", time: "09:15 AM", date: "2024-01-15", status: "present" },
  { id: 3, name: "Mike Johnson", employeeId: "EMP-003", department: "Marketing", time: "09:45 AM", date: "2024-01-15", status: "late" },
  { id: 4, name: "Sarah Williams", employeeId: "EMP-004", department: "HR", time: "--:-- --", date: "2024-01-15", status: "absent" },
  { id: 5, name: "Tom Brown", employeeId: "EMP-005", department: "Engineering", time: "08:55 AM", date: "2024-01-15", status: "present" },
];

const registeredUsers = [
  { id: 1, name: "John Doe", employeeId: "EMP-001", email: "john@company.com", department: "Engineering", registered: "2024-01-01" },
  { id: 2, name: "Jane Smith", employeeId: "EMP-002", email: "jane@company.com", department: "Design", registered: "2024-01-03" },
  { id: 3, name: "Mike Johnson", employeeId: "EMP-003", email: "mike@company.com", department: "Marketing", registered: "2024-01-05" },
  { id: 4, name: "Sarah Williams", employeeId: "EMP-004", email: "sarah@company.com", department: "HR", registered: "2024-01-08" },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState<"attendance" | "users">("attendance");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttendance = attendanceRecords.filter(record =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = registeredUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage attendance records and users</p>
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
                  <div className={`w-12 h-12 rounded-lg gradient-primary flex items-center justify-center`}>
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
            <div className="flex items-center justify-between p-4 border-b border-border/50">
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
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="p-4">
              {activeTab === "attendance" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.name}</p>
                            <p className="text-xs text-muted-foreground">{record.employeeId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>{record.time}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === "present" 
                              ? "bg-success/10 text-success" 
                              : record.status === "late"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                          }`}>
                            {record.status === "present" && <CheckCircle className="w-3 h-3" />}
                            {record.status === "absent" && <XCircle className="w-3 h-3" />}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Record</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.employeeId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{user.registered}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Update Photo</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
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

export default Admin;
