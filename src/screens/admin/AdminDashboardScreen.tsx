import React, { useState, useEffect } from 'react';
import { User, Briefcase } from 'lucide-react';
import { userService } from '@/services/userService';
import { jobService } from '@/services/jobService';
import type { UserForAdmin } from '@/types';
import type { JobListing } from '@/firebase/firebase';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UserListItem from '@/screens/admin/UserListItem';
import JobListItem from '@/screens/admin/JobListItem';

type AdminView = 'users' | 'jobs';

const AdminDashboardScreen: React.FC = () => {
  const [view, setView] = useState<AdminView>('users');
  const [users, setUsers] = useState<UserForAdmin[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (view === 'users') {
          const userResults = await userService.getAllUsers();
          setUsers(userResults);
        } else {
          const jobResults = await jobService.getAllJobsAdmin();
          setJobs(jobResults);
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [view]);

  const handleUserDeleted = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };

  const handleJobUpdate = (updatedJob: JobListing) => {
    setJobs(prevJobs => prevJobs.map(j => j.id === updatedJob.id ? updatedJob : j));
  };
  
  const handleJobDeleted = (jobId: string) => {
    setJobs(prevJobs => prevJobs.filter(j => j.id !== jobId));
  };

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    if (view === 'users') {
      return (
        <div className="space-y-4">
          {users.length > 0 ? (
            users.map(user => <UserListItem key={user.id} user={user} onUserDeleted={handleUserDeleted} />)
          ) : (
            <p className="text-gray-500">No users found.</p>
          )}
        </div>
      );
    }

    if (view === 'jobs') {
      return (
        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map(job => <JobListItem key={job.id} job={job} onJobUpdate={handleJobUpdate} onJobDeleted={handleJobDeleted} />)
          ) : (
            <p className="text-gray-500">No jobs found.</p>
          )}
        </div>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-1">Gestiona usuarios, ofertas de trabajo y fuentes.</p>
      </header>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setView('users')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              view === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="mr-2 h-5 w-5" />
            Gestionar Usuarios ({users.length})
          </button>
          <button
            onClick={() => setView('jobs')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              view === 'jobs'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Briefcase className="mr-2 h-5 w-5" />
            Gestionar Trabajos ({jobs.length})
          </button>
        </nav>
      </div>

      <main>{renderContent()}</main>
    </div>
  );
};

export default AdminDashboardScreen;