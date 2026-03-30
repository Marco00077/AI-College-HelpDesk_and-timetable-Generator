import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import './AdminPanel.css';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('courses');
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'courses') {
        const res = await axios.get('/api/admin/courses');
        setCourses(res.data);
      } else if (activeTab === 'subjects') {
        const res = await axios.get('/api/admin/subjects');
        setSubjects(res.data);
      } else if (activeTab === 'teachers') {
        const res = await axios.get('/api/admin/teachers');
        setTeachers(res.data);
        const subRes = await axios.get('/api/admin/subjects');
        setSubjects(subRes.data);
      } else if (activeTab === 'classes') {
        const res = await axios.get('/api/admin/classes');
        setClasses(res.data);
        const subRes = await axios.get('/api/admin/subjects');
        setSubjects(subRes.data);
        const courseRes = await axios.get('/api/admin/courses');
        setCourses(courseRes.data);
      } else if (activeTab === 'knowledge') {
        const res = await axios.get('/api/admin/knowledge');
        setKnowledge(res.data);
      } else if (activeTab === 'generate') {
        const res = await axios.get('/api/admin/classes');
        setClasses(res.data);
        const courseRes = await axios.get('/api/admin/courses');
        setCourses(courseRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'courses') {
        await axios.post('/api/admin/courses', formData);
      } else if (activeTab === 'subjects') {
        await axios.post('/api/admin/subjects', formData);
      } else if (activeTab === 'teachers') {
        await axios.post('/api/admin/teachers', formData);
      } else if (activeTab === 'classes') {
        await axios.post('/api/admin/classes', formData);
      } else if (activeTab === 'knowledge') {
        const kbData = {
          ...formData,
          keywords: formData.keywords.split(',').map(k => k.trim()),
        };
        await axios.post('/api/admin/knowledge', kbData);
      }
      
      alert('Added successfully!');
      setFormData({});
      fetchData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    
    try {
      await axios.delete(`/api/admin/${activeTab}/${id}`);
      fetchData();
    } catch (error) {
      alert('Error deleting item');
    }
  };

  const generateTimetable = async (courseId) => {
    try {
      await axios.post('/api/timetable/generate', { courseId });
      alert('Timetable generated successfully for all sections!');
    } catch (error) {
      alert('Error generating timetable: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>
      
      <div className="tabs">
        <button onClick={() => setActiveTab('courses')} className={activeTab === 'courses' ? 'active' : ''}>
          Courses
        </button>
        <button onClick={() => setActiveTab('subjects')} className={activeTab === 'subjects' ? 'active' : ''}>
          Subjects
        </button>
        <button onClick={() => setActiveTab('teachers')} className={activeTab === 'teachers' ? 'active' : ''}>
          Teachers
        </button>
        <button onClick={() => setActiveTab('classes')} className={activeTab === 'classes' ? 'active' : ''}>
          Classes
        </button>
        <button onClick={() => setActiveTab('knowledge')} className={activeTab === 'knowledge' ? 'active' : ''}>
          Knowledge Base
        </button>
        <button onClick={() => setActiveTab('generate')} className={activeTab === 'generate' ? 'active' : ''}>
          Generate Timetable
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'courses' && (
          <div>
            <form onSubmit={handleSubmit} className="form">
              <input
                type="text"
                placeholder="Course Name (e.g., Computer Science)"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Course Code (e.g., CSE)"
                value={formData.code || ''}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
              />
              <input
                type="text"
                placeholder="Duration (e.g., 4 years)"
                value={formData.duration || ''}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Annual Fees (e.g., 150000)"
                value={formData.fees || ''}
                onChange={(e) => setFormData({...formData, fees: e.target.value})}
                required
              />
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="diploma">Diploma</option>
                <option value="certificate">Certificate</option>
              </select>
              <button type="submit">Add Course</button>
            </form>
            
            <div className="list">
              {courses.map(course => (
                <div key={course._id} className="list-item">
                  <div>
                    <strong>{course.name}</strong> ({course.code})
                    <p>Duration: {course.duration} | Fees: ₹{course.fees.toLocaleString('en-IN')}</p>
                    <p>Category: {course.category}</p>
                    {course.description && <p style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>{course.description}</p>}
                  </div>
                  <button onClick={() => handleDelete(course._id)} className="delete-btn">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div>
            <form onSubmit={handleSubmit} className="form">
              <input
                type="text"
                placeholder="Subject Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Subject Code"
                value={formData.code || ''}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Hours Per Week"
                value={formData.hoursPerWeek || ''}
                onChange={(e) => setFormData({...formData, hoursPerWeek: e.target.value})}
                required
              />
              <button type="submit">Add Subject</button>
            </form>
            
            <div className="list">
              {subjects.map(subject => (
                <div key={subject._id} className="list-item">
                  <span>{subject.name} ({subject.code}) - {subject.hoursPerWeek}h/week</span>
                  <button onClick={() => handleDelete(subject._id)} className="delete-btn">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div>
            <form onSubmit={handleSubmit} className="form">
              <input
                type="text"
                placeholder="Teacher Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Employee ID"
                value={formData.employeeId || ''}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                required
              />
              <select
                multiple
                value={formData.subjects || []}
                onChange={(e) => setFormData({...formData, subjects: Array.from(e.target.selectedOptions, option => option.value)})}
              >
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
              <button type="submit">Add Teacher</button>
            </form>
            
            <div className="list">
              {teachers.map(teacher => (
                <div key={teacher._id} className="list-item">
                  <span>{teacher.name} ({teacher.employeeId})</span>
                  <button onClick={() => handleDelete(teacher._id)} className="delete-btn">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div>
            <form onSubmit={handleSubmit} className="form">
              <select
                value={formData.course || ''}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.name} ({course.code})</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Section (e.g., A, B, C)"
                value={formData.section || ''}
                onChange={(e) => setFormData({...formData, section: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Semester (e.g., 1, 2, 3)"
                value={formData.semester || ''}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                required
                min="1"
              />
              <label style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>Select Subjects (hold Ctrl/Cmd to select multiple):</label>
              <select
                multiple
                value={formData.subjects || []}
                onChange={(e) => setFormData({...formData, subjects: Array.from(e.target.selectedOptions, option => option.value)})}
                style={{minHeight: '120px'}}
              >
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>{subject.name} ({subject.code})</option>
                ))}
              </select>
              <button type="submit">Add Class Section</button>
            </form>
            
            <div className="list">
              {classes.map(cls => (
                <div key={cls._id} className="list-item">
                  <div>
                    <strong>{cls.course?.name || 'N/A'} - Section {cls.section}</strong>
                    <p>Semester: {cls.semester} | Subjects: {cls.subjects?.length || 0}</p>
                  </div>
                  <button onClick={() => handleDelete(cls._id)} className="delete-btn">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div>
            <form onSubmit={handleSubmit} className="form">
              <input
                type="text"
                placeholder="Keywords (comma-separated)"
                value={formData.keywords || ''}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Intent (e.g., ask_fees)"
                value={formData.intent || ''}
                onChange={(e) => setFormData({...formData, intent: e.target.value})}
                required
              />
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                <option value="fees">Fees</option>
                <option value="courses">Courses</option>
                <option value="admission">Admission</option>
                <option value="timetable">Timetable</option>
                <option value="general">General</option>
              </select>
              <textarea
                placeholder="Response"
                value={formData.response || ''}
                onChange={(e) => setFormData({...formData, response: e.target.value})}
                required
                rows="4"
              />
              <button type="submit">Add Knowledge</button>
            </form>
            
            <div className="list">
              {knowledge.map(kb => (
                <div key={kb._id} className="list-item">
                  <div>
                    <strong>{kb.intent}</strong> ({kb.category})
                    <p>{kb.keywords.join(', ')}</p>
                  </div>
                  <button onClick={() => handleDelete(kb._id)} className="delete-btn">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div>
            <h3>Generate Timetable by Course</h3>
            <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>
              Generate timetable for all sections of a course at once
            </p>
            <div className="list">
              {courses.map(course => {
                const courseSections = classes.filter(cls => cls.course?._id === course._id || cls.course === course._id);
                return (
                  <div key={course._id} className="list-item">
                    <div>
                      <strong>{course.name} ({course.code})</strong>
                      <p>Sections: {courseSections.map(c => c.section).join(', ') || 'None'}</p>
                    </div>
                    <button 
                      onClick={() => generateTimetable(course._id)} 
                      className="generate-btn"
                      disabled={courseSections.length === 0}
                    >
                      Generate All Sections
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
