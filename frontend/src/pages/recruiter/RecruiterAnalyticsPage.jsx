import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSkillsAnalytics, getJobsAnalytics } from '../../services/api.js';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * RecruiterAnalyticsPage
 * 
 * Analytics dashboard with charts showing:
 * - Skills frequency among job seekers
 * - Job availability vs candidate supply
 */
export default function RecruiterAnalyticsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('skills'); // 'skills' or 'jobs'
  const [skillsData, setSkillsData] = useState([]);
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter, token]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (filter === 'skills') {
        const data = await getSkillsAnalytics(token);
        setSkillsData(Array.isArray(data) ? data : []);
      } else {
        const data = await getJobsAnalytics(token);
        setJobsData(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Skills chart data
  const skillsChartData = {
    labels: skillsData.slice(0, 10).map(item => item.skill),
    datasets: [
      {
        label: 'Number of Candidates',
        data: skillsData.slice(0, 10).map(item => item.count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Jobs chart data
  const jobsChartData = {
    labels: jobsData.map(item => item.jobTitle),
    datasets: [
      {
        label: 'Matching Candidates',
        data: jobsData.map(item => item.count),
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
      },
    },
    scales: filter === 'skills' ? {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    } : {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/recruiter')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Overview
        </button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Analytics Dashboard</h2>
            <p className="text-sm text-white/70">Market trends and candidate insights</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-white/70">Analyze by:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary transition-colors"
            >
              <option value="skills">Skills</option>
              <option value="jobs">Jobs</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-white/60">Loading analytics...</p>
          </div>
        )}

        {!loading && filter === 'skills' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Most Available Skills Among Job Seekers</h3>
            {skillsData.length > 0 ? (
              <div className="h-96">
                <Bar data={skillsChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/60">No skills data available</p>
              </div>
            )}
          </div>
        )}

        {!loading && filter === 'jobs' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Availability vs Candidate Supply</h3>
            <p className="text-xs text-white/60">
              Shows number of matching candidates (fitment score ≥ 50%) for each of your posted jobs
            </p>
            {jobsData.length > 0 ? (
              <div className="h-96">
                <Bar data={jobsChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/60">No jobs data available. Post jobs to see analytics.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

