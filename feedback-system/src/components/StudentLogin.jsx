import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentLogin.css";

export default function StudentLogin() {
  const [usn, setUsn] = useState("");
  const [session_id, setSessionId] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8081/student-login",
        { usn, session_id },
        { withCredentials: true }
      );

      navigate("/feedback", { state: { session_id } });
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError("Network error - check server");
      }
    }
  };

  return (
    <div className="student-login-container">
      <form className="student-login-box" onSubmit={handleSubmit}>
        <h2>Student Login</h2>
        <input
          type="text"
          placeholder="Enter USN"
          value={usn}
          required
          onChange={(e) => setUsn(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Session ID"
          value={session_id}
          required
          onChange={(e) => setSessionId(e.target.value)}
        />
        {error && <p className="error-msg">{error}</p>}
        <button type="submit">Proceed to Feedback</button>
      </form>
    </div>
  );
}
