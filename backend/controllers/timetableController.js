const Timetable = require('../models/Timetable');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const { generateTimetable } = require('../utils/timetableGenerator');
const PDFDocument = require('pdfkit');

// Generate timetable for a class or course
const generateClassTimetable = async (req, res) => {
  try {
    const { classId, courseId } = req.body;
    
    console.log('Generate timetable request:', { classId, courseId });
    
    if (!classId && !courseId) {
      return res.status(400).json({ error: 'Class ID or Course ID is required' });
    }
    
    let classesToGenerate = [];
    
    if (courseId) {
      // Generate for all sections of a course
      classesToGenerate = await Class.find({ course: courseId }).populate('subjects').populate('course');
      console.log(`Found ${classesToGenerate.length} classes for course ${courseId}`);
      if (classesToGenerate.length === 0) {
        return res.status(404).json({ error: 'No classes found for this course' });
      }
    } else {
      // Generate for single class
      const classData = await Class.findById(classId).populate('subjects').populate('course');
      if (!classData) {
        return res.status(404).json({ error: 'Class not found' });
      }
      classesToGenerate = [classData];
    }
    
    // Fetch teachers
    const teachers = await Teacher.find().populate('subjects');
    console.log(`Found ${teachers.length} teachers`);
    
    // Shared teacher schedule across all sections to avoid conflicts
    const sharedTeacherSchedule = {};
    teachers.forEach(teacher => {
      sharedTeacherSchedule[teacher._id.toString()] = {};
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
        sharedTeacherSchedule[teacher._id.toString()][day] = [];
      });
    });
    
    // Generate timetable for each class
    const results = [];
    for (const classData of classesToGenerate) {
      console.log(`Generating timetable for ${classData.course?.name} Section ${classData.section}`);
      console.log(`Class has ${classData.subjects.length} subjects`);
      
      const schedule = await generateTimetable(classData, classData.subjects, teachers, sharedTeacherSchedule);
      console.log(`Generated schedule with ${schedule.length} days`);
      
      // Save to database
      const timetable = await Timetable.findOneAndUpdate(
        { class: classData._id },
        { class: classData._id, schedule },
        { upsert: true, new: true }
      ).populate('class');
      
      results.push(timetable);
    }
    
    console.log(`Successfully generated ${results.length} timetables`);
    res.json({ success: true, timetables: results, count: results.length });
    
  } catch (error) {
    console.error('Timetable generation error:', error);
    res.status(500).json({ error: 'Failed to generate timetable: ' + error.message });
  }
};

// Get timetable for a class
const getTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const timetable = await Timetable.findOne({ class: classId })
      .populate({
        path: 'class',
        populate: { path: 'course subjects' }
      })
      .populate('schedule.periods.subject')
      .populate('schedule.periods.teacher');
    
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    
    res.json(timetable);
    
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
};

// Generate PDF for timetable
const generatePDF = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const timetable = await Timetable.findOne({ class: classId })
      .populate({
        path: 'class',
        populate: { path: 'course' }
      })
      .populate('schedule.periods.subject')
      .populate('schedule.periods.teacher');
    
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    
    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers
    const courseName = timetable.class.course?.name || 'Class';
    const section = timetable.class.section;
    const filename = `timetable-${courseName.replace(/\s+/g, '-')}-Section-${section}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);
    
    // Add title
    doc.fontSize(22).font('Helvetica-Bold').text(`Timetable`, { align: 'center' });
    doc.fontSize(16).font('Helvetica').text(`${courseName} - Section ${section}`, { align: 'center' });
    doc.fontSize(12).text(`Semester ${timetable.class.semester}`, { align: 'center' });
    doc.moveDown(2);
    
    // Add schedule
    timetable.schedule.forEach((daySchedule, index) => {
      // Add page break if needed (not on first day)
      if (index > 0 && index % 3 === 0 && doc.y > 700) {
        doc.addPage();
      }
      
      doc.fontSize(14).font('Helvetica-Bold').text(daySchedule.day, { underline: true });
      doc.moveDown(0.5);
      
      if (daySchedule.periods && daySchedule.periods.length > 0) {
        daySchedule.periods.forEach(period => {
          const subjectName = period.subject ? period.subject.name : 'N/A';
          const teacherName = period.teacher ? period.teacher.name : 'N/A';
          
          doc.fontSize(10).font('Helvetica')
            .text(`Period ${period.periodNumber}: `, { continued: true })
            .font('Helvetica-Bold')
            .text(subjectName, { continued: true })
            .font('Helvetica')
            .text(` - ${teacherName}`, { continued: true })
            .fillColor('gray')
            .text(` (${period.startTime} - ${period.endTime})`)
            .fillColor('black');
        });
      } else {
        doc.fontSize(10).font('Helvetica-Oblique')
          .fillColor('gray')
          .text('No classes scheduled')
          .fillColor('black');
      }
      
      doc.moveDown(1.5);
    });
    
    // Add footer on current page only
    doc.fontSize(8).font('Helvetica')
      .text(
        `Generated on ${new Date().toLocaleDateString()}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    
    doc.end();
    
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
};

module.exports = { generateClassTimetable, getTimetable, generatePDF };
