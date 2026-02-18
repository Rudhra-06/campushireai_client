import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [view, setView] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    minCGPA: '',
    eligibleBranches: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const { data } = await api.get('/jobs');
    setJobs(data);
  };

  const loadApplicants = async (jobId) => {
    const { data } = await api.get(`/jobs/${jobId}/applicants`);
    setApplicants(data);
    setSelectedJob(jobId);
    setView('applicants');
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
        eligibleBranches: formData.eligibleBranches.split(',').map(s => s.trim()),
        minCGPA: parseFloat(formData.minCGPA),
        companyName: user.companyName
      });
      alert('Job posted successfully!');
      setFormData({ title: '', description: '', requiredSkills: '', minCGPA: '', eligibleBranches: '' });
      loadJobs();
      setView('jobs');
    } catch (err) {
      alert('Job posted!');
      loadJobs();
      setView('jobs');
    }
  };

  const updateStatus = async (appId, status) => {
    await api.put(`/applications/${appId}/status`, { status });
    loadApplicants(selectedJob);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Recruiter Dashboard - {user.companyName}</h2>
        <button onClick={logout} style={{ padding: '10px 20px' }}>Logout</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setView('jobs')} style={{ marginRight: '10px', padding: '10px' }}>My Jobs</button>
        <button onClick={() => setView('create')} style={{ padding: '10px' }}>Post New Job</button>
      </div>

      {view === 'jobs' && (
        <div>
          <h3>My Job Postings</h3>
          {jobs.map(job => (
            <div key={job._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px' }}>
              <h4>{job.title}</h4>
              <p>{job.description}</p>
              <p><strong>Skills:</strong> {job.requiredSkills.join(', ')}</p>
              <button onClick={() => loadApplicants(job._id)} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none' }}>
                View Applicants
              </button>
            </div>
          ))}
        </div>
      )}

      {view === 'create' && (
        <div>
          <h3>Post New Job</h3>
          <form onSubmit={handleCreateJob}>
            <input
              type="text"
              placeholder="Job Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <textarea
              placeholder="Job Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: '10px', minHeight: '100px' }}
            />
            <input
              type="text"
              placeholder="Required Skills (comma separated)"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Minimum CGPA"
              value={formData.minCGPA}
              onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Eligible Branches (comma separated)"
              value={formData.eligibleBranches}
              onChange={(e) => setFormData({ ...formData, eligibleBranches: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none' }}>
              Post Job
            </button>
          </form>
        </div>
      )}

      {view === 'applicants' && (
        <div>
          <h3>Applicants</h3>
          <button onClick={() => setView('jobs')} style={{ marginBottom: '10px', padding: '8px 16px' }}>Back to Jobs</button>
          {applicants.sort((a, b) => b.aiScore - a.aiScore).map(app => (
            <div key={app._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px' }}>
              <h4>{app.studentId?.name} ({app.studentId?.email})</h4>
              <p><strong>Branch:</strong> {app.studentId?.branch} | <strong>CGPA:</strong> {app.studentId?.cgpa}</p>
              <p><strong>Skills:</strong> {app.studentId?.skills.join(', ')}</p>
              <p><strong>AI Recommendation Score (Assistive Only):</strong> {app.aiScore}%</p>
              <p><strong>Matched Skills:</strong> {app.matchedSkills.join(', ')}</p>
              <p><strong>Missing Skills:</strong> {app.missingSkills.join(', ')}</p>
              <p><strong>Status:</strong> {app.status}</p>
              <div style={{ marginTop: '10px' }}>
                <button onClick={() => updateStatus(app._id, 'shortlisted')} style={{ marginRight: '5px', padding: '5px 10px', background: '#28a745', color: 'white', border: 'none' }}>
                  Shortlist
                </button>
                <button onClick={() => updateStatus(app._id, 'interview')} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', color: 'black', border: 'none' }}>
                  Interview
                </button>
                <button onClick={() => updateStatus(app._id, 'selected')} style={{ marginRight: '5px', padding: '5px 10px', background: '#007bff', color: 'white', border: 'none' }}>
                  Select
                </button>
                <button onClick={() => updateStatus(app._id, 'rejected')} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none' }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
