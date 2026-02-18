import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [view, setView] = useState('analytics');

  useEffect(() => {
    loadAnalytics();
    loadPendingRecruiters();
  }, []);

  const loadAnalytics = async () => {
    const { data } = await api.get('/admin/analytics');
    setAnalytics(data);
  };

  const loadPendingRecruiters = async () => {
    const { data } = await api.get('/admin/recruiters/pending');
    setPendingRecruiters(data);
  };

  const approveRecruiter = async (id) => {
    try {
      await api.put(`/admin/recruiters/${id}/approve`);
      loadPendingRecruiters();
      alert('Recruiter approved');
    } catch (err) {
      alert('Failed to approve');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={logout} style={{ padding: '10px 20px' }}>Logout</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setView('analytics')} style={{ marginRight: '10px', padding: '10px' }}>Analytics</button>
        <button onClick={() => setView('recruiters')} style={{ padding: '10px' }}>Pending Recruiters</button>
      </div>

      {view === 'analytics' && analytics && (
        <div>
          <h3>Placement Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center' }}>
              <h4>{analytics.totalStudents}</h4>
              <p>Total Students</p>
            </div>
            <div style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center' }}>
              <h4>{analytics.totalRecruiters}</h4>
              <p>Active Recruiters</p>
            </div>
            <div style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center' }}>
              <h4>{analytics.totalJobs}</h4>
              <p>Total Jobs</p>
            </div>
            <div style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center' }}>
              <h4>{analytics.placedStudents}</h4>
              <p>Students Placed</p>
            </div>
          </div>

          <h4>Branch-wise Distribution</h4>
          {analytics.branchWise.map(b => (
            <div key={b._id} style={{ marginBottom: '10px' }}>
              <strong>{b._id}:</strong> {b.count} students
            </div>
          ))}
        </div>
      )}

      {view === 'recruiters' && (
        <div>
          <h3>Pending Recruiter Approvals</h3>
          {pendingRecruiters.map(rec => (
            <div key={rec._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px' }}>
              <h4>{rec.companyName}</h4>
              <p><strong>Email:</strong> {rec.email}</p>
              <p><strong>Name:</strong> {rec.name}</p>
              <button onClick={() => approveRecruiter(rec._id)} style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none' }}>
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
