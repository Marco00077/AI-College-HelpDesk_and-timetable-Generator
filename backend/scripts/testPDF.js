const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const PDFDocument = require('pdfkit');
const fs = require('fs');

dotenv.config();

const testPDF = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get first class with timetable
    const timetable = await Timetable.findOne()
      .populate({
        path: 'class',
        populate: { path: 'course' }
      })
      .populate('schedule.periods.subject')
      .populate('schedule.periods.teacher');

    if (!timetable) {
      console.log('No timetable found. Generate one first.');
      process.exit(1);
    }

    console.log(`Generating PDF for ${timetable.class.course?.name} Section ${timetable.class.section}...`);

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `test-timetable.pdf`;
    const stream = fs.createWriteStream(filename);
    
    doc.pipe(stream);
    
    // Add title
    const courseName = timetable.class.course?.name || 'Class';
    const section = timetable.class.section;
    
    doc.fontSize(22).font('Helvetica-Bold').text(`Timetable`, { align: 'center' });
    doc.fontSize(16).font('Helvetica').text(`${courseName} - Section ${section}`, { align: 'center' });
    doc.fontSize(12).text(`Semester ${timetable.class.semester}`, { align: 'center' });
    doc.moveDown(2);
    
    // Add schedule
    timetable.schedule.forEach((daySchedule, index) => {
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
    
    // Add footer
    doc.fontSize(8).font('Helvetica')
      .text(
        `Generated on ${new Date().toLocaleDateString()}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    
    doc.end();
    
    stream.on('finish', () => {
      console.log(`\n✅ PDF generated successfully: ${filename}`);
      console.log('Check the backend folder for the PDF file.');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
};

testPDF();
