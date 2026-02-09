-- =====================================================
-- College Feedback System Database Schema
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS college_feedback_system;
USE college_feedback_system;

-- =====================================================
-- Table: admin
-- =====================================================
CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (username: admin, password: admin)
INSERT INTO admin (username, password) VALUES ('admin', 'admin');

-- =====================================================
-- Table: department
-- =====================================================
CREATE TABLE IF NOT EXISTS department (
    dept_id VARCHAR(10) PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample departments
INSERT INTO department (dept_id, dept_name) VALUES 
    ('CSE', 'Computer Science and Engineering'),
    ('ECE', 'Electronics and Communication Engineering'),
    ('ME', 'Mechanical Engineering'),
    ('CE', 'Civil Engineering');

-- =====================================================
-- Table: faculty
-- =====================================================
CREATE TABLE IF NOT EXISTS faculty (
    faculty_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    dept_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES department(dept_id) ON DELETE CASCADE
);

-- Sample faculty
INSERT INTO faculty (faculty_id, name, email, dept_id) VALUES 
    ('FAC001', 'Dr. John Smith', 'john.smith@college.edu', 'CSE'),
    ('FAC002', 'Dr. Jane Doe', 'jane.doe@college.edu', 'CSE'),
    ('FAC003', 'Dr. Robert Brown', 'robert.brown@college.edu', 'ECE');

-- =====================================================
-- Table: course
-- =====================================================
CREATE TABLE IF NOT EXISTS course (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_id VARCHAR(10) NOT NULL,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    sem INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES department(dept_id) ON DELETE CASCADE
);

-- Sample courses
INSERT INTO course (dept_id, course_code, course_name, sem) VALUES 
    ('CSE', 'CS101', 'Data Structures', 3),
    ('CSE', 'CS102', 'Database Management Systems', 4),
    ('CSE', 'CS103', 'Operating Systems', 5),
    ('ECE', 'EC101', 'Digital Electronics', 3),
    ('ECE', 'EC102', 'Microprocessors', 4);

-- =====================================================
-- Table: sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    dept_id VARCHAR(10) NOT NULL,
    sem INT NOT NULL,
    section VARCHAR(5) NOT NULL,
    status ENUM('active', 'ended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES department(dept_id) ON DELETE CASCADE
);

-- Sample session
INSERT INTO sessions (session_id, dept_id, sem, section, status) VALUES 
    ('SESSION2024A', 'CSE', 3, 'A', 'active');

-- =====================================================
-- Table: assign (Faculty-Course Assignment)
-- =====================================================
CREATE TABLE IF NOT EXISTS assign (
    assign_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(20) NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    sem INT NOT NULL,
    section VARCHAR(5) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (course_code) REFERENCES course(course_code) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (faculty_id, course_code, sem, section)
);

-- Sample assignments
INSERT INTO assign (faculty_id, course_code, sem, section) VALUES 
    ('FAC001', 'CS101', 3, 'A'),
    ('FAC002', 'CS102', 4, 'A'),
    ('FAC003', 'EC101', 3, 'A');

-- =====================================================
-- Table: student_session
-- =====================================================
CREATE TABLE IF NOT EXISTS student_session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usn VARCHAR(20) NOT NULL,
    session_id VARCHAR(50) NOT NULL,
    feedback_given ENUM('pending', 'done') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_session (usn, session_id)
);

-- =====================================================
-- Table: student_feedback
-- =====================================================
CREATE TABLE IF NOT EXISTS student_feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(20) NOT NULL,
    course_id VARCHAR(20) NOT NULL,
    question_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    session_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

-- =====================================================
-- Display all tables
-- =====================================================
SHOW TABLES;

-- =====================================================
-- End of Schema
-- =====================================================
