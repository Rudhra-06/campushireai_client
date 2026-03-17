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

  const statusColor = (status) => {
    if (status === 'selected') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    if (status === 'interview') return 'badge-primary';
    if (status === 'shortlisted') return 'badge-warning';
    return 'badge-info';
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">🎓</div>
            <div>
              <h3>CampusHire AI</h3>
            </div>
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>{user.name}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user.branch} &nbsp;·&nbsp; CGPA {user.cgpa}</p>
          <span className="sidebar-role-badge">Student</span>
        </div>

        <ul className="sidebar-menu">
          <li>
            <button onClick={() => setView('jobs')} className={view === 'jobs' ? 'active' : ''}>
              📋 Available Jobs
            </button>
          </li>
          <li>
            <button onClick={() => setView('applications')} className={view === 'applications' ? 'active' : ''}>
              📄 My Applications
              {applications.length > 0 && (
                <span className="badge badge-primary" style={{ marginLeft: 'auto', fontSize: '11px' }}>{applications.length}</span>
              )}
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={logout} className="btn btn-ghost" style={{ width: '100%' }}>
            ← Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="content-container">

        {view === 'jobs' && (
          <>
            <div className="page-header">
              <h2>Available Jobs</h2>
              <p>Positions matching your profile and eligibility</p>
            </div>

            {jobs.length === 0 && (
              <div className="card empty-state">
                <p>No jobs available for your profile right now.</p>
              </div>
            )}

            <div className="cards-grid">
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h4>{job.title}</h4>
                    <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '15px' }}>{job.companyName}</p>
                  </div>
                  <span className="badge badge-info">Min CGPA: {job.minCGPA}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '14px', lineHeight: '1.6' }}>{job.description}</p>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '8px' }}>Required Skills:</span>
                  {job.requiredSkills.map(skill => (
                    <span key={skill} className="badge badge-info">{skill}</span>
                  ))}
                </div>
                <button onClick={() => handleApply(job.id)} className="btn btn-primary">
                  Apply Now →
                </button>
              </div>
            ))}
            </div>
          </>
        )}

        {view === 'applications' && (
          <>
            <div className="page-header">
              <h2>My Applications</h2>
              <p>Track the status of your job applications</p>
            </div>

            {applications.length === 0 && (
              <div className="card empty-state">
                <p>You haven't applied to any jobs yet.</p>
              </div>
            )}

            <div className="cards-grid">
            {applications.map(app => (
              <div key={app.id} className="job-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h4>{app.job?.title}</h4>
                    <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '15px' }}>{app.job?.companyName}</p>
                  </div>
                  <span className={`badge ${statusColor(app.status)}`}>
                    {app.status.toUpperCase()}
                  </span>
                </div>

                <div className="ai-panel">
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                    <span className="ai-score-value">{app.aiScore}%</span>
                    <span className="ai-score-label">AI Match Score · Advisory only</span>
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '6px' }}>Matched:</span>
                    {app.matchedSkills.map(s => <span key={s} className="badge badge-success">{s}</span>)}
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '6px' }}>Missing:</span>
                    {app.missingSkills.map(s => <span key={s} className="badge badge-danger">{s}</span>)}
                  </div>
                </div>
              </div>
            ))}
            </div>
          </>
        )}

        </div>
      </div>
    </div>
  );
}
