function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

function toggleSpecs() {
  const info = document.getElementById("extra-info");
  if (info) {
    info.style.display = info.style.display === "none" ? "block" : "none";
  }
}


function showImage(index) {
  const images = document.querySelectorAll('.slider img');
  images.forEach((img, i) => {
    img.classList.toggle('active', i === index);
  });
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function submitReview() {
  const review = document.getElementById("review");
  const container = document.getElementById("reviewSection");
  if (review && container) {
    const sanitizedReview = document.createTextNode(review.value);
    const paragraph = document.createElement("p");
    paragraph.appendChild(sanitizedReview);
    container.appendChild(paragraph);
  }
}

function toggleMenu() {
  const navLinks = document.getElementById('nav-links');
  const nav = document.querySelector('nav');
  if (navLinks && nav) {
    navLinks.classList.toggle('show');
    nav.classList.toggle('menu-open');
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const email = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const res = await fetch("https://orycom-backend.fly.devapi/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          window.location.href = "../Pages/index.html";
        } else {
          if (errorMsg) errorMsg.textContent = data.message || "Invalid email or password!";
        }
      } catch (err) {
        if (errorMsg) errorMsg.textContent = "Network error. Please try again later.";
      }
    });
  }

  const registerForm = document.getElementById("registerForm");
  const regMsg = document.getElementById("regMsg");

  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(registerForm);
      try {
        const res = await fetch("https://orycom-backend.fly.devapi/auth/register", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          regMsg.style.color = "green";
          regMsg.textContent = "✅ Registered! Now you can log in.";
          registerForm.reset();
        } else {
          regMsg.style.color = "red";
          regMsg.textContent = data.message || "Registration failed.";
        }
      } catch (err) {
        regMsg.style.color = "red";
        regMsg.textContent = "❌ Network error.";
      }
    });
  }


window.updateProfilePhoto = async function () {
  const token = localStorage.getItem("token");
  const fileInput = document.getElementById("newPhoto");
  const file = fileInput.files[0];

  if (!token || !file) {
    alert("❌ You must select a photo and be logged in.");
    return;
  }

  const formData = new FormData();
  formData.append("photo", document.getElementById("newPhoto").files[0]);
  
  if (!formData.get("photo")) {
    alert("❌ Please select a photo to upload.");
    return;
  }


  try {
    const token = localStorage.getItem("token");
    const res = await fetch("https://orycom-backend.fly.devapi/user/update-photo", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Profile photo updated!");
      // Refresh profile
      fetchProfile();
    } else {
      alert("❌ " + (data.message || "Failed to update photo."));
    }
  } catch (err) {
    alert("❌ Network error");
  }
};




  window.getFreeCourse = async function () {
    const courseId = "6868843691f59b8c38d3896c";
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ You must be logged in to get this course.");
      window.location.href = "../Pages/registeration.html";
      return;
    }

    try {
      const res = await fetch(`https://orycom-backend.fly.devapi/user/enroll/6868843691f59b8c38d3896c`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Course added to your profile!");
      } else {
        alert("❌ " + (data.message || "Unknown error"));
      }
    } catch (error) {
      alert("❌ Error enrolling in course.");
    }
  };


  // ----------------------------
  // COURSE: Buy Course
  // ----------------------------
  window.buyCourse = async function (courseId) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ You must be logged in to buy a course.");
      window.location.href = "../Pages/registeration.html";
      return;
    }

    try {
      const res = await fetch(`https://orycom-backend.fly.devapi/courses/buy/${courseId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Course purchased!");
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Error processing your request.");
    }
  };

  // ----------------------------
  // PROFILE: Fetch User Profile
  // ----------------------------
  async function fetchProfile() {
    const token = localStorage.getItem("token");
    const profileInfo = document.getElementById("profileInfo");

    if (!token) {
      if (profileInfo) {
        profileInfo.textContent = "Not logged in.";
      }
      return;
    }

    try {
      const res = await fetch("https://orycom-backend.fly.devapi/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (profileInfo) profileInfo.textContent = "Failed to load profile.";
        return;
      }

      const user = await res.json();

      if (profileInfo) {

          document.getElementById("profileImg").src = `https://orycom-backend.fly.devuploads/${user.photo}`;
          document.getElementById("profileDetails").innerHTML = `
          <p><b>Name:</b> ${user.name}</p>
          <p><b>Age:</b> ${user.age}</p>
          <p><b>Email:</b> ${user.email}</p>
          <p><b>User ID:</b> ${user._id}</p>
          <p><b>Joined:</b> ${new Date(user.createdAt).toLocaleString()}</p>
        `;
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (profileInfo) profileInfo.textContent = "Error loading profile.";
    }
  }

  // ----------------------------
  // PROFILE: Fetch My Courses
  // ----------------------------
  async function fetchCourses() {
    const token = localStorage.getItem("token");
    const coursesList = document.getElementById("coursesList");

    if (!token || !coursesList) {
      return;
    }

    try {
      const res = await fetch("https://orycom-backend.fly.devapi/user/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        coursesList.textContent = "Failed to load courses.";
        return;
      }

      const { courses } = await res.json();
      if (!courses.length) {
        coursesList.innerHTML = "<em>You have not enrolled in any courses yet.</em>";
        return;
      }

      coursesList.innerHTML = `
        <ul style="padding-left:1.2em;">
          ${courses
            .map(
              (course) => `
            <li>
              <b>${course.title}</b><br>
              <span style="color:#666;">${course.description || ""}</span>
            </li>
          `
            )
            .join("")}
        </ul>
      `;
    } catch (err) {
      coursesList.textContent = "Error loading courses.";
    }
  }

  // ----------------------------
  // LOGOUT
  // ----------------------------
  window.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "../Pages/LOGIN2.html";
  };

  // ----------------------------
  // Load Profile & Courses
  // ----------------------------
  fetchProfile();
  fetchCourses();
});


