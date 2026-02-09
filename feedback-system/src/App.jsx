import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

import AdminLogin from "./components/AdminLogin";
import StudentLogin from "./components/StudentLogin";
import AdminDashboard from "./components/AdminDashboard";
import DepartmentPage from "./components/DepartmentPage";
import DepartmentAdd from "./components/DepartmentAdd";
import AddCoursePage from "./components/AddCoursepage";
import AssignSubjectPage from "./components/AssignSubjectPage";
import FeedbackForm from "./components/FeedbackForm";
import AnalyzeFeedbackPage from "./components/AnalyzeFeedbackPage";

// Popup modal component
import FacultyRegistrationModal from "./components/FacultyRegistrationModal";

function Home() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const [formData, setFormData] = useState({
    dept_id: "",
    faculty_id: "",
    name: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const registerFaculty = async () => {
    const res = await fetch("http://localhost:8081/faculty/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) setShowPopup(false);
  };

  return (
    <div className="home-container">
      <h1 className="title">MITM Feedback System</h1>

      <div className="button-group">
        <button className="admin-btn" onClick={() => navigate("/admin-login")}>
          Admin Login
        </button>

        <button
          className="student-btn"
          onClick={() => navigate("/student-login")}
        >
          Student Login
        </button>

        <button className="faculty-btn" onClick={() => setShowPopup(true)}>
          Faculty Registration
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Register Faculty</h2>

            <input
              type="text"
              name="dept_id"
              placeholder="Department ID"
              onChange={handleChange}
            />

            <input
              type="text"
              name="faculty_id"
              placeholder="Faculty ID"
              onChange={handleChange}
            />

            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
            />

            <button className="submit-btn" onClick={registerFaculty}>
              Register
            </button>

            <button
              className="submit-btn close-btn"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/department/:dept_id" element={<DepartmentPage />} />
      <Route path="/admin/department/add" element={<DepartmentAdd />} />
      <Route path="/add-course/:dept_id" element={<AddCoursePage />} />
      <Route
        path="/assign-subject/:dept_id/:faculty_id"
        element={<AssignSubjectPage />}
      />
      <Route path="/feedback" element={<FeedbackForm />} />
      <Route path="/analyze/:faculty_id" element={<AnalyzeFeedbackPage />} />
    </Routes>
  );
}

export default App;
