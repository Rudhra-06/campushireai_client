import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [view, setView] = useState('jobs');

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  const loadJobs = async () => {
    const { data } = await api.get('/jobs');
    setJobs(data);
  };

  const loadApplications = async () => {
    const { data } = await api.get('/applications/my');
    setApplications(data);
  };

  const handleApply = async (jobId) => {
    try {
      await api.post('/applications', { jobId });
      alert('Applied successfully!');
      loadApplications();
    } catch (err) {
      alert('Application submitted');
      loadApplications();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Student Dashboard - {user.name}</h2>
        <button onClick={logout} style={{ padding: '10px 20px' }}>Logout</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setView('jobs')} style={{ marginRight: '10px', padding: '10px' }}>Available Jobs</button>
        <button onClick={() => setView('applications')} style={{ padding: '10px' }}>My Applications</button>
      </div>

      {view === 'jobs' && (
        <div>
          <h3>Available Jobs</h3>
          {jobs.map(job => (
            <div key={job._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px' }}>
              <h4>{job.title} - {job.companyName}</h4>
              <p>{job.description}</p>
              <p><strong>Skills:</strong> {job.requiredSkills.join(', ')}</p>
              <p><strong>Min CGPA:</strong> {job.minCGPA}</p>
              <button onClick={() => handleApply(job._id)} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none' }}>
                Apply
              </button>
            </div>
          ))}
        </div>
      )}

      {view === 'applications' && (
        <div>
          <h3>My Applications</h3>
          {applications.map(app => (
            <div key={app._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px' }}>
              <h4>{app.jobId?.title} - {app.jobId?.companyName}</h4>
              <p><strong>AI Match Score (Assistive Only):</strong> {app.aiScore}%</p>
              <p><strong>Matched Skills:</strong> {app.matchedSkills.join(', ')}</p>
              <p><strong>Missing Skills:</strong> {app.missingSkills.join(', ')}</p>
              <p><strong>Status:</strong> <span style={{ 
                color: app.status === 'selected' ? 'green' : app.status === 'rejected' ? 'red' : 'orange' 
              }}>{app.status}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
