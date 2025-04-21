import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import '../styles/Dashboard.css';
import jenImage from '../assets/jen.png';

// StatCard Component
const StatCard = ({ value, label, className }) => {
  return (
    <div className={`db-stat-card ${className}`}>
      <div>
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
};

// ChartCard Component
const ChartCard = ({ title, chartId, chartType, chartData, chartOptions, className }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
      console.error(`Canvas element with ID ${chartId} not found.`);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error(`Failed to get 2D context for canvas with ID ${chartId}.`);
      return;
    }
    const chart = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: chartOptions
    });

    return () => chart.destroy();
  }, [chartData, chartOptions]);

  return (
    <div className={`db-chart-card ${className || ''}`}>
      <h3>{title}</h3>
      <canvas id={chartId}></canvas>
    </div>
  );
};

// TopStudentsCard Component
const TopStudentsCard = () => {
  const students = [
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' },
    { name: 'John Doe', score: '85%' }
  ];

  return (
    <div className="db-top-students-card">
      <div className="d-flex justify-content-between align-items-center">
        <h3>Top Students</h3>
        <select className="dropdown form-select form-select-sm w-auto">
          <option>Category</option>
          <option>Math</option>
          <option>Science</option>
          <option>English</option>
        </select>
      </div>
      <ul>
        {students.map((student, index) => (
          <li key={index}>
            <img src={jenImage} alt="Student" className="db-top-student-img" />
            <span className="db-student-name">{student.name}</span>
            <span className="db-student-score">{student.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  // Data and options for Weekly Progress Chart (Line)
  const weeklyProgressData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Progress',
      data: [5, 8, 6, 9, 4, 2, 1],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };
  const weeklyProgressOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 10
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // Data and options for Assessment Results Chart (Pie)
  const assessmentResultsData = {
    labels: ['Passed', 'Failed'],
    datasets: [{
      data: [80, 20],
      backgroundColor: ['#A7F3D0', '#E5E7EB']
    }]
  };
  const assessmentResultsOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 15
        }
      }
    }
  };

  // Data and options for Daily Logins Chart (Bar)
  const dailyLoginsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Logins',
      data: [3, 2, 5, 4, 2, 1, 1],
      backgroundColor: '#93C5FD'
    }]
  };
  const dailyLoginsOptions = {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // Data and options for Overall Class Performance Chart (Pie)
  const overallPerformanceData = {
    labels: ['Assessments', 'Comprehension', 'Pronunciation'],
    datasets: [{
      data: [40, 30, 30],
      backgroundColor: ['#A5B4FC', '#FECACA', '#A7F3D0']
    }]
  };
  const overallPerformanceOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20,
          padding: 15
        }
      }
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold">DASHBOARD</h2>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatCard value="21" label="Total Number of Students" className="db-total-students" />
        </div>
        <div className="col-md-3 mb-3">
          <StatCard value="21" label="Improved Students" className="db-improved-students" />
        </div>
        <div className="col-md-3 mb-3">
          <StatCard value="21" label="Needs Improvement" className="db-needs-improvement" />
        </div>
        <div className="col-md-3 mb-3">
          <StatCard value="21" label="Reading Materials" className="db-reading-materials" />
        </div>
      </div>

      {/* Charts and Top Students */}
      <div className="row">
        {/* Left Column: Weekly Progress and Daily Logins */}
        <div className="col-md-6">
          {/* Weekly Progress */}
          <div className="mb-4">
            <ChartCard
              title="Weekly Progress"
              chartId="weeklyProgressChart"
              chartType="line"
              chartData={weeklyProgressData}
              chartOptions={weeklyProgressOptions}
            />
          </div>

          {/* Daily Logins */}
          <div className="mb-4">
            <ChartCard
              title="Daily Logins"
              chartId="dailyLoginsChart"
              chartType="bar"
              chartData={dailyLoginsData}
              chartOptions={dailyLoginsOptions}
            />
          </div>
        </div>

        {/* Right Column: Assessment Results, Overall Class Performance, and Top Students */}
        <div className="col-md-6">
          <div className="row">
            {/* Assessment Results and Overall Class Performance */}
            <div className="col-md-6">
              {/* Assessment Results */}
              <div className="mb-4">
                <ChartCard
                  title="Assessment Results"
                  chartId="assessmentResultsChart"
                  chartType="pie"
                  chartData={assessmentResultsData}
                  chartOptions={assessmentResultsOptions}
                />
              </div>

              {/* Overall Class Performance */}
              <div className="mb-4">
                <ChartCard
                  title="Overall Class Performance"
                  chartId="overallPerformanceChart"
                  chartType="pie"
                  chartData={overallPerformanceData}
                  chartOptions={overallPerformanceOptions}
                  className="db-overall-performance-card"
                />
              </div>
            </div>

            {/* Top Students */}
            <div className="col-md-6 mb-4">
              <TopStudentsCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;