const express = require("express");
const mysql = require("mysql2/promise");
const session = require("express-session");
const cors = require("cors");

const app = express();

// --- CORS setup ---
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true, // allow cookies
  })
);

// --- JSON parsing ---
app.use(express.json());

// --- Session setup ---
app.use(
  session({
    secret: "suhas_jagadish_sagar",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // false if HTTP, true if HTTPS
  })
);

// -----------------------------------------------
// MYSQL POOL CONNECTION
// -----------------------------------------------
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "college_feedback_system",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB connection
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("MySQL Connected Successfully!");
    conn.release();
  } catch (err) {
    console.error("DB Connection Failed:", err);
  }
})();

// --- Basic route ---
app.get("/", (req, res) => res.send("Server is running!"));

//=========================================================
//  Admin Login API
//=========================================================
app.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;
  const [result] = await db.query(
    "SELECT * FROM admin WHERE username = ? AND password = ?",
    [username, password]
  );
  if (result.length > 0) res.json({ success: true, message: "Login successful" });
  else res.json({ success: false, message: "Invalid username or password" });
});

//=========================================================
// Student Login API
//=========================================================
app.post("/student-login", async (req, res) => {
  const { usn, session_id } = req.body;
  if (!usn || !session_id)
    return res.status(400).json({ message: "USN and session ID are required" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM student_session WHERE usn = ? AND session_id = ?",
      [usn, session_id]
    );

    if (rows.length === 0) {
      // New student → insert with 'pending'
      await db.query(
        "INSERT INTO student_session (usn, session_id, feedback_given) VALUES (?, ?, 'pending')",
        [usn, session_id]
      );
    } else if (rows[0].feedback_given === "done") {
      return res.status(403).json({ message: "Feedback already submitted" });
    }

    // Save session
    req.session.student = { usn, session_id };
    res.json({ message: "Login successful" });

  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});






//=========================================================
// Fetch faculty for student session
//=========================================================
app.get("/student/subjects/:session_id", async (req, res) => {
  const { session_id } = req.params;
  try {
    const [sessions] = await db.query(
      "SELECT dept_id, sem, section FROM sessions WHERE session_id = ?",
      [session_id]
    );

    if (sessions.length === 0) return res.json([]);

    const { dept_id, sem, section } = sessions[0];

    const [result] = await db.query(
      `SELECT 
          c.course_name,
          c.course_code AS course_id,
          f.faculty_id,
          f.name AS faculty_name,
          a.section,
          a.sem
       FROM assign a
       JOIN course c ON a.course_code = c.course_code
       JOIN faculty f ON a.faculty_id = f.faculty_id
       WHERE a.sem = ? AND a.section = ? AND c.dept_id = ?`,
      [sem, section, dept_id]
    );

    res.json(result);
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//=========================================================
// Submit Feedback API
app.post("/submit-feedback", async (req, res) => {
  const student = req.session?.student;
  if (!student) return res.status(401).json({ error: "Not logged in" });

  const { session_id, facultyList } = req.body;

  if (!session_id || !Array.isArray(facultyList)) {
    return res.status(400).json({ error: "Missing required data" });
  }

  try {
    // Store feedback anonymously (no USN)
    for (let i = 0; i < facultyList.length; i++) {
      const faculty = facultyList[i];
      if (!faculty.faculty_id || !faculty.course_id) 
        return res.status(400).json({ error: "Invalid faculty data" });

      const feedback = faculty.feedback; // object {0: rating1, 1: rating2, ...}

      for (let q = 0; q < 5; q++) {
        const rating = feedback[q];
        if (rating == null) 
          return res.status(400).json({ error: `Missing rating for question ${q + 1}` });

        await db.query(
          "INSERT INTO student_feedback (faculty_id, course_id, question_id, rating, session_id) VALUES (?, ?, ?, ?, ?)",
          [faculty.faculty_id, faculty.course_id, q + 1, rating, session_id]
        );
      }
    }

    // Mark feedback as done for this student
    await db.query(
      "UPDATE student_session SET feedback_given = 'done' WHERE usn = ? AND session_id = ?",
      [student.usn, student.session_id]
    );

    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Submit feedback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



//=========================================================
// All remaining APIs (Admin, Department, Faculty, Session, Course, Assign)
//=========================================================
// Keep all your existing APIs for: /departments, /faculty/by-dept/:dept_id, /faculty/add, /faculty/register,
// /create-session, /get-sessions, /end-session/:id, /delete-session/:id, /add-course, /get-courses/:dept_id, /courses/by-dept/:dept_id, /assign-subject, /faculty/:faculty_id/assignments

// You can copy the code you already have for these APIs here (unchanged)

//=========================================================
// Start Server
//=========================================================

app.get("/departments", async (req, res) => {
  const sql = "SELECT dept_id, dept_name FROM department";
  const [result] = await db.query(sql);
  res.send(result);
});


//=========================================================
// Fetch faculty by department ID
//=========================================================
app.get("/faculty/by-dept/:dept_id", async (req, res) => {
  const { dept_id } = req.params;
  const sql = `SELECT faculty_id, name, email FROM faculty WHERE dept_id = ?`;
  const [results] = await db.query(sql, [dept_id]);
  res.json(results);
});


app.post("/department/add", async (req, res) => {
  const { dept_id, dept_name } = req.body;
  const sql = "INSERT INTO department (dept_id, dept_name) VALUES (?, ?)";

  try {
    await db.query(sql, [dept_id, dept_name]);
    res.json({ success: true });
  } catch {
    res.json({ success: false, message: "DB Error" });
  }
});

app.post("/add-course", async (req, res) => {
  const { dept_id, course_name, course_code, sem } = req.body;

  const sql =
    "INSERT INTO course (dept_id, course_code, course_name, sem) VALUES (?, ?, ?, ?)";

  try {
    await db.query(sql, [dept_id, course_code, course_name, sem]);
    res.json({ success: true, message: "Course added successfully" });
  } catch (err) {
    res.json({ success: false, message: "Database error" });
  }
});


//=========================================================
// Get courses
//=========================================================

app.get("/get-courses/:dept_id", async (req, res) => {
  const { dept_id } = req.params;
  const sql = "SELECT * FROM course WHERE dept_id = ?";
  const [result] = await db.query(sql, [dept_id]);
  res.json(result);
});


//=========================================================
// Assign subject
//=========================================================
app.post("/assign-subject", async (req, res) => {
  const { faculty_id, course_code, sem, section } = req.body;
  const sql = `
      INSERT INTO assign (faculty_id, course_code, sem, section)
      VALUES (?, ?, ?, ?)
  `;
  try {
    await db.query(sql, [faculty_id, course_code, sem, section]);
    res.json({ success: true, message: "Subject assigned successfully" });
  } catch {
    res.json({ success: false, message: "DB Error" });
  }
});


//=========================================================
// Get assigned subjects for faculty
//=========================================================
app.get("/faculty/:faculty_id/assignments", async (req, res) => {
  const { faculty_id } = req.params;

  console.log("Fetching assignments for:", faculty_id);

  const sql = `
    SELECT a.course_code, c.course_name, a.sem, a.section
    FROM assign a
    JOIN course c ON a.course_code = c.course_code
    WHERE LOWER(a.faculty_id) = LOWER(?)
  `;

  const [results] = await db.query(sql, [faculty_id]);

  console.log("Results:", results);

  return res.json(results);
});


app.post("/faculty/add", async (req, res) => {
  const { faculty_id, name, email, dept_id } = req.body;

  try {
    await db.query(
      "INSERT INTO faculty (faculty_id, name, email, dept_id) VALUES (?, ?, ?, ?)",
      [faculty_id, name, email, dept_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error adding faculty:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});


//=========================================================
// Get courses by department
//=========================================================
app.get("/courses/by-dept/:dept_id", async (req, res) => {
  const dept_id = req.params.dept_id;
  const sql =
    "SELECT course_id, course_name, course_code, sem FROM course WHERE dept_id = ?";
  const [result] = await db.query(sql, [dept_id]);
  res.json(result);
});


//=========================================================
// Faculty registration
//=========================================================
app.post("/faculty/register", async (req, res) => {
  const { faculty_id, name, email, dept_id } = req.body;

  if (!faculty_id || !name || !email || !dept_id)
    return res.json({ success: false, message: "All fields required" });

  const [deptResult] = await db.query(
    "SELECT * FROM department WHERE dept_id = ?",
    [dept_id]
  );

  if (deptResult.length === 0)
    return res.json({
      success: false,
      message: "Department ID does not exist",
    });

  const [fidResult] = await db.query(
    "SELECT * FROM faculty WHERE faculty_id = ?",
    [faculty_id]
  );
  if (fidResult.length > 0)
    return res.json({ success: false, message: "Faculty ID already exists" });

  const [emailResult] = await db.query(
    "SELECT * FROM faculty WHERE email = ?",
    [email]
  );
  if (emailResult.length > 0)
    return res.json({ success: false, message: "Email already registered" });

  await db.query(
    "INSERT INTO faculty (faculty_id, name, email, dept_id) VALUES (?, ?, ?, ?)",
    [faculty_id, name, email, dept_id]
  );
  res.json({ success: true, message: "Faculty registered successfully!" });
});


//=========================================================
// Create session
//=========================================================
app.post("/create-session", async (req, res) => {
  const { session_id, dept_id, sem, section } = req.body;

  try {
    await db.query(
      "INSERT INTO sessions (session_id, dept_id, sem, section, status) VALUES (?, ?, ?, ?, ?)",
      [session_id, dept_id, sem, section, "active"]
    );
    res.json({ message: "Session created" });
  } catch (err) {
    res.status(500).json({ message: "Error creating session" });
  }
});

//=========================================================
// Get sessions
//=========================================================
app.get("/get-sessions", async (req, res) => {
  try {
    const sql = `
      SELECT 
          s.session_id,
          s.dept_id,
          s.sem,
          s.section,
          s.status,
          d.dept_name,
          DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS created_at
      FROM sessions s
      JOIN department d
        ON s.dept_id = d.dept_id
      ORDER BY s.status DESC
    `;

    const [result] = await db.query(sql);
    res.json(result);
  } catch (err) {
    console.error("Error loading sessions:", err);
    res.status(500).json({ message: "DB error", error: err });
  }
});

//=========================================================
// End session
//=========================================================
app.put("/end-session/:id", async (req, res) => {
  const sessionId = req.params.id;

  try {
    const [result] = await db.query(
      "UPDATE sessions SET status = ? WHERE session_id = ?",
      ["ended", sessionId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Session not found" });

    res.json({ message: "Session ended successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error ending session" });
  }
});

//=========================================================
// Delete session
//=========================================================
app.delete("/delete-session/:id", async (req, res) => {
  const sessionId = req.params.id;

  const [rows] = await db.query(
    "SELECT status FROM sessions WHERE session_id = ?",
    [sessionId]
  );

  if (!rows || rows.length === 0)
    return res.status(404).json({ message: "Session not found" });

  await db.query("DELETE FROM sessions WHERE session_id = ?", [sessionId]);
  res.json({ message: "Session deleted successfully" });
});



app.get("/feedback/subjects_with_avg/:faculty_id", async (req, res) => {
  const { faculty_id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT course_id, AVG(rating) AS avg_rating 
       FROM student_feedback 
       WHERE faculty_id = ?
       GROUP BY course_id`,
      [faculty_id]
    );

    res.json(rows);

  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/feedback/questions_avg/:faculty_id/:course_id", async (req, res) => {
  const { faculty_id, course_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT question_id, AVG(rating) AS avg_rating
       FROM student_feedback
       WHERE faculty_id = ? AND course_id = ?
       GROUP BY question_id`,
      [faculty_id, course_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});






app.get("/faculty/assigned/:faculty_id", async (req, res) => {
  const { faculty_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT a.course_code, c.course_name, a.sem, a.section
       FROM assign a
       JOIN course c ON a.course_code = c.course_code
       WHERE a.faculty_id = ?`,
      [faculty_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/top-faculties", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        f.faculty_id,
        f.name,
        f.email,
        d.dept_name,
        c.course_name,
        c.course_code,
        s.sem,
        s.section,
        AVG(fr.rating) AS avg_rating
      FROM faculty f
      JOIN assign fc ON f.faculty_id = fc.faculty_id
      JOIN course c ON fc.course_code = c.course_code
      JOIN sessions s ON fc.session_id = s.session_id
      JOIN student_feedback fr 
         ON fr.faculty_id = f.faculty_id 
        AND fr.course_code = c.course_code
      JOIN department d ON f.dept_id = d.dept_id
      GROUP BY 
        f.faculty_id, c.course_code, s.section
      ORDER BY avg_rating DESC
    `);

    // Get top 1 faculty per department
    const seenDept = new Set();
    const top = [];

    for (const r of rows) {
      if (!seenDept.has(r.dept_name)) {
        top.push(r);
        seenDept.add(r.dept_name);
      }
      if (top.length === 2) break;
    }

    return res.json(top);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching top faculties" });
  }
});







app.listen(8081, () => console.log("Server running on port 8081"));
