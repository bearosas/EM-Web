import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import '../styles/App.css'; 
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import StudentList from './StudentList.jsx';
import Contents from './Contents.jsx';
import EditContent from './Editc.jsx'; // Import the new EditContent component
import JenImage from '../assets/jen.png'; 

// Navbar Component
const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">EasyMind</NavLink>
        <div className="collapse navbar-collapse d-flex justify-content-center">
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                } 
                to="/dashboard"
              >
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                } 
                to="/student-list"
              >
                Student List
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                } 
                to="/contents"
              >
                Contents
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                } 
                to="/assessments"
              >
                Assessments
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                } 
                to="/reports"
              >
                Reports
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="d-flex align-items-center">
          <img src={JenImage} alt="User" className="user-profile-img rounded-circle me-2" />
          <span>▼</span>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student-list" element={<StudentList />} />
          <Route path="/contents" element={<Contents />} />
          <Route path="/assessments" element={<div>Assessments Page (To be implemented)</div>} />
          <Route path="/reports" element={<div>Reports Page (To be implemented)</div>} />
          <Route path="/edit-content/:id" element={<EditContent />} /> {/* Add the new route */}
          <Route path="/" element={<Dashboard />} /> {/* Default route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;