const token = localStorage.getItem("token");

fetch("https://orycom-backend.fly.devapi/users/dashboard", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("student-name").textContent = `Welcome, ${data.name}`;
    document.getElementById("student-photo").src = `/uploads/${data.photo}`;

    const coursesList = document.getElementById("courses-list");
    data.courses.forEach((course) => {
      const card = document.createElement("div");
      card.className = "course-card";
card.innerHTML = `
  <img src="/uploads/${course.thumbnail || 'default-thumb.jpg'}" alt="${course.title}" class="course-thumb" />
  <h4>${course.title}</h4>
  <p><strong>Instructor:</strong> ${course.instructor}</p>
  <p><strong>Category:</strong> ${course.category}</p>
  <div class="progress-bar">
    <div class="progress" style="width: ${course.progress}%"></div>
  </div>
  <button class="view-btn">View Course</button>
`;

      coursesList.appendChild(card);
    });
  })
  .catch((err) => {
    console.error("Dashboard load error:", err);
  });
