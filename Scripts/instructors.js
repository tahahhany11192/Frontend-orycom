const container = document.getElementById('instructors-container');
const form = document.getElementById('instructor-form');
const modal = document.getElementById('instructor-form-modal');

function fetchInstructors() {
  fetch('https://backend-g8fsuq.fly.devapi/instructors/getinstructor')
    .then(res => res.json())
    .then(data => {
      container.innerHTML = '';
      data.forEach(instr => {
        const div = document.createElement('div');
        div.innerHTML = `
          <img src="/uploads/${instr.photo}" width="100">
          <h3>${instr.name}</h3>
          <p>${instr.email}</p>
          <button onclick="editInstructor('${instr._id}', '${instr.name}', '${instr.email}')">Edit</button>
          <a href="instructor-details.html?id=${instr._id}">Manage Content</a>
        `;
        container.appendChild(div);
      });
    });
}


function openAddForm() {
  document.getElementById('form-title').innerText = 'Add Instructor';
  form.reset();
  document.getElementById('instructorId').value = '';
  document.getElementById('password').style.display = 'block';
  modal.style.display = 'block';
}

function editInstructor(id, name, email) {
  document.getElementById('form-title').innerText = 'Edit Instructor';
  document.getElementById('instructorId').value = id;
  document.getElementById('name').value = name;
  document.getElementById('email').value = email;
  if (id) {
  document.getElementById('password').style.display = 'none';
  document.getElementById('password').removeAttribute('required');
} else {
  document.getElementById('password').style.display = 'block';
  document.getElementById('password').setAttribute('required', 'true');
}

  modal.style.display = 'block';
}

function closeForm() {
  modal.style.display = 'none';
}

form.onsubmit = async (e) => {
  e.preventDefault();

  const id = document.getElementById('instructorId').value;
  const formData = new FormData();
  formData.append('name', document.getElementById('name').value);
  formData.append('email', document.getElementById('email').value);

  const photoInput = document.getElementById('photo');
  if (photoInput.files[0]) {
    formData.append('photo', photoInput.files[0]);
  }

  if (!id) {
    formData.append('password', document.getElementById('password').value);

    await fetch('https://backend-g8fsuq.fly.devapi/instructors/addinstructor', {
      method: 'POST',
      body: formData
      
    });
  } else {
    await fetch(`https://backend-g8fsuq.fly.devapi/instructors/${id}`, {
      method: 'PUT',
      body: formData
    });
  }

  closeForm();
  fetchInstructors();
};

fetchInstructors();
