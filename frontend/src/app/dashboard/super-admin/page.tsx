'use client';

import React, { useEffect, useState } from 'react';
import { Student } from '@/data/mockStudents';
import FilterPanel from '@/components/FilterPanel';
import HealthDrilldownChart from '@/components/HealthDrilldownChart';
import HealthSummaryBarChart from '@/components/HealthSummaryChart';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import axios from 'axios';
import { 
  Menu, 
  X, 
  Settings, 
  BarChart3, 
  Users, 
  FileText, 
  Cog, 
  Home,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  UserPlus,
  School
} from 'lucide-react';

const defaultFilters = {
  school: 'All',
  grade: 'All',
  session: 'All',
  defect: 'All',
};

// User roles for the dropdown
const USER_ROLES = [
  { value: 'hod', label: 'HOD (Head of Department)', endpoint: 'signup/hod' },
  { value: 'super-admin', label: 'Super Admin', endpoint: 'signup/admin' },
  { value: 'student', label: 'Student', endpoint: 'signup/student' },
  { value: 'parent', label: 'Parent', endpoint: 'signup/parent' }
];

// Initial form state
const initialUserForm = {
  username: '',
  email: '',
  password: '',
  full_name: '',
  role: '',
  school_id: '',
  // Student specific fields
  adhar_number: '',
  session: '',
  grade: '',
  gender: '',
  admission_date: '',
  dob: '',
  // Parent specific fields
  contact_number: '',
  address: ''
};

function SuperAdminDashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredData, setFilteredData] = useState<Student[]>([]);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(false);
  const [rightSidebarExpanded, setRightSidebarExpanded] = useState(false);
  const [activeModule, setActiveModule] = useState('Dashboard');

  // User Management State
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [schools, setSchools] = useState<Array<{school_id: number, school_name: string}>>([]);

  // User Management Functions
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetUserForm = () => {
    setUserForm(initialUserForm);
    setError('');
    setSuccess('');
    setShowAddUserForm(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedRole = USER_ROLES.find(role => role.value === userForm.role);
      if (!selectedRole) {
        throw new Error('Please select a valid role');
      }

      // Prepare payload based on role
      let payload: any = {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        full_name: userForm.full_name,
      };

      // Add role-specific fields
      if (userForm.role === 'hod' || userForm.role === 'super-admin') {
        payload.school_id = parseInt(userForm.school_id);
      } else if (userForm.role === 'student') {
        payload = {
          ...payload,
          adhar_number: userForm.adhar_number,
          school_id: parseInt(userForm.school_id),
          session: userForm.session,
          grade: userForm.grade,
          gender: userForm.gender,
          admission_date: userForm.admission_date || undefined,
          dob: userForm.dob || undefined,
        };
      }

      const response = await axios.post(
        `http://localhost:5000/auth/${selectedRole.endpoint}`,
        payload
      );

      setSuccess(`${selectedRole.label} created successfully!`);
      resetUserForm();
      
      // Refresh students list if a student was added
      if (userForm.role === 'student') {
        const studentsResponse = await axios.get<Student[]>('http://localhost:5000/students/all');
        setAllStudents(studentsResponse.data);
        setFilteredData(studentsResponse.data);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      // This endpoint might need to be created in the backend
      // For now, we'll extract schools from existing students
      const uniqueSchools = [...new Set(allStudents.map(s => s.school))];
      const schoolsData = uniqueSchools.map((school, index) => ({
        school_id: index + 1,
        school_name: school
      }));
      setSchools(schoolsData);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get<Student[]>(
          'http://localhost:5000/students/all',
        );
        setAllStudents(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };

    fetchStudents();
  }, []);

  // Fetch schools when students data is available
  useEffect(() => {
    if (allStudents.length > 0) {
      fetchSchools();
    }
  }, [allStudents]);

  const applyFilters = () => {
    const result = allStudents.filter((student) => {
      const matchSchool =
        filters.school === 'All' || student.school === filters.school;
      const matchGrade =
        filters.grade === 'All' || student.grade === filters.grade;
      const matchSession =
        filters.session === 'All' || student.session === filters.session;
      const matchDefect =
        filters.defect === 'All' ||
        (student.defects &&
          student.defects[filters.defect as keyof typeof student.defects]);
      return matchSchool && matchGrade && matchSession && matchDefect;
    });

    setFilteredData(result);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setFilteredData(allStudents);
  };

  const uniqueValues = {
    schools: [...new Set(allStudents.map((s) => s.school))],
    grades: [...new Set(allStudents.map((s) => s.grade))],
    sessions: [...new Set(allStudents.map((s) => s.session))],
  };

  const handleBarClick = (selectedDefect: string) => {
    setFilters((prev) => ({ ...prev, defect: selectedDefect }));
    const updatedData = allStudents.filter((student) => {
      const matchSchool =
        filters.school === 'All' || student.school === filters.school;
      const matchGrade =
        filters.grade === 'All' || student.grade === filters.grade;
      const matchSession =
        filters.session === 'All' || student.session === filters.session;
      const matchDefect =
        student.defects &&
        student.defects[selectedDefect as keyof typeof student.defects];
      return matchSchool && matchGrade && matchSession && matchDefect;
    });
    setFilteredData(updatedData);
  };

  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard/super-admin' },
    { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { name: 'Students', icon: Users, href: '/dashboard/students' },
    { name: 'Reports', icon: FileText, href: '/dashboard/reports' },
    { name: 'Settings', icon: Cog, href: '/dashboard/settings' },
  ];

  const handleNavigation = (itemName: string) => {
    setActiveModule(itemName);
    setLeftSidebarOpen(false); // Close sidebar on mobile after selection
    // Auto-expand left sidebar on desktop when item is clicked
    if (window.innerWidth >= 1024) {
      setLeftSidebarExpanded(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 flex relative">
        {/* Left Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          leftSidebarExpanded ? 'w-64' : 'w-16'
        } lg:translate-x-0`}>
          {/* Mobile header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
            <button
              onClick={() => setLeftSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Desktop expand/collapse button */}
          <div className="hidden lg:flex items-center justify-end h-16 px-2 border-b border-gray-200">
            <button
              onClick={() => setLeftSidebarExpanded(!leftSidebarExpanded)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              {leftSidebarExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.name)}
                  className={`w-full flex items-center ${leftSidebarExpanded ? 'px-4 py-3' : 'px-2 py-3 justify-center'} text-left rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={!leftSidebarExpanded ? item.name : undefined}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'} ${leftSidebarExpanded ? 'mr-3' : ''}`} />
                  {leftSidebarExpanded && <span className="font-medium">{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Mobile Header with Toggle Buttons */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm border-b border-gray-200">
            <button
              onClick={() => setLeftSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Super Admin Dashboard</h1>
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            <section className="text-center py-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between px-6">
                <div className="text-center flex-1">
                  <h2 className="text-3xl font-bold text-red-900">Super Admin Dashboard</h2>
                  <p className="text-blue-700">Cumulative Dashboard for all schools</p>
                </div>
                <button
                  onClick={() => setRightSidebarExpanded(!rightSidebarExpanded)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Settings className="h-6 w-6" />
                </button>
              </div>
            </section>
          </div>

          {/* Dashboard Content */}
          <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-300">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                onApply={applyFilters}
                onReset={resetFilters}
                uniqueValues={uniqueValues}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HealthSummaryBarChart data={filteredData} onBarClick={handleBarClick} />
              <HealthDrilldownChart
                data={filteredData}
                defectType={filters.defect as keyof Student['defects']}
              />
            </div>
          </main>
        </div>

        {/* Right Sidebar */}
        <div className={`fixed inset-y-0 right-0 z-40 bg-gray-50 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          rightSidebarExpanded ? 'w-80' : 'w-16'
        } lg:translate-x-0`}>
          <div className={`flex items-center ${rightSidebarExpanded ? 'justify-between' : 'justify-center'} h-16 px-4 bg-white border-b border-gray-200`}>
            {rightSidebarExpanded && <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setRightSidebarOpen(false);
                } else {
                  setRightSidebarExpanded(!rightSidebarExpanded);
                }
              }}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title={!rightSidebarExpanded ? "Expand Quick Actions" : "Collapse Quick Actions"}
            >
              {rightSidebarExpanded ? <X className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
            </button>
          </div>
          
          {rightSidebarExpanded ? (
            <div className="p-4 space-y-4 overflow-y-auto h-full">
              {/* Add User Form */}
              {showAddUserForm ? (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-gray-800">Add New User</h3>
                    <button
                      onClick={resetUserForm}
                      className="p-1 rounded text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleAddUser} className="space-y-4">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={userForm.role}
                        onChange={handleUserFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Select Role</option>
                        {USER_ROLES.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Basic Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={userForm.username}
                        onChange={handleUserFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userForm.email}
                        onChange={handleUserFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={userForm.password}
                        onChange={handleUserFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={userForm.full_name}
                        onChange={handleUserFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* School Selection for HOD, Super Admin, and Student */}
                    {(userForm.role === 'hod' || userForm.role === 'super-admin' || userForm.role === 'student') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          School *
                        </label>
                        <select
                          name="school_id"
                          value={userForm.school_id}
                          onChange={handleUserFormChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Select School</option>
                          {schools.map(school => (
                            <option key={school.school_id} value={school.school_id}>
                              {school.school_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Student-specific fields */}
                    {userForm.role === 'student' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aadhar Number *
                          </label>
                          <input
                            type="text"
                            name="adhar_number"
                            value={userForm.adhar_number}
                            onChange={handleUserFormChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Session
                            </label>
                            <input
                              type="text"
                              name="session"
                              value={userForm.session}
                              onChange={handleUserFormChange}
                              placeholder="2023-24"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Grade
                            </label>
                            <input
                              type="text"
                              name="grade"
                              value={userForm.grade}
                              onChange={handleUserFormChange}
                              placeholder="10th"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                          </label>
                          <select
                            name="gender"
                            value={userForm.gender}
                            onChange={handleUserFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              name="dob"
                              value={userForm.dob}
                              onChange={handleUserFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Admission Date
                            </label>
                            <input
                              type="date"
                              name="admission_date"
                              value={userForm.admission_date}
                              onChange={handleUserFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Parent-specific fields */}
                    {userForm.role === 'parent' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number *
                          </label>
                          <input
                            type="tel"
                            name="contact_number"
                            value={userForm.contact_number}
                            onChange={handleUserFormChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={userForm.address}
                            onChange={handleUserFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Creating...' : 'Create User'}
                      </button>
                      <button
                        type="button"
                        onClick={resetUserForm}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* CRUD Operations Panel */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">User Management</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowAddUserForm(true)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </button>
                      <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Selected
                      </button>
                      <button className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Quick Stats */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Students:</span>
                    <span className="text-sm font-medium text-gray-900">{allStudents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Filtered Results:</span>
                    <span className="text-sm font-medium text-gray-900">{filteredData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Filters:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Object.values(filters).filter(f => f !== 'All').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Export Data</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200">
                    Export as CSV
                  </button>
                  <button className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200">
                    Export as PDF
                  </button>
                  <button className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed right sidebar with icon shortcuts */
            <div className="p-2 space-y-4 mt-6">
              <button
                onClick={() => setShowAddUserForm(true)}
                className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                title="Add User"
              >
                <UserPlus className="h-5 w-5" />
              </button>
              <button
                className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                title="Edit Selected"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                title="Delete Selected"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <div className="border-t border-gray-300 pt-4">
                <button
                  className="w-full p-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                  title="Export Data"
                >
                  <FileText className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Overlay for mobile sidebars */}
        {(leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function ProtectedSuperAdminDashboard() {
  return (
    //<ProtectedRoute allowedRoles={['admin', 'super-admin']}>
      <SuperAdminDashboard />
    //  </ProtectedRoute>
  );
}
