import fs from 'fs';
import path from 'path';

// Define the file path for the database inside src/lib
const DB_FILE_PATH = path.join(process.cwd(), 'src/lib/db.json');

// Interface defining the schema of our JSON database
export interface DatabaseSchema {
  users: any[];
  classes: any[];
  students: any[];
  fees: any[];
  payments: any[];
  pickup_qr: any[];
  pickup_logs: any[];
  activities: any[];
  activity_photos: any[];
  curriculum_plans: any[];
  inventory_items: any[];
  daycare_logs: any[];
  staff: any[];
  staff_attendance: any[];
  duty_rosters: any[];
  teacher_tasks: any[];
  admission_leads: any[];
  meetings: any[];
  milestones: any[];
  referrals: any[];
  expenses: any[];
  library_books: any[];
  book_issues: any[];
  birthdays: any[];
  lost_found_items: any[];
  notifications: any[];
}

// Read the database from the JSON file
export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      throw new Error(`Database file not found at ${DB_FILE_PATH}`);
    }
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading database file, using fallback empty structure', error);
    return {
      users: [], classes: [], students: [], fees: [], payments: [],
      pickup_qr: [], pickup_logs: [], activities: [], activity_photos: [],
      curriculum_plans: [], inventory_items: [], daycare_logs: [], staff: [],
      staff_attendance: [], duty_rosters: [], teacher_tasks: [], admission_leads: [],
      meetings: [], milestones: [], referrals: [], expenses: [],
      library_books: [], book_issues: [], birthdays: [], lost_found_items: [],
      notifications: []
    };
  }
}

// Write the database to the JSON file
export function writeDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database file', error);
  }
}

// Generic database helpers
export function getItems<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
  const db = readDb();
  return db[table] || [];
}

export function getItemById<K extends keyof DatabaseSchema>(table: K, id: string): any {
  const items = getItems(table);
  return items.find((item: any) => item.id === id);
}

export function insertItem<K extends keyof DatabaseSchema>(table: K, item: any): any {
  const db = readDb();
  if (!db[table]) {
    db[table] = [];
  }
  // Auto-generate ID if not present
  if (!item.id) {
    const prefix = table.substring(0, 3);
    const count = db[table].length + 1;
    item.id = `${prefix}_${Date.now()}_${count}`;
  }
  db[table].push(item);
  writeDb(db);
  return item;
}

export function updateItem<K extends keyof DatabaseSchema>(table: K, id: string, updates: any): any {
  const db = readDb();
  const items = db[table] || [];
  const index = items.findIndex((item: any) => item.id === id);
  if (index !== -1) {
    db[table][index] = { ...items[index], ...updates };
    writeDb(db);
    return db[table][index];
  }
  return null;
}

export function deleteItem<K extends keyof DatabaseSchema>(table: K, id: string): boolean {
  const db = readDb();
  const items = db[table] || [];
  const initialLength = items.length;
  db[table] = items.filter((item: any) => item.id !== id);
  if (db[table].length !== initialLength) {
    writeDb(db);
    return true;
  }
  return false;
}
