'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Mail, Phone, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmployeeExtended, EmployeePerformance } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeExtended[]>([]);
  const [performanceList, setPerformanceList] = useState<EmployeePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Employee Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [hourlyRate, setHourlyRate] = useState(650);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, perfRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/analytics/performance'),
      ]);
      const empData = await empRes.json();
      const perfData = await perfRes.json();
      if (empData.success) setEmployees(empData.employees);
      if (perfData.success) setPerformanceList(perfData.performance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      const code = employeeCode.trim() || `BLT-EMP-${String(employees.length + 1).padStart(3, '0')}`;
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || '+91 98000 00000',
          department,
          designation: designation.trim() || 'Software Engineer',
          employee_code: code,
          hourly_rate: Number(hourlyRate),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFullName('');
        setEmail('');
        setPhone('');
        setDesignation('');
        setCreateModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Employee Directory & Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bharat Loomtex personnel directory and organizational structure.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm">
          <Plus className="w-4 h-4" /> Add New Employee
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employees.map((emp) => {
            const perf = performanceList.find((p) => p.employee_id === emp.profile_id);

            return (
              <Card key={emp.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-slate-200">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                        {emp.employee_code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">
                        {emp.profile?.full_name}
                      </h3>
                      <p className="text-xs text-blue-700 font-semibold">
                        {emp.profile?.designation}
                      </p>
                    </div>
                    <Badge variant={emp.profile?.status === 'active' ? 'success' : 'default'}>
                      {emp.profile?.status?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{emp.profile?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.profile?.phone || '–'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Joined: {formatDate(emp.joining_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Assigned</div>
                    <div className="font-mono font-bold text-slate-900">
                      {perf?.assigned_count || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Completed</div>
                    <div className="font-mono font-bold text-emerald-700">
                      {perf?.completed_count || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Score</div>
                    <div className="font-mono font-bold text-blue-700">
                      {perf?.performance_score || 0}%
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Employee Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Employee Record"
        description="Provision credentials, department, and role for employee login."
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Meera Nair"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="head@bharatloomtex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98123 45678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="AI Solutions">AI Solutions</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Client Success">Client Success</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Designation
              </label>
              <input
                type="text"
                placeholder="e.g. AI Prompt Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Employee Code
              </label>
              <input
                type="text"
                placeholder="e.g. RAT-EMP-008"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Hourly Rate (₹)
              </label>
              <input
                type="number"
                min={0}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting} className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm">
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
