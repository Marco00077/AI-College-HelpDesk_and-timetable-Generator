import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import './CoursesView.css';

function CoursesView() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
    setLoading(false);
  };

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => course.category === filter);

  return (
    <div className="courses-container">
      <h2>Available Courses</h2>
      
      <div className="filter-controls">
        <button 
          onClick={() => setFilter('all')} 
          className={filter === 'all' ? 'active' : ''}
        >
          All Courses
        </button>
        <button 
          onClick={() => setFilter('undergraduate')} 
          className={filter === 'undergraduate' ? 'active' : ''}
        >
          Undergraduate
        </button>
        <button 
          onClick={() => setFilter('postgraduate')} 
          className={filter === 'postgraduate' ? 'active' : ''}
        >
          Postgraduate
        </button>
        <button 
          onClick={() => setFilter('diploma')} 
          className={filter === 'diploma' ? 'active' : ''}
        >
          Diploma
        </button>
        <button 
          onClick={() => setFilter('certificate')} 
          className={filter === 'certificate' ? 'active' : ''}
        >
          Certificate
        </button>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-header">
                <h3>{course.name}</h3>
                <span className="course-code">{course.code}</span>
              </div>
              
              {course.description && (
                <p className="course-description">{course.description}</p>
              )}
              
              <div className="course-details">
                <div className="detail-item">
                  <span className="label">Duration:</span>
                  <span className="value">{course.duration}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Annual Fees:</span>
                  <span className="value fees">₹{course.fees.toLocaleString('en-IN')}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Category:</span>
                  <span className="value category">{course.category}</span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredCourses.length === 0 && (
            <p className="no-courses">No courses found in this category.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CoursesView;
