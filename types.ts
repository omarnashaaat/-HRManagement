
export interface Employee {
  id: string;
  code: string;
  name: string;
  dob?: string;
  gender?: 'ذكر' | 'أنثى';
  maritalStatus?: string;
  nationality?: string;
  nationalId?: string;
  idExpiry?: string;
  dependents?: number;
  militaryStatus?: string;
  phone?: string;
  email?: string;
  address?: string;
  jobTitle: string;
  officialJobTitle?: string;
  department: string;
  manager?: string;
  joinDate: string;
  confirmationDate?: string;
  employmentType?: string;
  status: string;
  location?: string;
  accruedBalance: number;
  additionalBalance: number;
  casualBalance: number;
  casualUsed: number;
  annualBalance: number;
  annualUsed: number;
  ordinaryBalance: number;
  ordinaryUsed: number;
  monthlyLeaves: number[];
  notes: string;
  baseSalary?: number;
  allowances?: number;
}

export interface AttendanceRecord {
  arrivalTime: string;
  departureTime: string;
  deduction: number;
  notes: string;
}

export type AttendanceLog = Record<string, Record<string, AttendanceRecord>>;

export interface InsuranceRecord {
  status: 'مؤمن عليه' | 'غير مؤمن عليه' | 'جاري التنفيذ';
  insuranceNumber: string;
  startDate: string;
  insuranceSalary: string;
  insuranceOffice: string;
  ratioCompany: string;
  ratioEmployee: string;
}

export interface ContractRecord {
  companyName: string;
  branch: string;
  hiringEntity: string;
  startDate: string;
  endDate: string;
  type: string;
}

export type TabId = 'dashboard' | 'employees' | 'attendance' | 'leaves' | 'payroll' | 'archive' | 'insurance' | 'contracts' | 'reports' | 'settings';
