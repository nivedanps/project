import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./AnalyzeFeedbackPage.css";

const QUESTIONS = [
  "Clarity of explanation from the faculty.",
  "Use of examples and teaching aids.",
  "Punctuality and organization of class.",
  "Encouragement of student participation.",
  "Effectiveness of communication.",
];

function AnalyzeFeedbackPage() {
  const { faculty_id } = useParams();
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [feedbackData, setFeedbackData] = useState({}); // { course_code: { questions_avg: [], overall_avg: 0 } }
  const [loading, setLoading] = useState(true);

  // Fetch assigned courses for this faculty
  useEffect(() => {
    const fetchAssignedCourses = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8081/faculty/assigned/${faculty_id}`
        );
        setAssignedCourses(res.data);
      } catch (err) {
        console.error("Error loading assigned courses:", err);
      }
    };
    fetchAssignedCourses();
  }, [faculty_id]);

  // Fetch feedback for each course
  useEffect(() => {
    const fetchFeedback = async () => {
      const tempData = {};
      for (const course of assignedCourses) {
        try {
          const res = await axios.get(
            `http://localhost:8081/feedback/questions_avg/${faculty_id}/${course.course_code}`
          );

          // Calculate overall average
          const overallAvg =
            res.data.reduce((sum, q) => sum + parseFloat(q.avg_rating), 0) /
            QUESTIONS.length;

          tempData[course.course_code] = {
            questions_avg: res.data,
            overall_avg: overallAvg.toFixed(2),
          };
        } catch (err) {
          console.error(
            `Error fetching feedback for course ${course.course_code}:`,
            err
          );
          tempData[course.course_code] = {
            questions_avg: QUESTIONS.map(() => ({ avg_rating: 0 })),
            overall_avg: 0,
          };
        }
      }
      setFeedbackData(tempData);
      setLoading(false);
    };

    if (assignedCourses.length > 0) fetchFeedback();
  }, [assignedCourses, faculty_id]);

  if (loading) return <p>Loading feedback...</p>;

  return (
    <div className="analyze-container">
      <h2>Feedback Analysis for Faculty: {faculty_id}</h2>
      {assignedCourses.length === 0 ? (
        <p>No courses assigned to this faculty.</p>
      ) : (
        assignedCourses.map((course) => (
          <div key={course.course_code} className="course-glass-box">
            <h3>
              {course.course_name} ({course.course_code})
            </h3>
            <p>
              Sem: {course.sem} | Section: {course.section}
            </p>

            <div className="questions-feedback">
              {QUESTIONS.map((q, index) => {
                const qAvg =
                  feedbackData[course.course_code]?.questions_avg.find(
                    (item) => item.question_id === index + 1
                  )?.avg_rating || 0;
                return (
                  <div key={index} className="question-glass">
                    <p>{q}</p>
                    <span>Average Rating: {parseFloat(qAvg).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="overall-rating">
              Overall Average Rating:{" "}
              {feedbackData[course.course_code]?.overall_avg || 0}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AnalyzeFeedbackPage;
