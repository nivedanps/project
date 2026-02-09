import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./AddCoursePage.css";

function AddCoursePage() {
  const { dept_id } = useParams();

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [sem, setSem] = useState("");
  const [message, setMessage] = useState("");

  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("add"); // "add" | "list"

  // Fetch Courses of Department
  useEffect(() => {
    fetchCourses();
  }, [dept_id]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/get-courses/${dept_id}`);
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8081/add-course", {
        dept_id,
        course_name: courseName,
        course_code: courseCode,
        sem,
      });

      if (res.data.success) {
        setMessage("Course added successfully!");
        setCourseName("");
        setCourseCode("");
        setSem("");
        fetchCourses(); // reload course list
      } else {
        setMessage("Failed to add course");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="add-course-container">

      <h2>Department: {dept_id}</h2>

      {/* 🔥 NAVBAR */}
      <div className="navbar">
        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          Course List
        </button>

        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          Add Course
        </button>
      </div>

      {/* 🔥 TAB CONTENTS */}
      <div className="tab-content">
        {activeTab === "list" && (
          <div className="course-list">
            <h3>Courses in {dept_id}</h3>

            {courses.length === 0 ? (
              <p>No courses added yet.</p>
            ) : (
              <ul>
                {courses.map((c) => (
                  <li key={c.course_id}>
                    <strong>{c.course_code}</strong> — {c.course_name} (Sem {c.sem})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "add" && (
          <form onSubmit={handleAddCourse} className="add-course-form">
            <input
              type="text"
              placeholder="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Course Code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Semester"
              value={sem}
              onChange={(e) => setSem(e.target.value)}
              required
            />

            <button type="submit">Add Course</button>
          </form>
        )}

        {message && <p className="msg">{message}</p>}
      </div>
    </div>
  );
}

export default AddCoursePage;
