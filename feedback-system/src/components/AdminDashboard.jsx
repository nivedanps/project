import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [showDepartments, setShowDepartments] = useState(false);
  const [departments, setDepartments] = useState([]);

  const [showSessionBox, setShowSessionBox] = useState(false);
  const [showActiveSessionBox, setShowActiveSessionBox] = useState(false);
  const [showAddDeptBox, setShowAddDeptBox] = useState(false); // NEW POPUP STATE

  const [sessions, setSessions] = useState([]);

  const [sessionId, setSessionId] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [sem, setSem] = useState("");
  const [section, setSection] = useState("");

  const [newDeptId, setNewDeptId] = useState(""); // NEW STATE
  const [newDeptName, setNewDeptName] = useState(""); // NEW STATE

  const [topFaculties, setTopFaculties] = useState([]);

  const navigate = useNavigate();

  // ======================== LOAD DEPARTMENTS ===========================
  useEffect(() => {
    axios
      .get("http://localhost:8081/departments")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("Error loading departments:", err));
  }, []);

useEffect(() => {
  axios.get("http://localhost:8081/top-faculties")
    .then(res => setTopFaculties(res.data))
    .catch(err => console.error("Error loading top faculties:", err));
}, []);



  const handleDepartmentClick = (dept) => {
    navigate(`/department/${dept.dept_id}`);
  };

  const loadDepartments = () => {
    axios
      .get("http://localhost:8081/departments")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("Error loading departments:", err));
  };

  const addDepartment = async () => {
    if (!newDeptId || !newDeptName) {
      alert("Both Department ID & Name are required");
      return;
    }

    try {
      await axios.post("http://localhost:8081/department/add", {
        dept_id: newDeptId,
        dept_name: newDeptName,
      });

      alert("Department Added Successfully");
      setShowAddDeptBox(false);
      setNewDeptId("");
      setNewDeptName("");
      loadDepartments();
    } catch (err) {
      console.error("Error adding department:", err);
      alert("Error adding department — check console");
    }
  };

  // ==================== GENERATE SESSION ID =======================
  const generateSessionId = () => {
    const id = "S" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionId(id);
  };

  // ==================== CREATE SESSION ============================
  const createSession = async () => {
    if (!sessionId || !selectedDept || !sem || !section) {
      alert("All fields are required");
      return;
    }

    try {
      await axios.post("http://localhost:8081/create-session", {
        session_id: sessionId,
        dept_id: selectedDept,
        sem,
        section,
      });

      alert("Session Created Successfully");
      setShowSessionBox(false);

      setSessionId("");
      setSelectedDept("");
      setSem("");
      setSection("");
    } catch (err) {
      alert("Error creating session");
    }
  };

  // ==================== LOAD ACTIVE SESSIONS ============================
  const loadSessions = async () => {
    try {
      const res = await axios.get("http://localhost:8081/get-sessions");
      setSessions(res.data);
    } catch (err) {
      console.error("Error loading sessions:", err);
    }
  };

  // ==================== END SESSION ============================
  const endSession = async (session_id) => {
    if (!window.confirm("Are You Sure You Want To End This Session?")) return;

    try {
      await axios.put(`http://localhost:8081/end-session/${session_id}`);
      alert("Session Ended Successfully");
      loadSessions(); // refresh sessions
    } catch (err) {
      console.error("Error ending session:", err.response?.data || err.message);
      alert(
        "Error ending session: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // ==================== DELETE SESSION =========================
  const deleteSession = async (session_id) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;

    try {
      await axios.delete(`http://localhost:8081/delete-session/${session_id}`);
      alert("Session deleted successfully");
      loadSessions(); // refresh list
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Error deleting session");
    }
  };

  return (
    <div className="dashboard-container">
      {/* ===================== NAVBAR ====================== */}
      <nav className="navbar">
        <div className="nav-left">
          <img src="/logo.jpeg" className="logo-img" alt="logo" />
          <div className="logo">MIT MYSORE</div>
        </div>
        <div className="nav-right">
          <button
            onClick={() => {
              setShowDepartments(false);
              setShowSessionBox(false);
              setShowActiveSessionBox(false);
            }}
          >
            Home
          </button>

          <button
            onClick={() => {
              setShowDepartments(true);
              setShowSessionBox(false);
              setShowActiveSessionBox(false);
            }}
          >
            Departments
          </button>

          <button
            onClick={() => {
              setShowAddDeptBox(true);
              setShowDepartments(false);
              setShowSessionBox(false);
              setShowActiveSessionBox(false);
            }}
          >
            Add Department
          </button>

          <button
            onClick={() => {
              setShowSessionBox(true);
              setShowActiveSessionBox(false);
            }}
          >
            Create Session
          </button>

          <button
            onClick={() => {
              loadSessions();
              setShowActiveSessionBox(true);
              setShowSessionBox(false);
            }}
          >
            Active Sessions
          </button>
        </div>
      </nav>

      {/* ===================== BODY ====================== */}
      <div className="main-content">
        {!showDepartments ? (
          <div className="welcome-box">
  <h1>Welcome, Admin</h1>
  <p>Use the navigation bar to manage the feedback system</p>

  <h2 style={{ marginTop: "20px" }}>Top Performing Faculties</h2>

  {topFaculties.length === 0 ? (
    <p>No faculty feedback found</p>
  ) : (
    <div className="top-faculty-container">
      {topFaculties.map((f) => (
        <div key={f.faculty_id} className="top-faculty-card">
          <h3>{f.faculty_name}</h3>
          <p><strong>Email:</strong> {f.email}</p>
          <p><strong>Department:</strong> {f.dept_name}</p>
          <p><strong>Subject:</strong> {f.course_name} ({f.course_code})</p>
          <p><strong>Semester:</strong> {f.sem} | <strong>Section:</strong> {f.section}</p>
          <p className="rating">⭐ Highest Avg rating: {parseFloat(f.avg_rating).toFixed(2)}</p>
        </div>
      ))}
    </div>
  )}
</div>

        ) : (
          <div className="department-list">
            <h2>Select a Department</h2>

            {departments.length === 0 ? (
              <p>No departments found</p>
            ) : (
              departments.map((dept) => (
                <button
                  key={dept.dept_id}
                  className="dept-line"
                  onClick={() => handleDepartmentClick(dept)}
                >
                  {dept.dept_name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ====================== CREATE SESSION POPUP ====================== */}
      {showSessionBox && (
        <div className="modal-overlay">
          <div className="modal-box fadeUp">
            <h3>Create Feedback Session</h3>

            <label>Session ID</label>
            <div className="modal-row">
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              />
              <button onClick={generateSessionId}>Generate</button>
            </div>

            <label>Select Department</label>
            <select onChange={(e) => setSelectedDept(e.target.value)} required>
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.dept_id} value={d.dept_id}>
                  {d.dept_name}
                </option>
              ))}
            </select>

            <label>Semester</label>
            <input
              type="number"
              placeholder="1-8"
              value={sem}
              onChange={(e) => setSem(e.target.value)}
            />

            <label>Section</label>
            <input
              type="text"
              placeholder="A/B/C"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowSessionBox(false)}
              >
                Cancel
              </button>
              <button className="create-btn" onClick={createSession}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddDeptBox && (
        <div className="modal-overlay">
          <div className="modal-box fadeUp">
            <h3>Add Department</h3>

            <label>Department ID</label>
            <input
              type="text"
              placeholder="CSE01 / EC02 / MECH03"
              value={newDeptId}
              onChange={(e) => setNewDeptId(e.target.value)}
            />

            <label>Department Name</label>
            <input
              type="text"
              placeholder="Computer Science / Mechanical / Civil"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
            />

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowAddDeptBox(false)}
              >
                Cancel
              </button>
              <button className="create-btn" onClick={addDepartment}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================== ACTIVE SESSION POPUP ====================== */}
      {showActiveSessionBox && (
        <div className="modal-overlay">
          <div className="active-modal-box fadeUp">
            <h3>Active Sessions</h3>

            <div className="session-table">
              {sessions.length === 0 ? (
                <p>No Sessions</p>
              ) : (
                sessions.map((s) => (
                  <div key={s.session_id} className="session-row">
                    <span>{s.session_id}</span>
                    <span>{s.dept_name}</span>
                    <span>Sem {s.sem}</span>
                    <span>Sec {s.section}</span>
                    <span>
                      {new Date(
                        s.created_at.replace(" ", "T")
                      ).toLocaleString()}
                    </span>
                    <span
                      className={
                        s.status === "active" ? "st-active" : "st-closed"
                      }
                    >
                      {s.status}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => deleteSession(s.session_id)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowActiveSessionBox(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
