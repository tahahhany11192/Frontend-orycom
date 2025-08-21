document.addEventListener('DOMContentLoaded', async function() {
  const courseId = new URLSearchParams(window.location.search).get('id');
  if (!courseId) {
    alert('No course specified');
    window.location.href = '../Pages/products.html';
    return;
  }

  // Fetch course data
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to access course content');
      window.location.href = '../Pages/LOGIN2.html';
      return;
    }

    const res = await fetch(`https://backend-g8fsuq.fly.devapi/courses/${courseId}/content`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new Error(await res.text());
    }
    
    const course = await res.json();
    renderCourse(course);
  } catch (err) {
    console.error('Error loading course:', err);
    alert('Failed to load course content');
  }

  function renderCourse(course) {
    document.getElementById('courseTitle').textContent = course.title;
    
    // Render lessons list
    const lessonsList = document.getElementById('lessonsList');
    course.lessons.forEach((lesson, index) => {
      const lessonItem = document.createElement('div');
      lessonItem.className = 'lesson-item';
      lessonItem.innerHTML = `
        <h4>${index + 1}. ${lesson.title}</h4>
        <div class="lesson-meta">
          ${lesson.videoUrl ? '<span class="video-icon">▶</span>' : ''}
          ${lesson.pdfs.length ? `<span class="pdf-icon">📄 ${lesson.pdfs.length}</span>` : ''}
          ${lesson.assignments.length ? `<span class="assignment-icon">📝 ${lesson.assignments.length}</span>` : ''}
          ${lesson.quizzes.length ? `<span class="quiz-icon">❓ ${lesson.quizzes.length}</span>` : ''}
        </div>
      `;
      lessonItem.addEventListener('click', () => loadLesson(lesson));
      lessonsList.appendChild(lessonItem);
    });
    
    // Load first lesson by default
    if (course.lessons.length > 0) {
      loadLesson(course.lessons[0]);
    }
  }

  function loadLesson(lesson) {
    document.getElementById('lessonTitle').textContent = lesson.title;
    document.getElementById('lessonDescription').textContent = lesson.description;
    
    // Load video if exists
    if (lesson.videoUrl) {
      const videoPlayer = videojs('lessonVideo', {
        controls: true,
        autoplay: false,
        preload: 'auto',
        sources: [{
          src: lesson.videoUrl,
          type: 'application/x-mpegURL'
        }]
      });
    }
    
    // Render PDFs
    const pdfsList = document.getElementById('pdfsList');
    pdfsList.innerHTML = '';
    lesson.pdfs.forEach(pdf => {
      const pdfItem = document.createElement('a');
      pdfItem.href = pdf.url;
      pdfItem.target = '_blank';
      pdfItem.className = 'pdf-item';
      pdfItem.textContent = pdf.title;
      pdfsList.appendChild(pdfItem);
    });
    
    // Render assignments
    const assignmentsSection = document.getElementById('assignmentsSection');
    assignmentsSection.innerHTML = '';
    if (lesson.assignments.length > 0) {
      assignmentsSection.innerHTML = '<h4>Assignments</h4>';
      lesson.assignments.forEach(assignment => {
        const assignmentDiv = document.createElement('div');
        assignmentDiv.className = 'assignment-item';
        
        // Check if user has already submitted
        const submission = assignment.submissions.find(sub => 
          sub.studentId._id === localStorage.getItem('userId'));
        
        assignmentDiv.innerHTML = `
          <h5>${assignment.title}</h5>
          <p>${assignment.description}</p>
          ${assignment.dueDate ? `<p>Due: ${new Date(assignment.dueDate).toLocaleString()}</p>` : ''}
          
          ${submission ? `
            <div class="submission-info">
              <p>Submitted on ${new Date(submission.submittedAt).toLocaleString()}</p>
              ${submission.grade ? `<p>Grade: ${submission.grade}/100</p>` : '<p>Not graded yet</p>'}
              ${submission.feedback ? `<p>Feedback: ${submission.feedback}</p>` : ''}
            </div>
          ` : `
            <form class="assignment-form" id="assignmentForm-${assignment._id}">
              <input type="file" id="assignmentFile-${assignment._id}" required>
              <button type="submit">Submit</button>
            </form>
          `}
        `;
    
        assignmentsSection.appendChild(assignmentDiv);
        
        // Add form submission handler if needed
        if (!submission) {
          const form = document.getElementById(`assignmentForm-${assignment._id}`);
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitAssignment(course._id, lesson._id, assignment._id);
          });
        }
      });
    }
    
    // Render quizzes
    const quizzesSection = document.getElementById('quizzesSection');
    quizzesSection.innerHTML = '';
    if (lesson.quizzes.length > 0) {
      quizzesSection.innerHTML = '<h4>Quizzes</h4>';
      lesson.quizzes.forEach(quiz => {
        const quizDiv = document.createElement('div');
        quizDiv.className = 'quiz-item';
        
        // Check if user has already taken the quiz
        const attempt = quiz.attempts.find(att => 
          att.studentId._id === localStorage.getItem('userId'));
        
        quizDiv.innerHTML = `
          <h5>${quiz.title}</h5>
          <p>Passing score: ${quiz.passingScore}%</p>
          
          ${attempt ? `
            <div class="quiz-result">
              <p>Your score: ${attempt.score}%</p>
              <p>Status: ${attempt.score >= quiz.passingScore ? 'Passed' : 'Failed'}</p>
              <p>Completed on ${new Date(attempt.completedAt).toLocaleString()}</p>
            </div>
          ` : `
            <button class="take-quiz-btn" data-quiz-id="${quiz._id}">Take Quiz</button>
          `}
        `;
        
        quizzesSection.appendChild(quizDiv);
      });
      
      // Add quiz button handlers
      document.querySelectorAll('.take-quiz-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const quizId = btn.getAttribute('data-quiz-id');
          startQuiz(course._id, lesson._id, quizId);
        });
      });
    }
  }
  
async function submitAssignment(courseId, lessonId, assignmentId) {
    const fileInput = document.getElementById(`assignmentFile-${assignmentId}`);
    const file = fileInput.files[0];
    
    if (!file) {
      alert('Please select a file');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('assignmentFile', file); // fixed field name to match backend
      
      const token = localStorage.getItem('token');
      const res = await fetch(
        `https://backend-g8fsuq.fly.devapi/courses/${courseId}/lessons/${lessonId}/assignments/${assignmentId}/submit`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      alert('Assignment submitted successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert('Failed to submit assignment');
    }
  }
  
  function startQuiz(courseId, lessonId, quizId) {
    // Implement quiz UI
    console.log('Starting quiz', quizId);
    // You would create a modal or new page for the quiz
  }
}); 

//assignmentFile
