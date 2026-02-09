import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AssignSubjectPage.css";

function AssignSubjectPage() {
  const { dept_id, faculty_id } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [courseCode, setCourseCode] = useState("");
  const [sem, setSem] = useState("");
  const [section, setSection] = useState("");
  const [message, setMessage] = useState("");

  // Load all courses in this department
  const loadCourses = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8081/courses/by-dept/${dept_id}`
      );
      setCourses(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const assignSubject = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8081/assign-subject", {
        faculty_id,
        dept_id,
        course_code: courseCode,
        sem,
        section,
      });

      if (res.data.success) {
        setMessage("Subject assigned successfully!");
        setCourseCode("");
        setSem("");
        setSection("");
      } else {
        setMessage("Assignment failed!");
      }
    } catch (err) {
      console.log(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="assign-container">
      <h2>Assign Subject to Faculty: {faculty_id}</h2>

      <form onSubmit={assignSubject} className="assign-form">
        {/* Select Course */}
  <select
  value={courseCode}
  onChange={(e) => setCourseCode(e.target.value)}
  required
>
  <option value="">Select Course</option>

  {courses.map((c) => (
    <option key={c.course_id} value={c.course_code}>
      {c.course_name} ({c.course_code})
    </option>
  ))}
</select>


        {/* Semester */}
        <input
          type="number"
          placeholder="Semester"
          value={sem}
          onChange={(e) => setSem(e.target.value)}
          required
        />

        {/* Section */}
        <input
          type="text"
          placeholder="Section (A/B/C)"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          required
        />

        <button type="submit">Assign</button>
      </form>

      {message && <p className="msg">{message}</p>}

      <button className="back-btn" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
}

export default AssignSubjectPage;
