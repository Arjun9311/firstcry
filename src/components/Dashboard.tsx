'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, DollarSign, ShieldAlert, Image, BookOpen, Package, 
  Clock, Calendar, Award, UserCheck, PhoneCall, HelpCircle, 
  MapPin, CheckSquare, Plus, Trash2, Check, Download, AlertTriangle, 
  Search, Bell, User, LogOut, RefreshCw, BarChart2, Share2, Tag, Gift, Smile, 
  Filter, CheckCircle, XCircle, ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';

// 6 Roles Configuration
const ROLES = [
  { id: 'admin', name: 'Centre Head / Admin', email: 'admin@littlecare.com', role: 'admin' },
  { id: 'teacher', name: 'Emily (Teacher)', email: 'teacher@littlecare.com', role: 'teacher' },
  { id: 'parent', name: 'David (Parent)', email: 'parent@littlecare.com', role: 'parent' },
  { id: 'daycare_staff', name: 'Jessica (Daycare)', email: 'staff@littlecare.com', role: 'daycare_staff' },
  { id: 'counsellor', name: 'Marcus (Counsellor)', email: 'counsellor@littlecare.com', role: 'counsellor' },
  { id: 'accountant', name: 'Robert (Accountant)', email: 'accountant@littlecare.com', role: 'accountant' }
];

const COLORS = ['#FFC107', '#00C49F', '#FF8042', '#0088FE', '#8884d8', '#ffc658'];

interface DashboardProps {
  initialRole: string;
  onLogout: () => void;
}

export default function Dashboard({ initialRole, onLogout }: DashboardProps) {
  const [role, setRole] = useState(initialRole);
  const [activeModule, setActiveModule] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Database Data States
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [daycareLogs, setDaycareLogs] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [bookIssues, setBookIssues] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [lostFound, setLostFound] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Search/Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Loading & Action States
  const [loading, setLoading] = useState(true);
  const [qrScanResult, setQrScanResult] = useState<any>(null);
  const [scannedQrCode, setScannedQrCode] = useState('');

  // Hydration safeguard
  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [role]);

  // Fetch all databases from Next.js endpoints
  const fetchData = async () => {
    setLoading(true);
    try {
      const email = ROLES.find(r => r.id === role)?.email || 'admin@littlecare.com';
      
      const [
        resStudents, resClasses, resFees, resInventory, resDaycare, 
        resStaff, resAttendance, resLeads, resMeetings, resMilestones, 
        resExpenses, resLibrary, resBirthdays, resLostFound, resActivities, resNotifications
      ] = await Promise.all([
        axios.get(`/api/students`),
        axios.get(`/api/students`).then(() => axios.get(`/api/occupancy`)), // returns classes with calculated details
        axios.get(`/api/fees`),
        axios.get(`/api/inventory`),
        axios.get(`/api/daycare/logs`),
        axios.get(`/api/staff`),
        axios.get(`/api/staff/attendance`),
        axios.get(`/api/leads`),
        axios.get(`/api/meetings`),
        axios.get(`/api/milestones`),
        axios.get(`/api/expenses`),
        axios.get(`/api/library/books`),
        axios.get(`/api/birthdays/upcoming`),
        axios.get(`/api/lost-found`),
        axios.get(`/api/activities`),
        axios.get(`/api/notifications?email=${email}`)
      ]);

      setStudents(resStudents.data);
      setClasses(resClasses.data);
      setFees(resFees.data);
      setInventory(resInventory.data);
      setDaycareLogs(resDaycare.data);
      setStaff(resStaff.data);
      setStaffAttendance(resAttendance.data);
      setLeads(resLeads.data);
      setMeetings(resMeetings.data);
      setMilestones(resMilestones.data);
      setExpenses(resExpenses.data);
      setLibraryBooks(resLibrary.data);
      setBirthdays(resBirthdays.data);
      setLostFound(resLostFound.data);
      setActivities(resActivities.data);
      setNotifications(resNotifications.data);

      // Extract payments list from fees response mapping
      const paymentsList = resFees.data.flatMap((f: any) => f.payments || []);
      setPayments(paymentsList);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: check modules access by role
  const hasAccess = (moduleName: string) => {
    if (role === 'admin') return true;
    
    const permissions: Record<string, string[]> = {
      teacher: ['overview', 'students', 'photos', 'curriculum', 'daycare', 'staff', 'tasks', 'meetings', 'milestones', 'library', 'lost_found', 'birthdays'],
      parent: ['overview', 'students', 'fees', 'pickup', 'photos', 'daycare', 'meetings', 'milestones', 'birthdays'],
      daycare_staff: ['overview', 'daycare', 'pickup', 'lost_found'],
      counsellor: ['overview', 'leads', 'occupancy'],
      accountant: ['overview', 'fees', 'expenses']
    };

    return permissions[role]?.includes(moduleName) || false;
  };

  // Safe side effects trigger
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setActiveModule('overview');
    setQrScanResult(null);
    setScannedQrCode('');
  };

  // jsPDF Branded Invoice Generator
  const downloadPDFReceipt = (payment: any, fee: any, student: any) => {
    const doc = new jsPDF();
    
    // Header Style
    doc.setFillColor(33, 37, 41);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("FirstCry.com (BrainBees Solutions Ltd.)", 20, 25);
    doc.setFontSize(10);
    doc.text("Business Operations Receipt", 140, 25);

    // Bill Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Receipt Details:", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt Number: ${payment.receiptNumber || 'REC-2026-N/A'}`, 20, 65);
    doc.text(`Date of Issue: ${payment.paymentDate || '2026-05-29'}`, 20, 72);
    doc.text(`Payment Mode: ${payment.paymentMethod || 'Bank Transfer'}`, 20, 79);

    // Student & Parent details
    doc.setFont("helvetica", "bold");
    doc.text("Enrolled Student Profile:", 120, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${student?.name || 'Leo Miller'}`, 120, 65);
    doc.text(`Class Assigned: Nursery`, 120, 72);
    doc.text(`Parent: ${student?.parentName || 'David Miller'}`, 120, 79);

    // Border line
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 90, 190, 90);

    // Ledger Summary Table
    doc.setFont("helvetica", "bold");
    doc.text("Description", 20, 105);
    doc.text("Amount Paid", 140, 105);
    doc.setFont("helvetica", "normal");
    doc.text(`${fee?.feeType || 'Tuition Fee Installment'}`, 20, 115);
    doc.text(`$${payment?.amount || 0}.00`, 140, 115);

    doc.line(20, 125, 190, 125);
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid:", 100, 135);
    doc.text(`$${payment?.amount || 0}.00`, 140, 135);

    // Save File
    doc.save(`Receipt-${payment.receiptNumber || 'REC-001'}.pdf`);
  };

  // Simulator: QR scanning action
  const handleVerifyQR = async (qrCode: string) => {
    try {
      const res = await axios.get(`/api/pickup/verify/${qrCode}`);
      setQrScanResult(res.data);
      if (res.data.valid) {
        // Log pickup history immediately
        await axios.post('/api/pickup/log', {
          studentId: res.data.student.id,
          guardianName: res.data.student.pickupPersons[0].name,
          relation: res.data.student.pickupPersons[0].relation
        });
        fetchData(); // Reload list
      }
    } catch (err) {
      console.error(err);
      setQrScanResult({ valid: false, error: "Network check failed" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-[#fafbfc] text-[#2D3748] font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 text-slate-700 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Sidebar Brand Logo */}
          <div className="p-6 border-b border-slate-200/60 flex items-center gap-3 bg-slate-50/30">
            <div className="h-8 w-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-extrabold text-sm">F</div>
            <span className="font-black text-lg tracking-wider bg-gradient-to-r from-slate-900 to-yellow-600 bg-clip-text text-transparent">FirstCry.com</span>
          </div>

          {/* Navigation Links list */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[70vh]">
            <SidebarLink icon={<BarChart2 className="h-4 w-4" />} label="Overview" active={activeModule === 'overview'} onClick={() => setActiveModule('overview')} />
            
            {hasAccess('students') && (
              <SidebarLink icon={<Users className="h-4 w-4" />} label="Student Profiles" active={activeModule === 'students'} onClick={() => setActiveModule('students')} />
            )}
            
            {hasAccess('fees') && (
              <SidebarLink icon={<DollarSign className="h-4 w-4" />} label="Fee installment" active={activeModule === 'fees'} onClick={() => setActiveModule('fees')} />
            )}
            
            {hasAccess('pickup') && (
              <SidebarLink icon={<ShieldAlert className="h-4 w-4" />} label="QR Pickup Audit" active={activeModule === 'pickup'} onClick={() => setActiveModule('pickup')} />
            )}

            {hasAccess('photos') && (
              <SidebarLink icon={<Image className="h-4 w-4" />} label="Activity Photo Share" active={activeModule === 'photos'} onClick={() => setActiveModule('photos')} />
            )}

            {hasAccess('curriculum') && (
              <SidebarLink icon={<BookOpen className="h-4 w-4" />} label="Curriculum Plans" active={activeModule === 'curriculum'} onClick={() => setActiveModule('curriculum')} />
            )}

            {hasAccess('inventory') && (
              <SidebarLink icon={<Package className="h-4 w-4" />} label="Learning Inventory" active={activeModule === 'inventory'} onClick={() => setActiveModule('inventory')} />
            )}

            {hasAccess('daycare') && (
              <SidebarLink icon={<Clock className="h-4 w-4" />} label="Daycare Routines" active={activeModule === 'daycare'} onClick={() => setActiveModule('daycare')} />
            )}

            {hasAccess('staff') && (
              <SidebarLink icon={<Calendar className="h-4 w-4" />} label="Staff Duty Roster" active={activeModule === 'staff'} onClick={() => setActiveModule('staff')} />
            )}

            {hasAccess('leads') && (
              <SidebarLink icon={<PhoneCall className="h-4 w-4" />} label="Admission Leads" active={activeModule === 'leads'} onClick={() => setActiveModule('leads')} />
            )}

            {hasAccess('meetings') && (
              <SidebarLink icon={<HelpCircle className="h-4 w-4" />} label="Meetings Scheduler" active={activeModule === 'meetings'} onClick={() => setActiveModule('meetings')} />
            )}

            {hasAccess('milestones') && (
              <SidebarLink icon={<Award className="h-4 w-4" />} label="Child Milestones" active={activeModule === 'milestones'} onClick={() => setActiveModule('milestones')} />
            )}

            {hasAccess('expenses') && (
              <SidebarLink icon={<DollarSign className="h-4 w-4" />} label="Centre Expenses" active={activeModule === 'expenses'} onClick={() => setActiveModule('expenses')} />
            )}

            {hasAccess('occupancy') && (
              <SidebarLink icon={<MapPin className="h-4 w-4" />} label="Occupancy metrics" active={activeModule === 'occupancy'} onClick={() => setActiveModule('occupancy')} />
            )}

            {hasAccess('library') && (
              <SidebarLink icon={<BookOpen className="h-4 w-4" />} label="Library tracker" active={activeModule === 'library'} onClick={() => setActiveModule('library')} />
            )}

            {hasAccess('birthdays') && (
              <SidebarLink icon={<Gift className="h-4 w-4" />} label="Birthdays Planner" active={activeModule === 'birthdays'} onClick={() => setActiveModule('birthdays')} />
            )}

            {hasAccess('lost_found') && (
              <SidebarLink icon={<Smile className="h-4 w-4" />} label="Lost & Found" active={activeModule === 'lost_found'} onClick={() => setActiveModule('lost_found')} />
            )}
          </nav>
        </div>

        {/* Sidebar Footer and Logout button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="text-xs text-slate-400 mb-2">Authenticated:</div>
          <div className="text-sm font-bold truncate text-slate-800">{ROLES.find(r => r.id === role)?.name}</div>
          <button 
            onClick={onLogout} 
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 py-2 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Top Header Utilities */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shadow-sm z-30">
          {/* Quick Simulation switcher */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Simulator Role:</span>
            <select 
              value={role} 
              onChange={(e) => handleRoleChange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-slate-700 shadow-sm"
            >
              {ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
              ))}
            </select>
            <button 
              onClick={fetchData} 
              title="Refresh Data"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
              >
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm">Notifications Center</span>
                    <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">
                      {notifications.filter(n => !n.isRead).length} new
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-8">All caught up!</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-50 text-xs flex gap-2.5 transition-colors ${!n.isRead ? 'bg-yellow-500/[0.03]' : ''}`}>
                          <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-800">{n.title}</div>
                            <div className="text-slate-500 mt-0.5">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                {ROLES.find(r => r.id === role)?.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs text-slate-400 uppercase font-semibold">Active User</div>
                <div className="text-xs text-slate-600 font-bold">{ROLES.find(r => r.id === role)?.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Dynamic Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-yellow-500" />
              <p className="text-sm font-semibold">Fetching operation logs...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
              {/* Module 1: Overview Summary dashboard */}
              {activeModule === 'overview' && (
                <OverviewModule 
                  role={role} 
                  students={students} 
                  staff={staff} 
                  fees={fees} 
                  expenses={expenses}
                  leads={leads}
                  inventory={inventory}
                  meetings={meetings}
                  onNavigate={setActiveModule}
                />
              )}

              {/* Module 2: Students manager */}
              {activeModule === 'students' && (
                <StudentsModule 
                  role={role} 
                  students={students} 
                  classes={classes}
                  studentSearch={studentSearch}
                  setStudentSearch={setStudentSearch}
                  classFilter={classFilter}
                  setClassFilter={setClassFilter}
                  onReload={fetchData}
                />
              )}

              {/* Module 3: Fees ledger */}
              {activeModule === 'fees' && (
                <FeesModule 
                  role={role} 
                  fees={fees} 
                  students={students} 
                  payments={payments}
                  onDownload={downloadPDFReceipt}
                  onReload={fetchData}
                />
              )}

              {/* Module 4: QR Security Audit */}
              {activeModule === 'pickup' && (
                <PickupModule 
                  role={role} 
                  students={students}
                  scannedQrCode={scannedQrCode}
                  setScannedQrCode={setScannedQrCode}
                  qrScanResult={qrScanResult}
                  onVerify={handleVerifyQR}
                  onReset={() => setQrScanResult(null)}
                />
              )}

              {/* Module 5: Activity portal uploads */}
              {activeModule === 'photos' && (
                <PhotosModule 
                  role={role} 
                  activities={activities}
                  students={students}
                  onReload={fetchData}
                />
              )}

              {/* Module 6: Curriculum theme planner */}
              {activeModule === 'curriculum' && (
                <CurriculumModule 
                  role={role}
                  onReload={fetchData}
                />
              )}

              {/* Module 7: Learning inventory */}
              {activeModule === 'inventory' && (
                <InventoryModule 
                  role={role} 
                  inventory={inventory}
                  classes={classes}
                  onReload={fetchData}
                />
              )}

              {/* Module 8: Daycare logs updates */}
              {activeModule === 'daycare' && (
                <DaycareModule 
                  role={role} 
                  daycareLogs={daycareLogs}
                  students={students}
                  onReload={fetchData}
                />
              )}

              {/* Module 9: Staff attendance/duty shifts */}
              {activeModule === 'staff' && (
                <StaffModule 
                  role={role} 
                  staff={staff}
                  staffAttendance={staffAttendance}
                  onReload={fetchData}
                />
              )}

              {/* Module 10: Leads funnel */}
              {activeModule === 'leads' && (
                <LeadsModule 
                  role={role} 
                  leads={leads}
                  onReload={fetchData}
                />
              )}

              {/* Module 11: Meeting Booking scheduler */}
              {activeModule === 'meetings' && (
                <MeetingsModule 
                  role={role} 
                  meetings={meetings}
                  onReload={fetchData}
                />
              )}

              {/* Module 12: Milestones checklists */}
              {activeModule === 'milestones' && (
                <MilestonesModule 
                  role={role} 
                  milestones={milestones}
                  students={students}
                  onReload={fetchData}
                />
              )}

              {/* Module 13: Centre Expenses log */}
              {activeModule === 'expenses' && (
                <ExpensesModule 
                  role={role} 
                  expenses={expenses}
                  onReload={fetchData}
                />
              )}

              {/* Module 14: Class occupancy maps */}
              {activeModule === 'occupancy' && (
                <OccupancyModule 
                  classes={classes}
                />
              )}

              {/* Module 15: Library tracker */}
              {activeModule === 'library' && (
                <LibraryModule 
                  role={role} 
                  libraryBooks={libraryBooks}
                  students={students}
                  onReload={fetchData}
                />
              )}

              {/* Module 16: Birthdays planner */}
              {activeModule === 'birthdays' && (
                <BirthdaysModule 
                  role={role} 
                  birthdays={birthdays}
                  onReload={fetchData}
                />
              )}

              {/* Module 17: Lost & Found items log */}
              {activeModule === 'lost_found' && (
                <LostFoundModule 
                  role={role} 
                  lostFound={lostFound}
                  onReload={fetchData}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Side Links design component
function SidebarLink({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/10 border border-yellow-600/10' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ==========================================
// SUBMODULE: OVERVIEW (METRICS & CHARTS)
// ==========================================
function OverviewModule({ 
  role, students, staff, fees, expenses, leads, inventory, meetings, onNavigate 
}: any) {
  // Calculations
  const pendingFeesSum = fees.reduce((sum: number, f: any) => sum + f.pendingAmount, 0);
  const collectedFeesSum = fees.reduce((sum: number, f: any) => sum + f.paidAmount, 0);
  const expensesSum = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const activeEnquiriesCount = leads.filter((l: any) => l.status !== 'Converted' && l.status !== 'Lost').length;
  const lowStockCount = inventory.filter((i: any) => i.quantity <= i.lowStockThreshold).length;
  const upcomingMeetingsCount = meetings.filter((m: any) => m.status === 'Requested' || m.status === 'Confirmed').length;

  // Chart data
  const billingChartData = [
    { name: 'Income (Fees)', amount: collectedFeesSum },
    { name: 'Expenses', amount: expensesSum }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Business Control Panel</h1>
        <p className="text-slate-500 text-sm">Real-time occupancy, fee ledgers, and operational parameters.</p>
      </div>

      {/* Numerical Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard 
          icon={<Users className="text-blue-500" />} 
          bg="bg-blue-50"
          title="Total Kids" 
          value={students.length} 
          subtitle="Enrolled in Nursery/Daycare"
          onClick={() => onNavigate('students')}
        />
        <OverviewCard 
          icon={<DollarSign className="text-green-500" />} 
          bg="bg-green-50"
          title="Fees Collected" 
          value={`$${collectedFeesSum}`} 
          subtitle={`Pending: $${pendingFeesSum}`}
          onClick={() => onNavigate('fees')}
        />
        <OverviewCard 
          icon={<ShieldAlert className="text-red-500" />} 
          bg="bg-red-50"
          title="Low Materials" 
          value={lowStockCount} 
          subtitle="Items below safety threshold"
          onClick={() => onNavigate('inventory')}
          alert={lowStockCount > 0}
        />
        <OverviewCard 
          icon={<Clock className="text-yellow-500" />} 
          bg="bg-yellow-50"
          title="Meetings Scheduled" 
          value={upcomingMeetingsCount} 
          subtitle="Parent-Teacher sessions"
          onClick={() => onNavigate('meetings')}
        />
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-base mb-6">Revenue Balance Ledger</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={billingChartData}>
                <XAxis dataKey="name" stroke="#A0AEC0" fontSize={12} />
                <YAxis stroke="#A0AEC0" fontSize={12} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="amount" fill="#FFC107" radius={[10, 10, 0, 0]}>
                  {billingChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead stage summary and pipeline review */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-800 text-base mb-6">Enquiries Funnel Stage</h3>
          <div className="space-y-4">
            <LeadStageRow label="New Queries" count={leads.filter((l: any) => l.status === 'New').length} color="bg-blue-500" total={leads.length} />
            <LeadStageRow label="Demo Scheduled" count={leads.filter((l: any) => l.status === 'Demo Scheduled').length} color="bg-yellow-500" total={leads.length} />
            <LeadStageRow label="Converted Admissions" count={leads.filter((l: any) => l.status === 'Converted').length} color="bg-green-500" total={leads.length} />
            <LeadStageRow label="Contact Logs" count={leads.filter((l: any) => l.status === 'Contacted').length} color="bg-slate-400" total={leads.length} />
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 flex items-center justify-between text-xs text-slate-400">
            <span>Occupancy Ratio:</span>
            <span className="font-bold text-slate-700">75% Capacity In Use</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ icon, bg, title, value, subtitle, onClick, alert }: any) {
  return (
    <button 
      onClick={onClick}
      className={`text-left w-full bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${alert ? 'ring-2 ring-red-500/20' : ''}`}
    >
      <div className="space-y-2">
        <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">{title}</span>
        <h2 className="text-3xl font-black text-slate-800">{value}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-inner`}>
        {icon}
      </div>
    </button>
  );
}

function LeadStageRow({ label, count, color, total }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>{count} ({Math.round(percentage)}%)</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: STUDENTS LIST (CRUD)
// ==========================================
function StudentsModule({ role, students, classes, studentSearch, setStudentSearch, classFilter, setClassFilter, onReload }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formClass, setFormClass] = useState('c1');
  const [formAllergies, setFormAllergies] = useState('');
  const [formParent, setFormParent] = useState('');
  const [formPhone, setFormPhone] = useState('');

  const filtered = students.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.parentName.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesClass = classFilter === 'all' || s.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formParent || !formPhone) return;

    try {
      await axios.post('/api/students', {
        name: formName,
        classId: formClass,
        ageGroup: formClass === 'c1' ? '1.5 - 2.5 Years' : formClass === 'c2' ? '2.5 - 3.5 Years' : '3.5 - 5 Years',
        allergies: formAllergies || 'None',
        medicalNotes: 'Pre-school registration log',
        parentName: formParent,
        parentPhone: formPhone,
        emergencyContact: `${formParent} (${formPhone})`,
        pickupPersons: [
          { name: formParent, relation: 'Parent', phone: formPhone, photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }
        ]
      });

      // Clear Form
      setFormName('');
      setFormAllergies('');
      setFormParent('');
      setFormPhone('');
      setShowAddForm(false);
      onReload(); // reload database
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student profile?")) return;
    try {
      await axios.delete(`/api/students/${id}`);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Class-wise Students</h1>
          <p className="text-slate-500 text-sm">View allergy cards, check-in profiles, and guardians contact lists.</p>
        </div>
        
        {role === 'admin' && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Register Student
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddStudent} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Child Full Name</label>
            <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Assigned Class Room</label>
            <select value={formClass} onChange={e => setFormClass(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              <option value="c1">Tiny Tots (Toddlers)</option>
              <option value="c2">Little Explorers (Nursery)</option>
              <option value="c3">Kinder Minds (Preschool)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Allergies/Medical Notes</label>
            <input type="text" placeholder="e.g. Peanut allergy" value={formAllergies} onChange={e => setFormAllergies(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Parent/Guardian Name</label>
            <input required type="text" value={formParent} onChange={e => setFormParent(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Guardian Contact Phone</label>
            <input required type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Submit</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or parent..." 
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select 
            value={classFilter} 
            onChange={e => setClassFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white text-sm py-1.5 px-3 focus:outline-none text-slate-700"
          >
            <option value="all">All Classes</option>
            <option value="c1">Tiny Tots (Toddlers)</option>
            <option value="c2">Little Explorers (Nursery)</option>
            <option value="c3">Kinder Minds (Preschool)</option>
          </select>
        </div>
      </div>

      {/* Student List cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((s: any) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-6 flex items-start gap-4">
              <img src={s.photo} alt={s.name} className="h-16 w-16 rounded-xl object-cover border border-slate-100" />
              <div>
                <h3 className="font-extrabold text-slate-800 text-base leading-tight">{s.name}</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full inline-block mt-1.5 font-bold">
                  {s.classId === 'c1' ? 'Tiny Tots' : s.classId === 'c2' ? 'Explorers' : 'Kinder Minds'}
                </span>
                <p className="text-xs text-slate-400 mt-2">Age Group: {s.ageGroup}</p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4 border-t border-slate-50 space-y-3 bg-slate-50/50">
              <div className="text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Medical Alerts</span>
                <span className={`inline-block mt-1 font-semibold rounded px-2 py-0.5 ${s.allergies !== 'None' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                  {s.allergies}
                </span>
              </div>

              <div className="text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Guardian Contacts</span>
                <p className="font-semibold text-slate-700 mt-1">{s.parentName} ({s.parentPhone})</p>
              </div>
            </div>

            {role === 'admin' && (
              <div className="px-6 py-3 bg-slate-100/50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => handleDelete(s.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Profile
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: FEES & RECEIPTS
// ==========================================
function FeesModule({ role, fees, students, payments, onDownload, onReload }: any) {
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Card');

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal || !payAmount) return;

    try {
      await axios.post('/api/payments', {
        feeId: showPayModal,
        amount: Number(payAmount),
        paymentMethod: payMethod
      });
      setPayAmount('');
      setShowPayModal(null);
      onReload(); // reload list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Fees & Receipt Tracker</h1>
        <p className="text-slate-500 text-sm">Invoice schedules, outstanding collections ledger, and PDF downloads.</p>
      </div>

      {/* Payment recording modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRecordPayment} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="font-extrabold text-lg">Record Payment Receipt</h3>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Payment Amount ($)</label>
              <input 
                required 
                type="number" 
                max={fees.find((f: any) => f.id === showPayModal)?.pendingAmount}
                value={payAmount} 
                onChange={e => setPayAmount(e.target.value)} 
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Method</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
                <option value="Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Wire Transfer</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowPayModal(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-yellow-500 text-black font-extrabold rounded-lg text-sm hover:bg-yellow-400">Record Payment</button>
            </div>
          </form>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="p-4">Student Profile</th>
              <th className="p-4">Fee Category</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Paid Ledger</th>
              <th className="p-4">Outstanding Balance</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
              {role === 'accountant' || role === 'admin' ? <th className="p-4 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {fees.map((f: any) => (
              <tr key={f.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">{f.student?.name || 'Leo Miller'}</td>
                <td className="p-4">{f.feeType}</td>
                <td className="p-4 font-bold">${f.totalAmount}</td>
                <td className="p-4 text-green-600 font-semibold">${f.paidAmount}</td>
                <td className="p-4 text-red-500 font-semibold">${f.pendingAmount}</td>
                <td className="p-4 text-slate-400">{f.dueDate}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    f.status === 'Paid' ? 'bg-green-50 text-green-600' :
                    f.status === 'Partially Paid' ? 'bg-yellow-50 text-yellow-600' :
                    f.status === 'Overdue' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {f.status}
                  </span>
                </td>
                {(role === 'accountant' || role === 'admin') && (
                  <td className="p-4 text-right">
                    {f.pendingAmount > 0 && (
                      <button 
                        onClick={() => setShowPayModal(f.id)}
                        className="rounded-lg bg-black text-white hover:bg-slate-800 text-xs font-bold py-1 px-3"
                      >
                        Record Payment
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipts list section */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-base">Historical Transaction Receipts</h3>
        <div className="space-y-3">
          {payments.map((p: any) => {
            const fee = fees.find((f: any) => f.id === p.feeId);
            const student = fee ? students.find((s: any) => s.id === fee.studentId) : null;
            return (
              <div key={p.id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-slate-200 transition-colors">
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-800 text-sm">{p.receiptNumber}</div>
                  <div className="text-slate-500">{student?.name} - {fee?.feeType}</div>
                  <div className="text-slate-400">{p.paymentDate} via <span className="font-semibold text-slate-600">{p.paymentMethod}</span></div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-sm text-green-600">${p.amount}</span>
                  <button 
                    onClick={() => onDownload(p, fee, student)}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: QR SECURITY AUDIT
// ==========================================
function PickupModule({ role, students, scannedQrCode, setScannedQrCode, qrScanResult, onVerify, onReset }: any) {
  // Parent View
  if (role === 'parent') {
    const parentStudent = students[0]; // Leo Miller
    return (
      <div className="space-y-6 max-w-lg mx-auto text-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Authorized Guardian QR</h1>
          <p className="text-slate-500 text-sm">Present this QR code to the daycare terminal scanner during pickups.</p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-md space-y-6">
          <div className="inline-block p-4 border border-slate-200 rounded-2xl bg-white shadow-inner">
            {/* Display simulated QR code image */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PICKUP-Lmiller-s1-David`} 
              alt="Leo Miller Pickup QR" 
              className="mx-auto"
            />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">{parentStudent?.name}'s Pickup Token</h3>
            <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
              <Check className="h-3 w-3" /> Secure Active Token
            </span>
          </div>
          <div className="border-t border-slate-100 pt-4 text-xs text-slate-400 leading-relaxed text-left">
            This QR code refreshes dynamically and verifies that the holder has permission to pick up {parentStudent?.name} today.
          </div>
        </div>
      </div>
    );
  }

  // Daycare/Admin View (Scanner Simulator)
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">QR Pickup Verification Terminal</h1>
        <p className="text-slate-500 text-sm">Scan parent QR tokens at dismissal to verify identity and child association.</p>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
        <h3 className="font-extrabold text-slate-800 text-base">Terminal Scanner Simulation</h3>
        
        {qrScanResult ? (
          <div className={`p-6 rounded-xl border flex flex-col items-center gap-4 text-center ${
            qrScanResult.valid ? 'border-green-500/20 bg-green-500/[0.03]' : 'border-red-500/20 bg-red-500/[0.03]'
          }`}>
            {qrScanResult.valid ? (
              <>
                <div className="h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Check className="h-6 w-6 stroke-[3px]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-green-700 text-lg">ACCESS GRANTED</h4>
                  <p className="text-slate-600 text-sm mt-1">
                    Verified Guardian for: <span className="font-bold text-slate-800">{qrScanResult.student.name}</span>
                  </p>
                </div>
                <div className="border border-slate-100 bg-white p-4 rounded-xl max-w-sm w-full flex items-center gap-3">
                  <img src={qrScanResult.student.photo} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="text-left text-xs">
                    <div className="font-extrabold text-slate-800">{qrScanResult.student.name}</div>
                    <div className="text-slate-500 mt-0.5">Allergies: {qrScanResult.student.allergies}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Emergency: {qrScanResult.student.emergencyContact}</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/25">
                  <AlertTriangle className="h-6 w-6 stroke-[3px]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-red-700 text-lg">ACCESS DENIED</h4>
                  <p className="text-slate-600 text-sm mt-1">{qrScanResult.error || "Token has expired or is invalid."}</p>
                </div>
              </>
            )}
            <button 
              onClick={onReset}
              className="mt-4 rounded-xl bg-black text-white px-5 py-2 text-xs font-bold"
            >
              Verify Another Token
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">Click a quick mock link below to simulate scanning a parent QR:</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onVerify('PICKUP-Lmiller-s1-David')}
                className="rounded-xl border border-slate-200 hover:border-yellow-500 bg-slate-50 hover:bg-slate-100 p-4 text-xs font-bold text-slate-700 transition-all text-left flex items-center justify-between"
              >
                <span>Scan Leo Miller's QR (Valid)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => onVerify('EXPIRED-TOKEN-KEY')}
                className="rounded-xl border border-slate-200 hover:border-red-500 bg-slate-50 hover:bg-slate-100 p-4 text-xs font-bold text-slate-700 transition-all text-left flex items-center justify-between"
              >
                <span>Scan Expired QR (Invalid)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: ACTIVITY PORTAL UPLOADER
// ==========================================
function PhotosModule({ role, activities, students, onReload }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTag, setFormTag] = useState('');

  // Parent limits tag matching
  const parentStudentId = role === 'parent' ? students[0]?.id : null;
  const filtered = parentStudentId 
    ? activities.filter((a: any) => a.tags && a.tags.includes(parentStudentId))
    : activities;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDesc) return;

    try {
      await axios.post('/api/activities', {
        title: formTitle,
        description: formDesc,
        date: new Date().toISOString().split('T')[0],
        tags: formTag ? [formTag] : [],
        photos: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400"]
      });

      setFormTitle('');
      setFormDesc('');
      setFormTag('');
      setShowAddForm(false);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this photo upload?")) return;
    try {
      await axios.delete(`/api/activities/${id}`);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Daily Activity Portal</h1>
          <p className="text-slate-500 text-sm">Share classroom moments, craft progress, and outdoor exploration feeds.</p>
        </div>

        {(role === 'teacher' || role === 'admin') && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Upload Photos
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleUpload} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Activity Title</label>
            <input required type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Tag Child Profile</label>
            <select value={formTag} onChange={e => setFormTag(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              <option value="">No Tag</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 md:col-span-3">
            <label className="text-xs font-bold text-slate-400 uppercase">Brief Activity Description</label>
            <textarea required rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Upload Moment</button>
          </div>
        </form>
      )}

      {/* Gallery Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filtered.map((act: any) => (
          <div key={act.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <img 
                src={act.photos && act.photos.length > 0 ? act.photos[0].url : "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400"} 
                alt={act.title} 
                className="h-48 w-full object-cover border-b border-slate-50"
              />
              <div className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{act.date}</span>
                  {act.tags && act.tags.length > 0 && (
                    <span className="bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                      <Tag className="h-3 w-3" />
                      {students.find((s: any) => s.id === act.tags[0])?.name || 'Tagged'}
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{act.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{act.description}</p>
              </div>
            </div>

            {(role === 'teacher' || role === 'admin') && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => handleDelete(act.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: CURRICULUM THEME PLANNER
// ==========================================
function CurriculumModule({ role, onReload }: any) {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const res = await axios.get('/api/curriculum');
    setPlans(res.data);
  };

  const handleToggleLesson = async (planId: string, idx: number, currentVal: boolean) => {
    try {
      const plan = plans.find(p => p.id === planId);
      const weeklyLessons = [...plan.weeklyLessons];
      weeklyLessons[idx].completed = !currentVal;
      
      await axios.put(`/api/curriculum/${planId}`, { weeklyLessons });
      loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Curriculum & Lesson Planner</h1>
        <p className="text-slate-500 text-sm">Monitor monthly themes, story lists, worksheets downloads, and lessons checklists.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Lesson check matrices */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm lg:col-span-2 space-y-6">
          {plans.map((p: any) => (
            <div key={p.id} className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">{p.theme}</h3>
                  <p className="text-xs text-slate-400">Class: {p.className} | Month: {p.month}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                  p.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {p.status}
                </span>
              </div>

              <div className="space-y-3">
                {p.weeklyLessons.map((l: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-slate-50 rounded-xl hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <button 
                        disabled={role === 'parent'}
                        onClick={() => handleToggleLesson(p.id, idx, l.completed)}
                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                          l.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white hover:border-slate-400'
                        }`}
                      >
                        {l.completed && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                      </button>
                      <span className={`text-xs font-semibold ${l.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {l.week}: {l.topic}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {l.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Stories & Worksheets Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Thematic Storybooks</h3>
            <div className="space-y-2.5">
              {plans[0]?.stories?.map((story: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0" />
                  <span>{story}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Download Worksheets</h3>
            <div className="space-y-3">
              {plans[0]?.worksheets?.map((sheet: string, idx: number) => (
                <a 
                  key={idx} 
                  href="#" 
                  onClick={e => { e.preventDefault(); alert(`Downloading simulated worksheet: ${sheet}`); }}
                  className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-yellow-500 hover:bg-yellow-500/[0.02] text-xs font-bold text-slate-700 transition-all"
                >
                  <span>{sheet}</span>
                  <Download className="h-4 w-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: LEARNING MATERIAL INVENTORY
// ==========================================
function InventoryModule({ role, inventory, classes, onReload }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCat, setFormCat] = useState('Toys');
  const [formQty, setFormQty] = useState('');
  const [formClass, setFormClass] = useState('c1');

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formQty) return;

    try {
      await axios.post('/api/inventory', {
        name: formName,
        category: formCat,
        quantity: Number(formQty),
        damagedQuantity: 0,
        assignedClassId: formClass,
        lowStockThreshold: 3
      });

      setFormName('');
      setFormQty('');
      setShowAddForm(false);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDamaged = async (id: string, currentDamaged: number, currentQty: number) => {
    if (currentQty <= 0) return;
    try {
      await axios.put(`/api/inventory/${id}`, {
        quantity: currentQty - 1,
        damagedQuantity: currentDamaged + 1
      });
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Toy & Material Inventory</h1>
          <p className="text-slate-500 text-sm">Track materials, log damaged play equipment, and resolve safety thresholds.</p>
        </div>

        {role === 'admin' && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Add Material Item
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddItem} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl animate-in fade-in duration-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Item Name</label>
            <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
            <select value={formCat} onChange={e => setFormCat(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              <option value="Toys">Toys</option>
              <option value="Art">Art & Craft</option>
              <option value="Books">Books</option>
              <option value="Kits">Activity Kits</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Stock Quantity</label>
            <input required type="number" value={formQty} onChange={e => setFormQty(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Assign Classroom</label>
            <select value={formClass} onChange={e => setFormClass(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              <option value="c1">Tiny Tots</option>
              <option value="c2">Nursery</option>
              <option value="c3">Preschool</option>
            </select>
          </div>
          <div className="md:col-span-4 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Submit Item</button>
          </div>
        </form>
      )}

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="p-4">Material Details</th>
              <th className="p-4">Class Allocation</th>
              <th className="p-4">Active Stock</th>
              <th className="p-4">Damaged items</th>
              <th className="p-4">Safety Status</th>
              {role === 'admin' && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {inventory.map((i: any) => (
              <tr key={i.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">{i.name} <span className="text-slate-400 font-normal text-xs">({i.category})</span></td>
                <td className="p-4">{i.className}</td>
                <td className="p-4 font-bold text-slate-700">{i.quantity}</td>
                <td className="p-4 text-red-500 font-semibold">{i.damagedQuantity} units</td>
                <td className="p-4">
                  {i.quantity <= i.lowStockThreshold ? (
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-50 text-red-500 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Low Stock Warning
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      Stock Secure
                    </span>
                  )}
                </td>
                {role === 'admin' && (
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleAddDamaged(i.id, i.damagedQuantity, i.quantity)}
                      disabled={i.quantity <= 0}
                      className="rounded-lg border border-slate-200 hover:border-red-500 hover:bg-red-50 text-xs font-bold py-1 px-3 disabled:opacity-50"
                    >
                      Log Damaged Item
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: DAYCARE ROUTINES (MEALS/NAPS)
// ==========================================
function DaycareModule({ role, daycareLogs, students, onReload }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formStudent, setFormStudent] = useState('s1');
  const [formMeal, setFormMeal] = useState('');
  const [formNap, setFormNap] = useState('');
  const [formMood, setFormMood] = useState('Happy');
  const [formNotes, setFormNotes] = useState('');

  // Parent restrictions (only view child logs)
  const parentStudentId = role === 'parent' ? students[0]?.id : null;
  const filtered = parentStudentId 
    ? daycareLogs.filter((l: any) => l.studentId === parentStudentId)
    : daycareLogs;

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMeal || !formNotes) return;

    try {
      await axios.post('/api/daycare/logs', {
        studentId: formStudent,
        date: new Date().toISOString().split('T')[0],
        meals: [
          { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), desc: formMeal }
        ],
        naps: [
          { start: "02:00 PM", end: "03:30 PM", desc: formNap || "N/A" }
        ],
        plays: ["Blocks", "Story Circle"],
        diapers: [
          { time: "10:30 AM", status: "Dry change" }
        ],
        mood: formMood,
        notes: formNotes
      });

      setFormMeal('');
      setFormNap('');
      setFormNotes('');
      setShowAddForm(false);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Daycare Routine Tracker</h1>
          <p className="text-slate-500 text-sm">Verify nap cycles, log diaper switches, track meal intake, and evaluate mood indexes.</p>
        </div>

        {(role === 'daycare_staff' || role === 'admin') && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Log Daily Routine
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddLog} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl animate-in fade-in duration-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Select Student</label>
            <select value={formStudent} onChange={e => setFormStudent(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Meals Log Intake</label>
            <input required type="text" placeholder="e.g. Oatmeal with fruits - Ate all" value={formMeal} onChange={e => setFormMeal(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Nap Log duration</label>
            <input type="text" placeholder="e.g. Slept 1.5 hours" value={formNap} onChange={e => setFormNap(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Mood Evaluated</label>
            <select value={formMood} onChange={e => setFormMood(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              <option value="Happy">Happy</option>
              <option value="Calm">Calm</option>
              <option value="Energetic">Energetic</option>
              <option value="Sleepy">Sleepy</option>
              <option value="Cranky">Cranky</option>
            </select>
          </div>
          <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Daycare Staff Observation notes</label>
            <textarea required rows={2} value={formNotes} onChange={e => setFormNotes(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="md:col-span-4 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Save Routine</button>
          </div>
        </form>
      )}

      {/* Routine list layout */}
      <div className="space-y-6">
        {filtered.map((log: any) => (
          <div key={log.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">{log.studentName}</h3>
                <p className="text-xs text-slate-400">Date Logged: {log.date}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-yellow-50 text-yellow-600 px-2.5 py-0.5 rounded-full">
                  Mood: {log.mood}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Meal Intake logs</span>
                {log.meals?.map((m: any, idx: number) => (
                  <div key={idx} className="font-medium">{m.time}: <span className="font-semibold text-slate-700">{m.desc}</span></div>
                ))}
              </div>
              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Nap duration logs</span>
                {log.naps?.map((n: any, idx: number) => (
                  <div key={idx} className="font-medium">Sleep Cycle: <span className="font-semibold text-slate-700">{n.start} - {n.end} ({n.desc})</span></div>
                ))}
              </div>
              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Daycare Notes</span>
                <p className="font-medium leading-relaxed">{log.notes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: STAFF MANAGEMENT & ATTENDANCE
// ==========================================
function StaffModule({ role, staff, staffAttendance, onReload }: any) {
  const [showRosterForm, setShowRosterForm] = useState(false);
  const [rosterStaff, setRosterStaff] = useState('st1');
  const [rosterArea, setRosterArea] = useState('Nursery Room');
  const [rosterShift, setRosterShift] = useState('Morning (8:30 AM - 1:30 PM)');

  const handleMarkAttendance = async (staffId: string, status: string) => {
    try {
      await axios.post('/api/staff/attendance', {
        staffId,
        date: new Date().toISOString().split('T')[0],
        status,
        checkIn: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        checkOut: ""
      });
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/staff/roster', {
        staffId: rosterStaff,
        date: new Date().toISOString().split('T')[0],
        shift: rosterShift,
        assignedArea: rosterArea
      });
      setShowRosterForm(false);
      alert("Shift Roster added to calendar!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Staff Attendance & Duty Roster</h1>
          <p className="text-slate-500 text-sm">Verify helper shifts, mark teacher attendance logs, and resolve class assignments.</p>
        </div>

        {role === 'admin' && (
          <button 
            onClick={() => setShowRosterForm(!showRosterForm)}
            className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Assign Duty Shift
          </button>
        )}
      </div>

      {showRosterForm && (
        <form onSubmit={handleSaveRoster} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl animate-in duration-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Select Staff Member</label>
            <select value={rosterStaff} onChange={e => setRosterStaff(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              {staff.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Shift Duration</label>
            <select value={rosterShift} onChange={e => setRosterShift(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              <option value="Morning (8:30 AM - 1:30 PM)">Morning Shift</option>
              <option value="Afternoon (1:30 PM - 6:30 PM)">Afternoon Shift</option>
              <option value="Full Day (9:00 AM - 6:00 PM)">Full Day Shift</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Assigned Location area</label>
            <input required type="text" value={rosterArea} onChange={e => setRosterArea(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowRosterForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Assign Duty</button>
          </div>
        </form>
      )}

      {/* Staff Attendance lists */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="p-4">Staff Member</th>
              <th className="p-4">Primary Roster Class</th>
              <th className="p-4">Assigned Shift</th>
              <th className="p-4">Check-in Status</th>
              {role === 'admin' && <th className="p-4 text-right">Attendance Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {staff.map((s: any) => {
              const att = staffAttendance.find((a: any) => a.staffId === s.id);
              return (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{s.name} <span className="text-slate-400 font-normal text-xs">({s.role})</span></td>
                  <td className="p-4">{s.className}</td>
                  <td className="p-4">{s.shift}</td>
                  <td className="p-4">
                    {att ? (
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        att.status === 'Present' ? 'bg-green-50 text-green-600' :
                        att.status === 'Late' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {att.status} ({att.checkIn})
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                        Not Marked
                      </span>
                    )}
                  </td>
                  {role === 'admin' && (
                    <td className="p-4 text-right">
                      {!att && (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleMarkAttendance(s.id, 'Present')} className="rounded-lg bg-green-50 text-green-600 text-[10px] font-extrabold py-1 px-2 border border-green-500/20">Present</button>
                          <button onClick={() => handleMarkAttendance(s.id, 'Late')} className="rounded-lg bg-yellow-50 text-yellow-600 text-[10px] font-extrabold py-1 px-2 border border-yellow-500/20">Late</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: ADMISSION COUNSELLOR (LEADS)
// ==========================================
function LeadsModule({ role, leads, onReload }: any) {
  const [showAddLead, setShowAddLead] = useState(false);
  const [formChild, setFormChild] = useState('');
  const [formAge, setFormAge] = useState('2 Years');
  const [formParent, setFormParent] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formChild || !formParent || !formPhone || !formEmail) return;

    try {
      await axios.post('/api/leads', {
        childName: formChild,
        childAge: formAge,
        parentName: formParent,
        parentPhone: formPhone,
        email: formEmail,
        counsellorId: 'u5',
        status: 'New',
        nextFollowupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Lead generated in counsellor follow-up system.'
      });

      setFormChild('');
      setFormParent('');
      setFormPhone('');
      setFormEmail('');
      setShowAddLead(false);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvert = async (leadId: string) => {
    try {
      await axios.patch(`/api/leads/${leadId}/convert`, {});
      alert("Successfully converted lead! Student Profile & Parent Account created automatically.");
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Admissions & Leads pipeline</h1>
          <p className="text-slate-500 text-sm">Counsel leads, schedule visits, and trigger conversions.</p>
        </div>

        {role === 'counsellor' && (
          <button 
            onClick={() => setShowAddLead(!showAddLead)}
            className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Log Enquiry Lead
          </button>
        )}
      </div>

      {showAddLead && (
        <form onSubmit={handleCreateLead} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-5 gap-4 max-w-5xl animate-in duration-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Child Name</label>
            <input required type="text" value={formChild} onChange={e => setFormChild(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Child Age</label>
            <input required type="text" placeholder="e.g. 3 Years" value={formAge} onChange={e => setFormAge(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Parent Name</label>
            <input required type="text" value={formParent} onChange={e => setFormParent(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Phone</label>
            <input required type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Parent Email</label>
            <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="md:col-span-5 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddLead(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Log Lead</button>
          </div>
        </form>
      )}

      {/* Kanban Stages Board columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <LeadPipelineColumn title="New Enquiries" color="border-blue-500" leads={leads.filter((l: any) => l.status === 'New')} onConvert={handleConvert} />
        <LeadPipelineColumn title="Follow-up needed" color="border-yellow-500" leads={leads.filter((l: any) => l.status === 'Follow-up Needed')} onConvert={handleConvert} />
        <LeadPipelineColumn title="Demo Scheduled" color="border-purple-500" leads={leads.filter((l: any) => l.status === 'Demo Scheduled')} onConvert={handleConvert} />
        <LeadPipelineColumn title="Converted Admissions" color="border-green-500" leads={leads.filter((l: any) => l.status === 'Converted')} onConvert={handleConvert} />
      </div>
    </div>
  );
}

function LeadPipelineColumn({ title, color, leads, onConvert }: any) {
  return (
    <div className="space-y-4">
      <div className={`p-3 border-b-2 ${color} bg-white rounded-xl shadow-sm flex items-center justify-between`}>
        <span className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">{title}</span>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{leads.length}</span>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {leads.map((l: any) => (
          <div key={l.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3 hover:border-yellow-500/30 transition-colors">
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-slate-800 text-sm">{l.childName} <span className="text-slate-400 font-normal text-xs">({l.childAge})</span></h4>
              <p className="text-xs text-slate-500">Parent: {l.parentName}</p>
              <p className="text-[10px] text-slate-400">{l.email} | {l.parentPhone}</p>
            </div>
            <div className="text-[10px] bg-slate-50 p-2 rounded-lg text-slate-500 border border-slate-100 leading-normal">
              {l.notes}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px]">
              <span className="text-slate-400">Next Followup: {l.nextFollowupDate}</span>
              {l.status !== 'Converted' && (
                <button 
                  onClick={() => onConvert(l.id)}
                  className="rounded bg-green-50 text-green-600 border border-green-500/20 px-2 py-0.5 font-bold hover:bg-green-600 hover:text-white transition-colors"
                >
                  Convert
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: MEETING SCHEDULER
// ==========================================
function MeetingsModule({ role, meetings, onReload }: any) {
  const [showBook, setShowBook] = useState(false);
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('10:00 AM');
  const [bookNotes, setBookNotes] = useState('');

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookDate) return;

    try {
      await axios.post('/api/meetings', {
        parentId: 'u3', // parent David
        teacherId: 'u2', // teacher Emily
        date: bookDate,
        time: bookTime,
        status: 'Requested',
        notes: bookNotes || 'Parent requested classroom review.'
      });

      setBookDate('');
      setBookNotes('');
      setShowBook(false);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`/api/meetings/${id}/status`, { status });
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Meetings & Schedules</h1>
          <p className="text-slate-500 text-sm">Schedule conferences, confirm slots, and write evaluation reports.</p>
        </div>

        {role === 'parent' && (
          <button 
            onClick={() => setShowBook(!showBook)}
            className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Request Conference Slot
          </button>
        )}
      </div>

      {showBook && (
        <form onSubmit={handleBook} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl animate-in duration-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Select Meeting Date</label>
            <input required type="date" value={bookDate} onChange={e => setBookDate(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Slot Time</label>
            <select value={bookTime} onChange={e => setBookTime(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              <option value="10:00 AM">10:00 AM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
            </select>
          </div>
          <div className="space-y-1 md:col-span-3">
            <label className="text-xs font-bold text-slate-400 uppercase">Conference Agenda Notes</label>
            <textarea required rows={2} placeholder="e.g. Discuss Leo's speech development progress" value={bookNotes} onChange={e => setBookNotes(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowBook(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Book Slot</button>
          </div>
        </form>
      )}

      {/* Meeting slots list */}
      <div className="space-y-4">
        {meetings.map((m: any) => (
          <div key={m.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-800 text-sm">Parent: {m.parentName}</span>
                <span className="text-slate-400 font-bold">|</span>
                <span className="font-semibold text-slate-600 text-xs">Teacher: {m.teacherName}</span>
              </div>
              <p className="text-slate-500">Scheduled: <span className="font-bold text-slate-700">{m.date} at {m.time}</span></p>
              <p className="text-slate-400 italic">Notes: "{m.notes}"</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                m.status === 'Confirmed' ? 'bg-green-50 text-green-600' :
                m.status === 'Requested' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'
              }`}>
                {m.status}
              </span>
              
              {(role === 'teacher' || role === 'admin') && m.status === 'Requested' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(m.id, 'Confirmed')}
                    className="rounded-lg bg-green-500 text-white font-bold text-xs py-1 px-3"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(m.id, 'Cancelled')}
                    className="rounded-lg border border-slate-200 text-xs py-1 px-3"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: CHILD MILESTONE TRACKER
// ==========================================
function MilestonesModule({ role, milestones, students, onReload }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formStudent, setFormStudent] = useState('s1');
  const [formCat, setFormCat] = useState('Speech');
  const [formRating, setFormRating] = useState('Improving');
  const [formNotes, setFormNotes] = useState('');
  const [formRec, setFormRec] = useState('');

  // Parent restricts
  const parentStudentId = role === 'parent' ? students[0]?.id : null;
  const filtered = parentStudentId
    ? milestones.filter((m: any) => m.studentId === parentStudentId)
    : milestones;

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNotes || !formRec) return;

    try {
      await axios.post('/api/milestones', {
        studentId: formStudent,
        category: formCat,
        rating: formRating,
        observation: formNotes,
        recommendation: formRec,
        date: new Date().toISOString().split('T')[0]
      });

      setFormNotes('');
      setFormRec('');
      setShowAddForm(false);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Child Milestone evaluation</h1>
          <p className="text-slate-500 text-sm">Monitor speech, motor skills, social behavior and classroom attention indexes.</p>
        </div>

        {(role === 'teacher' || role === 'admin') && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Record Evaluation
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMilestone} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl animate-in duration-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Child Profile</label>
            <select value={formStudent} onChange={e => setFormStudent(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Evaluation Category</label>
            <select value={formCat} onChange={e => setFormCat(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              <option value="Speech">Speech Development</option>
              <option value="Motor Skills">Motor Skills</option>
              <option value="Social Behaviour">Social Behaviour</option>
              <option value="Creativity">Creativity</option>
              <option value="Attention">Classroom Attention</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Rating Index</label>
            <select value={formRating} onChange={e => setFormRating(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              <option value="Needs Support">Needs Support</option>
              <option value="Improving">Improving</option>
              <option value="Good">Good</option>
              <option value="Excellent">Excellent</option>
            </select>
          </div>
          <div className="space-y-1 md:col-span-3">
            <label className="text-xs font-bold text-slate-400 uppercase">Teacher Observation Notes</label>
            <input required type="text" placeholder="e.g. Leo is starting to string 4 words together..." value={formNotes} onChange={e => setFormNotes(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1 md:col-span-3">
            <label className="text-xs font-bold text-slate-400 uppercase">Development Recommendations</label>
            <input required type="text" placeholder="e.g. Encourage storytelling at bedtime..." value={formRec} onChange={e => setFormRec(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Save Milestone</button>
          </div>
        </form>
      )}

      {/* Milestones grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((m: any) => (
          <div key={m.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">{m.studentName}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.category}</span>
              </div>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                m.rating === 'Excellent' ? 'bg-green-50 text-green-600' :
                m.rating === 'Good' ? 'bg-blue-50 text-blue-600' :
                m.rating === 'Improving' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'
              }`}>
                {m.rating}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Observation log:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">"{m.observation}"</p>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Recommendation action:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed font-semibold">"{m.recommendation}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: EXPENSE TRACKER
// ==========================================
function ExpensesModule({ role, expenses, onReload }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formCat, setFormCat] = useState('Food');
  const [formAmount, setFormAmount] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formNotes) return;

    try {
      await axios.post('/api/expenses', {
        category: formCat,
        amount: Number(formAmount),
        date: new Date().toISOString().split('T')[0],
        description: formNotes,
        billUrl: ""
      });

      setFormAmount('');
      setFormNotes('');
      setShowAddForm(false);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Centre Expense ledger</h1>
          <p className="text-slate-500 text-sm">Record facilities maintenance rent, helper salaries, grocery costs, and event investments.</p>
        </div>

        {(role === 'accountant' || role === 'admin') && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Log Expense Invoice
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddExpense} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl animate-in duration-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Expense Category</label>
            <select value={formCat} onChange={e => setFormCat(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
              <option value="Rent">Rent</option>
              <option value="Staff Salary">Staff Salary</option>
              <option value="Food">Food / Groceries</option>
              <option value="Transport">Transport / Gas</option>
              <option value="Learning Material">Learning Material</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Bill Amount ($)</label>
            <input required type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Invoice Description</label>
            <input required type="text" value={formNotes} onChange={e => setFormNotes(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Log Expense</button>
          </div>
        </form>
      )}

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="p-4">Invoice details</th>
              <th className="p-4">Expense category</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Logged Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {expenses.map((e: any) => (
              <tr key={e.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">{e.description}</td>
                <td className="p-4">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{e.category}</span>
                </td>
                <td className="p-4 font-bold text-red-500">${e.amount}</td>
                <td className="p-4 text-slate-400">{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: ADMISSION VS OCCUPANCY
// ==========================================
function OccupancyModule({ classes }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Occupancy & Seat Capacity maps</h1>
        <p className="text-slate-500 text-sm">Check seat capacities, waitlists, and occupancy statistics by classroom.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Class matrix list */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm lg:col-span-2 space-y-6">
          <h3 className="font-extrabold text-slate-800 text-base">Classroom Occupancy Overview</h3>
          <div className="space-y-6">
            {classes.map((c: any) => (
              <div key={c.classId} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <div>
                    <span className="text-slate-800 font-bold">{c.className}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">Capacity limit: {c.capacity} kids</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-700 font-extrabold">{c.enrolled} Enrolled</span>
                    <span className="text-xs text-yellow-600 font-semibold block mt-0.5">Waitlist: {c.waitlist} queries</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-yellow-500" style={{ width: `${c.occupancyRate}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  <span>Occupancy: {c.occupancyRate}%</span>
                  <span>Available Seats: {c.available} left</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waitlist breakdown panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm">Admissions Action Card</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Preschool and daycare classes are evaluated against a target threshold of 85% occupancy. Classes nearing full capacity trigger waitlist notifications for counselors.
          </p>
          <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Total capacity seats:</span>
              <span className="font-bold text-slate-700">70 seats</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Active enrollments:</span>
              <span className="font-bold text-slate-700">3 students</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Active enquiries waitlist:</span>
              <span className="font-bold text-slate-700">1 lead</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: LIBRARY STORYBOOKS TRACKER
// ==========================================
function LibraryModule({ role, libraryBooks, students, onReload }: any) {
  const [showLoanForm, setShowLoanForm] = useState<string | null>(null);
  const [loanStudent, setLoanStudent] = useState('s1');
  const [loanDays, setLoanDays] = useState('7');

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLoanForm) return;

    try {
      const issueDate = new Date().toISOString().split('T')[0];
      const days = Number(loanDays);
      const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await axios.post('/api/library/issue', {
        bookId: showLoanForm,
        studentId: loanStudent,
        issueDate,
        dueDate
      });

      setShowLoanForm(null);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Library & Storybook Tracker</h1>
        <p className="text-slate-500 text-sm">Manage book loans catalogs, return logs, and resolve overdue books alerts.</p>
      </div>

      {showLoanForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleIssueBook} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="font-extrabold text-lg">Issue Storybook</h3>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Select Student</label>
              <select value={loanStudent} onChange={e => setLoanStudent(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Loan Period (Days)</label>
              <select value={loanDays} onChange={e => setLoanDays(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm">
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowLoanForm(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-yellow-500 text-black font-extrabold rounded-lg text-sm hover:bg-yellow-400">Issue Book</button>
            </div>
          </form>
        </div>
      )}

      {/* Book Catalog list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {libraryBooks.map((b: any) => (
          <div key={b.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-yellow-500/30 transition-colors">
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-base leading-tight">{b.title}</h3>
              <p className="text-xs text-slate-400">Author: {b.author}</p>
              <div className="flex justify-between text-xs pt-4 font-semibold">
                <span className="text-slate-500">In Stock: {b.quantity} books</span>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${b.available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {b.available > 0 ? `${b.available} Available` : 'All Loaned'}
                </span>
              </div>
            </div>

            {(role === 'teacher' || role === 'admin') && (
              <div className="mt-6 border-t border-slate-50 pt-4 flex justify-end">
                <button 
                  disabled={b.available <= 0}
                  onClick={() => setShowLoanForm(b.id)}
                  className="rounded-lg bg-black text-white hover:bg-slate-800 text-xs font-bold py-1.5 px-4 disabled:opacity-50"
                >
                  Issue Book
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: BIRTHDAYS PLANNER
// ==========================================
function BirthdaysModule({ role, birthdays, onReload }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Birthdays Celebration Planner</h1>
        <p className="text-slate-500 text-sm">Monitor upcoming child birthdays, food/snack allergies preferences, and photo updates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {birthdays.map((b: any) => (
          <div key={b.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex gap-4 hover:border-yellow-500/30 transition-colors">
            <img src={b.photo || 'https://images.unsplash.com/photo-1519457431-44ccd64a579b'} className="h-16 w-16 rounded-xl object-cover" />
            <div className="space-y-2.5 text-xs text-slate-600 flex-1">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base leading-tight">{b.studentName}</h3>
                <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider block mt-0.5">Birthday: {b.birthDate}</span>
              </div>
              <div className="border-t border-slate-50 pt-2 space-y-1">
                <p><span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Preferences:</span> {b.preferences}</p>
                <p><span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Cake/Snacks guidelines:</span> {b.cakeNotes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// SUBMODULE: LOST & FOUND TRACKER
// ==========================================
function LostFoundModule({ role, lostFound, onReload }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const handleAddLostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDesc) return;

    try {
      await axios.post('/api/lost-found', {
        name: formName,
        photoUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=200",
        description: formDesc,
        classId: "c2",
        status: "Found",
        reportedDate: new Date().toISOString().split('T')[0],
        receiverName: "",
        returnedDate: ""
      });

      setFormName('');
      setFormDesc('');
      setShowAddForm(false);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnItem = async (itemId: string) => {
    const parentName = prompt("Enter the name of the guardian receiving this item:");
    if (!parentName) return;

    try {
      await axios.put(`/api/lost-found/${itemId}/status`, {
        status: "Returned",
        receiverName: parentName,
        returnedDate: new Date().toISOString().split('T')[0]
      });
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Lost & Found Items Tracker</h1>
          <p className="text-slate-500 text-sm">Log misplaced lunchboxes, water bottles, and resolve items back to parents.</p>
        </div>

        {(role === 'daycare_staff' || role === 'admin') && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-yellow-500 text-black px-4 py-2 text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Report Lost Item
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddLostItem} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl animate-in duration-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Item Description Name</label>
            <input required type="text" placeholder="e.g. Red lunchbox" value={formName} onChange={e => setFormName(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Where/When found details</label>
            <input required type="text" placeholder="e.g. Nursery playground swings" value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Log Item</button>
          </div>
        </form>
      )}

      {/* Lost and found list grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {lostFound.map((item: any) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-5 flex items-start gap-4">
              <img src={item.photoUrl} className="h-16 w-16 rounded-xl object-cover border border-slate-100" />
              <div className="space-y-1 text-xs">
                <h3 className="font-extrabold text-slate-800 text-sm">{item.name}</h3>
                <p className="text-slate-500">Found: {item.description}</p>
                <span className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  item.status === 'Returned' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>

            {item.status === 'Returned' ? (
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold leading-normal">
                Returned to: {item.receiverName} on {item.returnedDate}
              </div>
            ) : (
              (role === 'daycare_staff' || role === 'admin') && (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button 
                    onClick={() => handleReturnItem(item.id)}
                    className="rounded-lg bg-black text-white font-bold text-xs py-1 px-3"
                  >
                    Mark Returned
                  </button>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
