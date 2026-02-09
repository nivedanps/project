import { useState } from "react";
import axios from "axios";
import "./FacultyRegistrationModal.css";

function FacultyRegistrationModal({ closeModal }) {
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
    try {
      const deptCheck = await axios.get(
        `http://localhost:8081/department/${formData.dept_id}`
      );

      if (!deptCheck.data.exists) {
        alert("❌ Department ID does not exist!");
        return;
      }

      const res = await axios.post(
        "http://localhost:8081/faculty/register",
        formData
      );

      if (res.data.success) {
        alert("✅ Faculty Registered Successfully!");
        closeModal();
      } else {
        alert("❌ Failed to Register Faculty");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error registering faculty");
    }
  };

  return (
    <div className="faculty-modal-overlay">
      <div className="faculty-modal fadeUp">

        {/* Centered heading */}
        <h2 className="modal-title">Faculty Registration</h2>

        <label>Department ID</label>
        <input
          type="text"
          name="dept_id"
          onChange={handleChange}
          placeholder="Enter Department ID"
        />

        <label>Faculty ID</label>
        <input
          type="text"
          name="faculty_id"
          onChange={handleChange}
          placeholder="Enter Faculty ID"
        />

        <label>Name</label>
        <input
          type="text"
          name="name"
          onChange={handleChange}
          placeholder="Enter Name"
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          onChange={handleChange}
          placeholder="Enter Email"
        />

        {/* Buttons aligned cleanly */}
        <div className="modal-buttons">
          <button className="register-btn" onClick={registerFaculty}>
            Register
          </button>
          <button className="close-btn" onClick={closeModal}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default FacultyRegistrationModal;
