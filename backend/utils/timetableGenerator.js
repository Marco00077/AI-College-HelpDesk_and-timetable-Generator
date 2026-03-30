const generateTimetable = async (classData, subjects, teachers, sharedTeacherSchedule = null) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periodsPerDay = 6;
  const periodDuration = 60;
  const startTime = 9;
  
  // Use section to vary starting point
  const sectionSeed = classData.section.charCodeAt(0);
  
  const schedule = days.map(day => ({
    day,
    periods: [],
  }));
  
  // Use shared schedule if provided, otherwise create local one
  const teacherSchedule = sharedTeacherSchedule || {};
  if (!sharedTeacherSchedule) {
    teachers.forEach(teacher => {
      teacherSchedule[teacher._id.toString()] = {};
      days.forEach(day => {
        teacherSchedule[teacher._id.toString()][day] = [];
      });
    });
  }
  
  const subjectPeriods = {};
  subjects.forEach(subject => {
    subjectPeriods[subject._id.toString()] = subject.hoursPerWeek || 3;
  });
  
  // Start from different day based on section to create variety
  let dayIndex = sectionSeed % days.length;
  
  // Shuffle subjects based on section to create different order
  const shuffledSubjects = [...subjects].sort((a, b) => {
    const aCode = a.code.charCodeAt(0) + sectionSeed;
    const bCode = b.code.charCodeAt(0) + sectionSeed;
    return aCode - bCode;
  });
  
  for (const subject of shuffledSubjects) {
    const subjectId = subject._id.toString();
    let periodsToAssign = subjectPeriods[subjectId];
    
    const teacher = teachers.find(t => 
      t.subjects.some(s => s._id.toString() === subjectId)
    );
    
    if (!teacher) {
      console.log(`Warning: No teacher found for subject ${subject.name}`);
      continue;
    }
    
    const teacherId = teacher._id.toString();
    
    let attempts = 0;
    const maxAttempts = days.length * periodsPerDay * 3;
    
    while (periodsToAssign > 0 && attempts < maxAttempts) {
      const day = days[dayIndex % days.length];
      const daySchedule = schedule.find(s => s.day === day);
      
      if (daySchedule.periods.length < periodsPerDay) {
        const periodNumber = daySchedule.periods.length + 1;
        
        // Check if teacher is available (shared across all sections)
        if (!teacherSchedule[teacherId][day].includes(periodNumber)) {
          const startHour = startTime + Math.floor((periodNumber - 1) * periodDuration / 60);
          const startMinute = ((periodNumber - 1) * periodDuration) % 60;
          const endHour = startTime + Math.floor(periodNumber * periodDuration / 60);
          const endMinute = (periodNumber * periodDuration) % 60;
          
          const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
          const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          
          daySchedule.periods.push({
            periodNumber,
            subject: subject._id,
            teacher: teacher._id,
            startTime: startTimeStr,
            endTime: endTimeStr,
          });
          
          // Mark teacher as busy (shared across sections)
          teacherSchedule[teacherId][day].push(periodNumber);
          periodsToAssign--;
        }
      }
      
      dayIndex++;
      attempts++;
    }
  }
  
  return schedule;
};

module.exports = { generateTimetable };
