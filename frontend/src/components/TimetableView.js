import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import './TimetableView.css';

function TimetableView() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchClasses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/admin/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const filteredClasses = selectedCourse 
    ? classes.filter(cls => cls.course?._id === selectedCourse || cls.course === selectedCourse)
    : classes;

  const fetchTimetable = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/timetable/${selectedClass}`);
      setTimetable(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      alert('Timetable not found. Please generate one from admin panel.');
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    if (!selectedClass) return;
    
    try {
      // Use axios with blob response type
      const response = await axios.get(`/api/timetable/${selectedClass}/pdf`, {
        responseType: 'blob'
      });
      
      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `timetable-${timetable.class.course?.code || 'class'}-section-${timetable.class.section}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="timetable-container">
      <h2>View Timetable</h2>
      
      <div className="controls">
        <select 
          value={selectedCourse} 
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setSelectedClass('');
            setTimetable(null);
          }}
        >
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>

        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Section</option>
          {filteredClasses.map(cls => (
            <option key={cls._id} value={cls._id}>
              {cls.course?.name || 'N/A'} - Section {cls.section} (Sem {cls.semester})
            </option>
          ))}
        </select>
        
        <button onClick={fetchTimetable} disabled={!selectedClass || loading}>
          {loading ? 'Loading...' : 'View Timetable'}
        </button>
        
        {timetable && (
          <button onClick={downloadPDF} className="pdf-btn">
            Download PDF
          </button>
        )}
      </div>

      {timetable && (
        <div className="timetable-display">
          <h3>
            {timetable.class.course?.name || 'N/A'} - Section {timetable.class.section}
          </h3>
          <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>Semester {timetable.class.semester}</p>
          
          {timetable.schedule && timetable.schedule.length > 0 ? (
            timetable.schedule.map((daySchedule, index) => (
              <div key={index} className="day-schedule">
                <h4>{daySchedule.day}</h4>
                {daySchedule.periods && daySchedule.periods.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Subject</th>
                        <th>Teacher</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daySchedule.periods.map((period, pIndex) => (
                        <tr key={pIndex}>
                          <td>{period.periodNumber}</td>
                          <td>{period.subject?.name || 'N/A'}</td>
                          <td>{period.teacher?.name || 'N/A'}</td>
                          <td>{period.startTime} - {period.endTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{fontSize: '0.9rem', color: '#666', padding: '1rem'}}>No periods scheduled for this day</p>
                )}
              </div>
            ))
          ) : (
            <div style={{padding: '2rem', textAlign: 'center', color: '#666'}}>
              <p>No timetable data available.</p>
              <p style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>
                Please go to Admin Panel → Generate Timetable and click "Generate All Sections" for this course.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TimetableView;
