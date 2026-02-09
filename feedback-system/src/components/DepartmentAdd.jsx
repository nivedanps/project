import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//import "./DepartmentAdd.css";

function DepartmentAdd() {
  const [deptId, setDeptId] = useState("");
  const [deptName, setDeptName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deptId || !deptName) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/department/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dept_id: deptId, dept_name: deptName }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Department added successfully!");
        navigate("/admin-dashboard"); // redirect back to dashboard
      } else {
        setError(data.message || "Failed to add department");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div className="dept-add-container">
      <h2>Add New Department</h2>

      <form className="dept-form" onSubmit={handleSubmit}>
        <label>Department ID</label>
        <input
          type="text"
          value={deptId}
          onChange={(e) => setDeptId(e.target.value)}
          placeholder="Enter department ID"
        />

        <label>Department Name</label>
        <input
          type="text"
          value={deptName}
          onChange={(e) => setDeptName(e.target.value)}
          placeholder="Enter department name"
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="submit-btn">
          Add Department
        </button>
      </form>
    </div>
  );
}

export default DepartmentAdd;
