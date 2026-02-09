import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

function FeedbackPage() {
  const { session_id } = useParams();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8081/student/subjects/${session_id}`)
      .then(res => setSubjects(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>Feedback Form</h2>

      {subjects.map((sub) => (
        <div key={sub.course_code}>
          <h4>{sub.course_name}</h4>
          <p>Faculty: {sub.faculty_name}</p>

          <label>Rating (1-5)</label>
          <input type="number" min="1" max="5" />

          <label>Comments</label>
          <textarea />

          <hr/>
        </div>
      ))}
    </div>
  );
}

export default FeedbackPage;
