document.getElementById('contentForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const res = await fetch('https://backend-g8fsuq.fly.devapi/content/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();

    if (res.ok) {
      document.getElementById('upload-status').innerText = '✅ Content uploaded successfully!';
      form.reset();
    } else {
      document.getElementById('upload-status').innerText = '❌ ' + result.message;
    }
  } catch (err) {
    console.error(err);
    document.getElementById('upload-status').innerText = '❌ Upload failed.';
  }
});
async function loadCourses() {
  const instructorId = 'INSTRUCTOR_ID_HERE'; // Dynamically assign based on login

  const res = await fetch(`https://backend-g8fsuq.fly.devapi/instructors/${instructorId}/courses`);
  const courses = await res.json();

  const dropdown = document.getElementById('courseDropdown');
  courses.forEach(course => {
    const opt = document.createElement('option');
    opt.value = course._id;
    opt.textContent = course.title;
    dropdown.appendChild(opt);
  });
}

loadCourses();



async function loadInstructorContent() {
  const instructorId = 'INSTRUCTOR_ID_HERE'; // dynamically replace if logged in
  const tableBody = document.querySelector('#contentTable tbody');
  tableBody.innerHTML = '';

  try {
    const res = await fetch(`https://backend-g8fsuq.fly.devapi/content/instructor/${instructorId}`);
    const contents = await res.json();

    contents.forEach(content => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${content.title}</td>
        <td>${content.type}</td>
        <td>${content.course?.title || 'N/A'}</td>
        <td><a href="https://backend-g8fsuq.fly.devuploads/${content.file}" target="_blank">View</a></td>
        <td>
          <button onclick="editContent('${content._id}')">✏️</button>
          <button onclick="deleteContent('${content._id}')">🗑️</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error('Failed to load content:', err);
  }
}

loadInstructorContent();



async function deleteContent(id) {
  if (!confirm('Are you sure you want to delete this content?')) return;

  try {
      const res = await fetch(`http://localhost:5000/api/content/${id}`, {
        method: 'DELETE',
    });
    const result = await res.json();

    if (res.ok) {
      alert('Content deleted successfully.');
      loadInstructorContent(); // Refresh the table
    } else {
      alert('❌ ' + result.message);
    }
  } catch (err) {
    alert('Error deleting content.');
    console.error(err);
  }
}

function editContent(id) {
  alert('Editing content not yet implemented.');
  // In next steps we can allow form population and update logic
}


async function editContent(id) {
  try {
    const res = await fetch(`https://backend-g8fsuq.fly.devapi/content/${id}`);
    const content = await res.json();

    // Fill the form
    document.getElementById('contentId').value = content._id;
    document.getElementById('title').value = content.title;
    document.getElementById('type').value = content.type;
    document.getElementById('course').value = content.course; // Assuming course select field exists

    // Optional: Show current file name
    document.getElementById('form-title').innerText = 'Update Content';
    document.getElementById('submitBtn').innerText = 'Update Content';
    document.getElementById('contentForm').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert('Error fetching content.');
    console.error(err);
  }
}


document.getElementById('contentForm').onsubmit = async (e) => {
  e.preventDefault();

  const contentId = document.getElementById('contentId').value;
  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('type', document.getElementById('type').value);
  formData.append('course', document.getElementById('course').value);
  const fileInput = document.getElementById('file');
  if (fileInput.files.length > 0) {
    formData.append('file', fileInput.files[0]);
  }

  const url = contentId
    ? `https://backend-g8fsuq.fly.devapi/content/${contentId}`
    : `https://backend-g8fsuq.fly.devapi/content/upload`;

  const method = contentId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      body: formData,
    });

    const result = await res.json();

    if (res.ok) {
      alert(contentId ? 'Content updated!' : 'Content uploaded!');
      document.getElementById('contentForm').reset();
      document.getElementById('contentId').value = '';
      document.getElementById('submitBtn').innerText = 'Upload Content';
      document.getElementById('form-title').innerText = 'Upload New Content';
      loadInstructorContent();
    } else {
      alert('❌ ' + result.message);
    }
  } catch (err) {
    console.error('Upload failed:', err);
    alert('Something went wrong!');
  }
};

