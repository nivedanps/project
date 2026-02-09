import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./FeedbackForm.css";

const QUESTIONS = [
  "Clarity of explanation from the faculty.",
  "Use of examples and teaching aids.",
  "Punctuality and organization of class.",
  "Encouragement of student participation.",
  "Effectiveness of communication.",
];

export default function FeedbackForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session_id } = location.state; // ✅ remove USN

  const [loading, setLoading] = useState(true);
  const [facultyList, setFacultyList] = useState([]);
  const [feedbackData, setFeedbackData] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:8081/student/subjects/${session_id}`)
      .then((res) => {
        setFacultyList(res.data);
        setLoading(false);
      })
      .catch(() => alert("Failed to fetch faculty"));
  }, [session_id]);

  const handleRatingChange = (facultyIndex, questionIndex, rating) => {
    setFeedbackData((prev) => ({
      ...prev,
      [facultyIndex]: {
        ...prev[facultyIndex],
        [questionIndex]: rating,
      },
    }));
  };

  const validateSubmission = () => {
    for (let fIndex = 0; fIndex < facultyList.length; fIndex++) {
      for (let qIndex = 0; qIndex < QUESTIONS.length; qIndex++) {
        if (!feedbackData[fIndex] || !feedbackData[fIndex][qIndex]) {
          return {
            valid: false,
            msg: `Please answer question ${qIndex + 1} for ${facultyList[fIndex].faculty_name}`,
          };
        }
      }
    }
    return { valid: true };
  };

  const handleSubmit = async () => {
    const check = validateSubmission();
    if (!check.valid) return alert(check.msg);

    if (!window.confirm("Are you sure you want to submit? You cannot edit later.")) return;

    try {
      // Prepare payload for backend
      const feedbackPayload = facultyList.map((faculty, fIndex) => ({
        faculty_id: faculty.faculty_id,
        course_id: faculty.course_id,
        feedback: feedbackData[fIndex],
      }));

      await axios.post(
        "http://localhost:8081/submit-feedback",
        {
          session_id,
          facultyList: feedbackPayload, // backend expects this
        },
        { withCredentials: true } // ✅ send session cookie
      );

      alert("Feedback submitted successfully!");
      navigate("/");

    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.error || "Submission error — check backend!");
    }
  };

  return (
    <div className="feedback-container">
      <h2>Course Feedback</h2>
      <p><b>Session:</b> {session_id}</p>

      {loading ? (
        <h3>Loading faculty...</h3>
      ) : (
        facultyList.map((item, facultyIndex) => (
          <div className="faculty-box" key={facultyIndex}>
            <h3>
              {item.faculty_name} (ID: {item.faculty_id}) — {item.course_name}
            </h3>

            {QUESTIONS.map((q, qIndex) => (
              <div className="question-row" key={qIndex}>
                <label>{q}</label>
                <div className="rating-box">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label
                      key={num}
                      className={
                        feedbackData[facultyIndex] &&
                        feedbackData[facultyIndex][qIndex] == num
                          ? "selected-rating"
                          : ""
                      }
                    >
                      <input
                        type="radio"
                        name={`faculty-${facultyIndex}-question-${qIndex}`}
                        value={num}
                        onChange={() => handleRatingChange(facultyIndex, qIndex, Number(num))}
                      />
                      {num}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        Submit Feedback
      </button>
    </div>
  );
}
