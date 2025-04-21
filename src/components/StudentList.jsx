import { useState } from 'react';
import '../styles/StudentList.css';
import jenImage from '../assets/jen.png';

// StudentList Component
const StudentList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample student data with nickname and supportNeed
  const students = Array(9).fill({
    name: 'John Doe',
    uid: '111111',
    nickname: 'Junnie',
    supportNeed: 'Intellectual Disability',
  });

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.uid.includes(searchTerm) ||
    student.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.supportNeed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn sl-btn-add-student">
          <span className="me-2">+</span>Add Student
        </button>
        <div className="d-flex align-items-center">
          <input
            type="text"
            className="form-control sl-search-input me-2"
            placeholder="Search....."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="dropdown">
            <button className="btn sl-btn-filter dropdown-toggle" type="button" id="filterDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              Filter by
            </button>
            <ul className="dropdown-menu" aria-labelledby="filterDropdown">
              <li><a className="dropdown-item" href="#">Name</a></li>
              <li><a className="dropdown-item" href="#">UID</a></li>
              <li><a className="dropdown-item" href="#">Nickname</a></li>
              <li><a className="dropdown-item" href="#">Support Need</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Student Grid */}
      <div className="row">
        {filteredStudents.map((student, index) => (
          <div key={index} className="col-md-4 mb-3">
            {/* First Card: Name, UID, Image, and Edit Button */}
            <div className="sl-student-card sl-student-card-top d-flex align-items-center justify-content-between p-3">
              <div className="d-flex align-items-center">
              <img src={jenImage} alt="Student" className="sl-student-img me-3" />
                <div>
                  <h5 className="mb-0 sl-student-name">{student.name}</h5>
                  <p className="mb-0 sl-student-uid">UID: {student.uid}</p>
                </div>
              </div>
              <button className="btn sl-btn-edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>
              </button>
            </div>
            {/* Second Card: Nickname and Support Need */}
            <div className="sl-student-card sl-student-card-bottom p-3">
              <p className="mb-0 sl-student-nickname">
                <span className="sl-label-bold">Nickname: </span>{student.nickname}
              </p>
              <p className="mb-0 sl-student-support-need">
                <span className="sl-label-bold">Support Need: </span>{student.supportNeed}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentList;