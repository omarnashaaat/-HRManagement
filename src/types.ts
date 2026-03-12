import { useState, useEffect } from 'react';

export interface Employee {
  id: string;
  code: string;
  name: string;
  jobTitle: string;
  department: string;
  status: string;
  joinDate: string;
  nationalId: string;
  phone: string;
  address: string;
  baseSalary: number;
}

export interface AttendanceRecord {
  employeeId: string;
  date: string;
  arrivalTime: string;
  departureTime: string;
  deduction: number;
  notes: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: string;
  priority: 'urgent' | 'medium' | 'normal';
  score: number;
  createdAt: number;
  notes: string;
}

export const useApi = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    setEmployees(data);
  };

  const fetchCandidates = async () => {
    const res = await fetch('/api/candidates');
    const data = await res.json();
    setCandidates(data);
  };

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchCandidates()]).finally(() => setLoading(false));
  }, []);

  return {
    employees,
    candidates,
    loading,
    refreshEmployees: fetchEmployees,
    refreshCandidates: fetchCandidates
  };
};
