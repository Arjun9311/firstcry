import { NextResponse } from 'next/server';
import { 
  readDb, 
  writeDb, 
  getItems, 
  getItemById, 
  insertItem, 
  updateItem, 
  deleteItem 
} from '@/lib/db';
import QRCode from 'qrcode';

// Dynamic API handler matching [[...slug]]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || [];

    if (slug.length === 0) {
      return NextResponse.json({ message: "Welcome to LittleCare Pro API" });
    }

    const first = slug[0];
    const second = slug[1];
    const third = slug[2];

    // Auth Current User Info
    if (first === 'auth' && second === 'me') {
      const email = searchParams.get('email');
      if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const users = getItems('users');
      const user = users.find(u => u.email === email);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    // Students API
    if (first === 'students') {
      if (second) {
        // GET /api/students/:id
        const student = getItemById('students', second);
        if (!student) {
          return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }
        return NextResponse.json(student);
      }
      // GET /api/students
      const classId = searchParams.get('classId');
      let students = getItems('students');
      if (classId) {
        students = students.filter(s => s.classId === classId);
      }
      return NextResponse.json(students);
    }

    // Fees API
    if (first === 'fees') {
      if (second === 'pending') {
        // GET /api/fees/pending
        const fees = getItems('fees');
        const pending = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue' || f.status === 'Partially Paid');
        const students = getItems('students');
        const result = pending.map(f => ({
          ...f,
          student: students.find(s => s.id === f.studentId)
        }));
        return NextResponse.json(result);
      }
      if (second) {
        // GET /api/fees/:studentId
        const fees = getItems('fees');
        const studentFees = fees.filter(f => f.studentId === second);
        return NextResponse.json(studentFees);
      }
      // GET /api/fees
      const fees = getItems('fees');
      const students = getItems('students');
      const result = fees.map(f => ({
        ...f,
        student: students.find(s => s.id === f.studentId)
      }));
      return NextResponse.json(result);
    }

    // Receipts API
    if (first === 'receipts' && second) {
      // GET /api/receipts/:id
      const payment = getItemById('payments', second);
      if (!payment) {
        return NextResponse.json({ error: "Receipt payment not found" }, { status: 404 });
      }
      const fees = getItems('fees');
      const fee = fees.find(f => f.id === payment.feeId);
      const student = fee ? getItemById('students', fee.studentId) : null;
      return NextResponse.json({ payment, fee, student });
    }

    // QR Pickup APIs
    if (first === 'pickup') {
      if (second === 'verify' && third) {
        // GET /api/pickup/verify/:qrId
        // Find matching pickup QR
        const qrs = getItems('pickup_qr');
        const qr = qrs.find(q => q.id === third || q.qrCodeText === third);
        if (!qr || qr.status !== 'Active') {
          return NextResponse.json({ valid: false, error: "QR code is invalid or expired" });
        }
        const student = getItemById('students', qr.studentId);
        return NextResponse.json({ valid: true, student, qr });
      }
      if (second === 'history' && third) {
        // GET /api/pickup/history/:studentId
        const logs = getItems('pickup_logs');
        const history = logs.filter(l => l.studentId === third);
        return NextResponse.json(history);
      }
      if (second === 'log') {
        const logs = getItems('pickup_logs');
        const students = getItems('students');
        const fullLogs = logs.map(l => ({
          ...l,
          student: students.find(s => s.id === l.studentId)
        }));
        return NextResponse.json(fullLogs);
      }
    }

    // Activities API
    if (first === 'activities') {
      if (second === 'student' && third) {
        // GET /api/activities/student/:studentId
        const activities = getItems('activities');
        const photos = getItems('activity_photos');
        const filtered = activities.filter(a => a.tags && a.tags.includes(third));
        const result = filtered.map(a => ({
          ...a,
          photos: photos.filter(p => p.activityId === a.id)
        }));
        return NextResponse.json(result);
      }
      // GET /api/activities
      const activities = getItems('activities');
      const photos = getItems('activity_photos');
      const result = activities.map(a => ({
        ...a,
        photos: photos.filter(p => p.activityId === a.id)
      }));
      return NextResponse.json(result);
    }

    // Curriculum API
    if (first === 'curriculum') {
      const curriculum = getItems('curriculum_plans');
      const classes = getItems('classes');
      const result = curriculum.map(c => ({
        ...c,
        className: classes.find(cl => cl.id === c.classId)?.name || "Unknown Class"
      }));
      return NextResponse.json(result);
    }

    // Inventory API
    if (first === 'inventory') {
      const items = getItems('inventory_items');
      const classes = getItems('classes');
      const result = items.map(i => ({
        ...i,
        className: classes.find(cl => cl.id === i.assignedClassId)?.name || "All Classes"
      }));
      return NextResponse.json(result);
    }

    // Daycare Routine API
    if (first === 'daycare' && second === 'logs') {
      if (third) {
        // GET /api/daycare/logs/:studentId
        const logs = getItems('daycare_logs');
        const studentLogs = logs.filter(l => l.studentId === third);
        return NextResponse.json(studentLogs);
      }
      const logs = getItems('daycare_logs');
      const students = getItems('students');
      const result = logs.map(l => ({
        ...l,
        studentName: students.find(s => s.id === l.studentId)?.name || "Unknown Student"
      }));
      return NextResponse.json(result);
    }

    // Staff APIs
    if (first === 'staff') {
      if (second === 'attendance') {
        const attendance = getItems('staff_attendance');
        const staff = getItems('staff');
        const result = attendance.map(a => ({
          ...a,
          staffName: staff.find(s => s.id === a.staffId)?.name || "Unknown Staff",
          role: staff.find(s => s.id === a.staffId)?.role || "Staff"
        }));
        return NextResponse.json(result);
      }
      const staffList = getItems('staff');
      const classes = getItems('classes');
      const result = staffList.map(s => ({
        ...s,
        className: classes.find(cl => cl.id === s.assignedClassId)?.name || "Floating Duty"
      }));
      return NextResponse.json(result);
    }

    // Admission Leads API
    if (first === 'leads') {
      const leads = getItems('admission_leads');
      return NextResponse.json(leads);
    }

    // Meeting Scheduler API
    if (first === 'meetings') {
      const meetings = getItems('meetings');
      const teachers = getItems('users').filter(u => u.role === 'teacher');
      const parents = getItems('users').filter(u => u.role === 'parent');
      const result = meetings.map(m => ({
        ...m,
        teacherName: teachers.find(t => t.id === m.teacherId)?.name || "Emily Watson",
        parentName: parents.find(p => p.id === m.parentId)?.name || "David Miller"
      }));
      return NextResponse.json(result);
    }

    // Milestones Tracker API
    if (first === 'milestones') {
      if (second) {
        // GET /api/milestones/:studentId
        const milestones = getItems('milestones');
        const studentMilestones = milestones.filter(m => m.studentId === second);
        return NextResponse.json(studentMilestones);
      }
      const milestones = getItems('milestones');
      const students = getItems('students');
      const result = milestones.map(m => ({
        ...m,
        studentName: students.find(s => s.id === m.studentId)?.name || "Unknown Student"
      }));
      return NextResponse.json(result);
    }

    // Expense Tracker API
    if (first === 'expenses') {
      if (second === 'monthly-summary') {
        const expenses = getItems('expenses');
        // Group by category for charts
        const categories = [...new Set(expenses.map(e => e.category))];
        const chartData = categories.map(cat => ({
          name: cat,
          value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
        }));
        return NextResponse.json(chartData);
      }
      const expenses = getItems('expenses');
      return NextResponse.json(expenses);
    }

    // Occupancy API
    if (first === 'occupancy') {
      const classes = getItems('classes');
      const students = getItems('students');
      const leads = getItems('admission_leads');

      const data = classes.map(c => {
        const enrolled = students.filter(s => s.classId === c.id).length;
        const waitlist = leads.filter(l => l.status === 'Demo Scheduled' && l.notes?.includes(c.name)).length;
        return {
          classId: c.id,
          className: c.name,
          capacity: c.capacity,
          enrolled,
          available: Math.max(0, c.capacity - enrolled),
          waitlist,
          occupancyRate: Math.round((enrolled / c.capacity) * 100)
        };
      });
      return NextResponse.json(data);
    }

    // Library API
    if (first === 'library') {
      if (second === 'books') {
        const books = getItems('library_books');
        return NextResponse.json(books);
      }
      const issues = getItems('book_issues');
      const books = getItems('library_books');
      const students = getItems('students');
      const result = issues.map(i => ({
        ...i,
        bookTitle: books.find(b => b.id === i.bookId)?.title || "Unknown Book",
        studentName: students.find(s => s.id === i.studentId)?.name || "Unknown Student"
      }));
      return NextResponse.json(result);
    }

    // Birthday Planner API
    if (first === 'birthdays') {
      if (second === 'upcoming') {
        const birthdays = getItems('birthdays');
        const students = getItems('students');
        const result = birthdays.map(b => ({
          ...b,
          studentName: students.find(s => s.id === b.studentId)?.name || "Unknown Student",
          photo: students.find(s => s.id === b.studentId)?.photo || ""
        }));
        return NextResponse.json(result);
      }
    }

    // Lost & Found API
    if (first === 'lost-found') {
      const items = getItems('lost_found_items');
      const classes = getItems('classes');
      const result = items.map(i => ({
        ...i,
        className: classes.find(c => c.id === i.classId)?.name || "Playground"
      }));
      return NextResponse.json(result);
    }

    // Notifications API
    if (first === 'notifications') {
      const userId = searchParams.get('userId') || 'u1';
      const notifications = getItems('notifications');
      const userNotifications = notifications.filter(n => n.userId === userId);
      return NextResponse.json(userNotifications);
    }

    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  } catch (error: any) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || [];

    if (slug.length === 0) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const first = slug[0];
    const second = slug[1];
    const third = slug[2];

    // Auth Login
    if (first === 'auth' && second === 'login') {
      const { email, password } = body;
      const users = getItems('users');
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      return NextResponse.json({
        token: `mock-jwt-token-for-${user.id}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId
        }
      });
    }

    // Auth Forgot Password
    if (first === 'auth' && second === 'forgot-password') {
      const { email } = body;
      const users = getItems('users');
      const user = users.find(u => u.email === email);
      if (!user) {
        return NextResponse.json({ error: "Email not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Password reset instructions sent to " + email });
    }

    // Students Create
    if (first === 'students') {
      const newStudent = insertItem('students', body);
      // Automatically create a corresponding pickup QR
      const qrData = `PICKUP-${newStudent.name.replace(/\s+/g, '')}-${newStudent.id}-${newStudent.parentName.split(' ')[0]}`;
      // Generate unique QR record
      insertItem('pickup_qr', {
        studentId: newStudent.id,
        qrCodeText: qrData,
        status: "Active"
      });
      return NextResponse.json(newStudent, { status: 201 });
    }

    // Fees structure create
    if (first === 'fees') {
      const newFee = insertItem('fees', body);
      return NextResponse.json(newFee, { status: 201 });
    }

    // Payments create (Record a payment, generates receipt, reduces pending amount)
    if (first === 'payments') {
      const { feeId, amount, paymentMethod } = body;
      const fee = getItemById('fees', feeId);
      if (!fee) {
        return NextResponse.json({ error: "Fee structure not found" }, { status: 404 });
      }

      // Record transaction
      const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPayment = insertItem('payments', {
        feeId,
        amount,
        paymentMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        receiptNumber
      });

      // Update parent fee status
      const paidAmount = Number(fee.paidAmount) + Number(amount);
      const pendingAmount = Math.max(0, Number(fee.totalAmount) - paidAmount);
      let status = "Paid";
      if (pendingAmount > 0) {
        status = "Partially Paid";
      }
      updateItem('fees', feeId, { paidAmount, pendingAmount, status });

      return NextResponse.json({ payment: newPayment, receiptNumber }, { status: 201 });
    }

    // QR Generate / Create
    if (first === 'pickup' && second === 'qr') {
      const { studentId } = body;
      const student = getItemById('students', studentId);
      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      // Deactivate old QRs
      const qrs = getItems('pickup_qr');
      qrs.forEach((q: any) => {
        if (q.studentId === studentId) {
          updateItem('pickup_qr', q.id, { status: "Inactive" });
        }
      });

      const qrText = `PICKUP-${student.name.replace(/\s+/g, '')}-${student.id}-${Date.now()}`;
      const newQr = insertItem('pickup_qr', {
        studentId,
        qrCodeText: qrText,
        status: "Active"
      });
      
      // Generate actual base64 image URL to display
      const dataUrl = await QRCode.toDataURL(qrText);
      return NextResponse.json({ qr: newQr, dataUrl });
    }

    // Pickup Log (Mark child as picked up)
    if (first === 'pickup' && second === 'log') {
      const { studentId, guardianName, relation } = body;
      const newLog = insertItem('pickup_logs', {
        studentId,
        guardianName,
        relation,
        timestamp: new Date().toISOString(),
        status: "Success"
      });
      return NextResponse.json(newLog, { status: 201 });
    }

    // Activities Create
    if (first === 'activities') {
      const { title, description, date, tags, photos } = body; // photos is array of base64/links
      const newActivity = insertItem('activities', { title, description, date, tags });
      
      if (photos && photos.length > 0) {
        photos.forEach((photoUrl: string, idx: number) => {
          insertItem('activity_photos', {
            activityId: newActivity.id,
            url: photoUrl,
            caption: `Photo ${idx + 1} for ${title}`
          });
        });
      }
      return NextResponse.json(newActivity, { status: 201 });
    }

    // Curriculum Create
    if (first === 'curriculum') {
      const newPlan = insertItem('curriculum_plans', body);
      return NextResponse.json(newPlan, { status: 201 });
    }

    // Inventory Create
    if (first === 'inventory') {
      const newItem = insertItem('inventory_items', body);
      return NextResponse.json(newItem, { status: 201 });
    }

    // Daycare Log Create
    if (first === 'daycare' && second === 'logs') {
      const newLog = insertItem('daycare_logs', body);
      return NextResponse.json(newLog, { status: 201 });
    }

    // Staff Create
    if (first === 'staff') {
      if (second === 'attendance') {
        // Mark attendance
        const newAttendance = insertItem('staff_attendance', body);
        return NextResponse.json(newAttendance, { status: 201 });
      }
      if (second === 'roster') {
        const newRoster = insertItem('duty_rosters', body);
        return NextResponse.json(newRoster, { status: 201 });
      }
      const newStaff = insertItem('staff', body);
      return NextResponse.json(newStaff, { status: 201 });
    }

    // Admission Lead Create
    if (first === 'leads') {
      const newLead = insertItem('admission_leads', body);
      return NextResponse.json(newLead, { status: 201 });
    }

    // Lead followup create
    if (first === 'leads' && third === 'followup') {
      // POST /api/leads/:id/followup
      const leadId = second;
      const lead = getItemById('admission_leads', leadId);
      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      const { notes, nextFollowupDate } = body;
      const updated = updateItem('admission_leads', leadId, {
        notes: lead.notes + " | " + notes,
        nextFollowupDate
      });
      return NextResponse.json(updated);
    }

    // Meetings Create
    if (first === 'meetings') {
      const newMeeting = insertItem('meetings', body);
      return NextResponse.json(newMeeting, { status: 201 });
    }

    // Milestone Create
    if (first === 'milestones') {
      const newMilestone = insertItem('milestones', body);
      return NextResponse.json(newMilestone, { status: 201 });
    }

    // Referrals Create
    if (first === 'referrals') {
      const newReferral = insertItem('referrals', body);
      return NextResponse.json(newReferral, { status: 201 });
    }

    // Expense Create
    if (first === 'expenses') {
      const newExpense = insertItem('expenses', body);
      return NextResponse.json(newExpense, { status: 201 });
    }

    // Library Create
    if (first === 'library') {
      if (second === 'books') {
        const newBook = insertItem('library_books', body);
        return NextResponse.json(newBook, { status: 201 });
      }
      if (second === 'issue') {
        const { bookId, studentId, issueDate, dueDate } = body;
        const book = getItemById('library_books', bookId);
        if (!book || book.available <= 0) {
          return NextResponse.json({ error: "Book is not available" }, { status: 400 });
        }
        // Issue book
        const newIssue = insertItem('book_issues', {
          bookId,
          studentId,
          issueDate,
          dueDate,
          returnDate: "",
          status: "Issued"
        });
        updateItem('library_books', bookId, { available: book.available - 1 });
        return NextResponse.json(newIssue, { status: 201 });
      }
    }

    // Birthday celebration preference add
    if (first === 'birthdays' && second === 'celebration') {
      const newCel = insertItem('birthdays', body);
      return NextResponse.json(newCel, { status: 201 });
    }

    // Lost & Found Create
    if (first === 'lost-found') {
      const newItem = insertItem('lost_found_items', body);
      return NextResponse.json(newItem, { status: 201 });
    }

    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || [];

    if (slug.length < 2) {
      return NextResponse.json({ error: "Invalid ID path" }, { status: 400 });
    }

    const first = slug[0];
    const second = slug[1];

    if (first === 'students') {
      const updated = updateItem('students', second, body);
      return NextResponse.json(updated);
    }

    if (first === 'curriculum') {
      const updated = updateItem('curriculum_plans', second, body);
      return NextResponse.json(updated);
    }

    if (first === 'inventory') {
      const updated = updateItem('inventory_items', second, body);
      return NextResponse.json(updated);
    }

    if (first === 'daycare' && second === 'logs' && slug[2]) {
      const updated = updateItem('daycare_logs', slug[2], body);
      return NextResponse.json(updated);
    }

    if (first === 'leads') {
      const updated = updateItem('admission_leads', second, body);
      return NextResponse.json(updated);
    }

    if (first === 'meetings' && slug[2] === 'status') {
      const updated = updateItem('meetings', second, { status: body.status });
      return NextResponse.json(updated);
    }

    if (first === 'milestones') {
      const updated = updateItem('milestones', second, body);
      return NextResponse.json(updated);
    }

    if (first === 'library' && second === 'return') {
      const issueId = slug[2]; // /api/library/return/:issueId
      const issue = getItemById('book_issues', issueId);
      if (!issue) {
        return NextResponse.json({ error: "Issue transaction not found" }, { status: 404 });
      }
      const updatedIssue = updateItem('book_issues', issueId, {
        returnDate: new Date().toISOString().split('T')[0],
        status: "Returned"
      });
      const book = getItemById('library_books', issue.bookId);
      if (book) {
        updateItem('library_books', book.id, { available: Math.min(book.quantity, book.available + 1) });
      }
      return NextResponse.json(updatedIssue);
    }

    if (first === 'lost-found' && slug[2] === 'status') {
      const updated = updateItem('lost_found_items', second, body);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  } catch (error: any) {
    console.error("API PUT Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || [];

    if (slug.length < 2) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const first = slug[0];
    const second = slug[1];
    const third = slug[2];

    // Patch curriculum status
    if (first === 'curriculum' && third === 'status') {
      const updated = updateItem('curriculum_plans', second, { status: body.status });
      return NextResponse.json(updated);
    }

    // Lead convert to student
    if (first === 'leads' && third === 'convert') {
      const lead = getItemById('admission_leads', second);
      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }

      // Convert lead to active student
      const studentName = lead.childName;
      const parentName = lead.parentName;
      const parentPhone = lead.parentPhone;
      const parentEmail = lead.email;

      // 1. Create student
      const student = insertItem('students', {
        name: studentName,
        photo: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=200",
        classId: "c2", // default Nursery
        ageGroup: lead.childAge,
        allergies: "None",
        medicalNotes: "Converted from lead",
        parentName,
        parentPhone,
        emergencyContact: `${parentName} (${parentPhone})`,
        pickupPersons: [
          { name: parentName, relation: "Parent", phone: parentPhone, photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" }
        ]
      });

      // 2. Create parent user account for authentication
      const user = insertItem('users', {
        name: parentName,
        email: parentEmail,
        role: "parent",
        password: "password123",
        studentId: student.id
      });

      // 3. Create fee installment structure
      insertItem('fees', {
        studentId: student.id,
        feeType: "Admission Fees",
        totalAmount: 1500,
        paidAmount: 0,
        pendingAmount: 1500,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks out
        status: "Pending"
      });

      // 4. Generate pickup QR
      const qrText = `PICKUP-${studentName.replace(/\s+/g, '')}-${student.id}-${parentName.split(' ')[0]}`;
      insertItem('pickup_qr', {
        studentId: student.id,
        qrCodeText: qrText,
        status: "Active"
      });

      // 5. Update lead status
      updateItem('admission_leads', second, { status: "Converted" });

      return NextResponse.json({ student, user });
    }

    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  } catch (error: any) {
    console.error("API PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || [];

    if (slug.length < 2) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const first = slug[0];
    const second = slug[1];

    if (first === 'students') {
      const deleted = deleteItem('students', second);
      return NextResponse.json({ success: deleted });
    }

    if (first === 'activities') {
      const deleted = deleteItem('activities', second);
      return NextResponse.json({ success: deleted });
    }

    if (first === 'inventory') {
      const deleted = deleteItem('inventory_items', second);
      return NextResponse.json({ success: deleted });
    }

    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  } catch (error: any) {
    console.error("API DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
