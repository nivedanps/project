import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DepartmentPage.css";

function DepartmentPage() {
  const { dept_id } = useParams();
  const [faculties, setFaculties] = useState([]);
  const [facultyAssignments, setFacultyAssignments] = useState({});
  const navigate = useNavigate();

  // ---------- POPUP STATES ----------
  const [showPopup, setShowPopup] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    faculty_id: "",
    name: "",
    email: "",
    dept_id: dept_id,
  });

  // Load all faculties
  const loadFaculty = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8081/faculty/by-dept/${dept_id}`
      );
      setFaculties(res.data);

      // Load assignments for each faculty
      const assignments = {};
      for (const f of res.data) {
        try {
          const aRes = await axios.get(
            `http://localhost:8081/faculty/${f.faculty_id}/assignments`
          );
          assignments[f.faculty_id] = aRes.data;
        } catch (err) {
          assignments[f.faculty_id] = [];
        }
      }
      setFacultyAssignments(assignments);
    } catch (err) {
      console.error("Error fetching faculty:", err);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, [dept_id]);

  // ---------- Handle Add Faculty ----------
  const handleAddFaculty = async () => {
    if (!newFaculty.faculty_id || !newFaculty.name || !newFaculty.email) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post("http://localhost:8081/faculty/add", newFaculty);
      alert("Faculty added successfully");

      setShowPopup(false);
      setNewFaculty({ faculty_id: "", name: "", email: "", dept_id });

      loadFaculty(); // refresh list
    } catch (err) {
      console.error("Error adding faculty:", err);
      alert("Failed to add faculty");
    }
  };

  return (
    <div>
      {/* ---------- NAVBAR ---------- */}
      <nav className="dept-navbar">
        <h3>Department: {dept_id}</h3>
        <ul>
          <li onClick={() => navigate(`/add-course/${dept_id}`)}>Subject</li>
          {/*<li onClick={() => alert("Analysis Coming Soon")}>Analyze</li>*/}
        </ul>
      </nav>

      {/* ---------- HEADER WITH ADD BUTTON ---------- */}
      <div className="faculty-header">
        <h2>Faculty List</h2>
        <button className="add-faculty-btn" onClick={() => setShowPopup(true)}>
          + Add Faculty
        </button>
      </div>

      {/* ---------- FACULTY LIST ---------- */}
      <div className="faculty-container faculty-grid">
        {faculties.length === 0 ? (
          <p>No faculty found for this department.</p>
        ) : (
          faculties.map((f) => (
            <div key={f.faculty_id} className="faculty-card">
              <h3>{f.faculty_id}</h3>
              <p>
                <strong>Name:</strong> {f.name}
              </p>
              <p>
                <strong>Email:</strong> {f.email}
              </p>

              {/* ---------- Assigned Courses ---------- */}
              <div className="assigned-courses">
                <strong>Assigned Courses:</strong>
                {facultyAssignments[f.faculty_id] &&
                facultyAssignments[f.faculty_id].length > 0 ? (
                  <ul>
                    {facultyAssignments[f.faculty_id].map((course) => (
                      <li key={course.course_code}>
                        {course.course_name} ({course.course_code}) - Sem:{" "}
                        {course.sem} | Sec: {course.section}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No course assigned yet</p>
                )}
              </div>

              <div className="faculty-buttons">
                <button
                  className="assign-btn"
                  onClick={() =>
                    navigate(`/assign-subject/${dept_id}/${f.faculty_id}`)
                  }
                >
                  Assign
                </button>
                <button
                  className="analyze-btn"
                  onClick={() => navigate(`/analyze/${f.faculty_id}`)}
                >
                  Analyze
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ---------- POPUP ADD FACULTY ---------- */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Add New Faculty</h3>

            <input
              type="text"
              placeholder="Faculty ID"
              value={newFaculty.faculty_id}
              onChange={(e) =>
                setNewFaculty({ ...newFaculty, faculty_id: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Full Name"
              value={newFaculty.name}
              onChange={(e) =>
                setNewFaculty({ ...newFaculty, name: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              value={newFaculty.email}
              onChange={(e) =>
                setNewFaculty({ ...newFaculty, email: e.target.value })
              }
            />

            <div className="popup-buttons">
              <button onClick={handleAddFaculty} className="save-btn">
                Save
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentPage;
