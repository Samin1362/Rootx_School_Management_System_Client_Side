import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { FaPencilAlt, FaSave } from "react-icons/fa";

const GradeEntry = () => {
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const { success, error: showError } = useNotification();

  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [grades, setGrades] = useState({});
  const [remarks, setRemarks] = useState({});
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [subjectDoc, setSubjectDoc] = useState(null);

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [examsRes, classesRes] = await Promise.all([
          axiosSecure.get("/exams"),
          axiosSecure.get("/classes"),
        ]);
        if (examsRes.data.success) setExams(examsRes.data.data);
        if (classesRes.data.success) setClasses(classesRes.data.data.filter((c) => c.status === "active"));
      } catch {
        showError("Failed to load initial data");
      } finally {
        setLoadingInit(false);
      }
    };
    fetchInit();
  }, []);

  useEffect(() => {
    if (!selectedClass) { setSections([]); setSelectedSection(""); return; }
    const fetchSections = async () => {
      try {
        const res = await axiosSecure.get(`/sections?classId=${selectedClass}`);
        if (res.data.success) setSections(res.data.data);
      } catch { showError("Failed to load sections"); }
    };
    fetchSections();
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass) { setSubjects([]); setSelectedSubject(""); return; }
    const fetchSubjects = async () => {
      try {
        const res = await axiosSecure.get(`/subjects?classId=${selectedClass}`);
        if (res.data.success) setSubjects(res.data.data);
      } catch { showError("Failed to load subjects"); }
    };
    fetchSubjects();
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedExam || !selectedClass || !selectedSection || !selectedSubject) {
      setStudents([]); setGrades({}); setRemarks({}); setExistingSubmission(null);
      return;
    }

    const fetchStudentsAndSubmission = async () => {
      setLoadingStudents(true);
      try {
        const [studentsRes, submissionsRes] = await Promise.all([
          axiosSecure.get(`/students?classId=${selectedClass}&sectionId=${selectedSection}`),
          axiosSecure.get(`/grade-submissions?examId=${selectedExam}&classId=${selectedClass}&sectionId=${selectedSection}&subjectId=${selectedSubject}&limit=1`),
        ]);

        const studentList = studentsRes.data.success
          ? studentsRes.data.data.filter((s) => s.status === "active")
          : [];
        setStudents(studentList);

        // Find subject doc for fullMarks
        const subDoc = subjects.find((s) => s._id === selectedSubject);
        setSubjectDoc(subDoc);

        const submissions = submissionsRes.data.success ? submissionsRes.data.data : [];
        if (submissions.length > 0) {
          const existing = submissions[0];
          setExistingSubmission(existing);
          const gradeMap = {};
          const remarkMap = {};
          existing.grades.forEach((g) => {
            gradeMap[String(g.studentId)] = g.marks !== null && g.marks !== undefined ? String(g.marks) : "";
            remarkMap[String(g.studentId)] = g.remarks || "";
          });
          setGrades(gradeMap);
          setRemarks(remarkMap);
        } else {
          setExistingSubmission(null);
          const defaults = {};
          const defaultRemarks = {};
          studentList.forEach((s) => { defaults[s._id] = ""; defaultRemarks[s._id] = ""; });
          setGrades(defaults);
          setRemarks(defaultRemarks);
        }
      } catch {
        showError("Failed to load data");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudentsAndSubmission();
  }, [selectedExam, selectedClass, selectedSection, selectedSubject]);

  const handleSave = async () => {
    const fullMarks = subjectDoc?.fullMarks || 100;
    const gradeEntries = Object.entries(grades).map(([studentId, marks]) => ({
      studentId,
      marks: marks !== "" ? Number(marks) : null,
      remarks: remarks[studentId] || "",
    }));

    // Validate marks range
    for (const g of gradeEntries) {
      if (g.marks !== null && (g.marks < 0 || g.marks > fullMarks)) {
        showError(`Marks must be between 0 and ${fullMarks}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (existingSubmission) {
        if (existingSubmission.status !== "draft") {
          showError(`Cannot edit: submission status is '${existingSubmission.status}'`);
          return;
        }
        const res = await axiosSecure.patch(`/grade-submissions/${existingSubmission._id}`, { grades: gradeEntries });
        if (res.data.success) {
          success("Grades updated successfully");
          setExistingSubmission(res.data.data);
        }
      } else {
        const res = await axiosSecure.post("/grade-submissions", {
          examId: selectedExam,
          classId: selectedClass,
          sectionId: selectedSection,
          subjectId: selectedSubject,
          grades: gradeEntries,
        });
        if (res.data.success) {
          success("Grade draft created successfully");
          setExistingSubmission(res.data.data);
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save grades");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInit) return <Loader />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Grade Entry</h1>
        <p className="text-base-content/60 text-sm">Enter marks for students</p>
      </div>

      {/* Selection filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select className="select select-bordered select-sm" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
          <option value="">Select Exam</option>
          {exams.map((e) => <option key={e._id} value={e._id}>{e.name} - {e.className}</option>)}
        </select>
        <select className="select select-bordered select-sm" value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); setSelectedSubject(""); }}>
          <option value="">Select Class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="select select-bordered select-sm" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
          <option value="">Select Section</option>
          {sections.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select className="select select-bordered select-sm" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option value="">Select Subject</option>
          {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {existingSubmission && (
        <div className={`alert ${existingSubmission.status === "draft" ? "alert-info" : "alert-warning"}`}>
          <span>
            Existing submission found (Status: <strong>{existingSubmission.status}</strong>)
            {existingSubmission.status !== "draft" && " - Editing is disabled for non-draft submissions."}
            {existingSubmission.rejectionReason && ` | Rejection reason: ${existingSubmission.rejectionReason}`}
          </span>
        </div>
      )}

      {!selectedExam || !selectedClass || !selectedSection || !selectedSubject ? (
        <EmptyState icon={FaPencilAlt} title="Select All Fields" message="Select exam, class, section, and subject to enter grades." />
      ) : loadingStudents ? (
        <Loader />
      ) : students.length === 0 ? (
        <EmptyState icon={FaPencilAlt} title="No Students" message="No active students found in this class and section." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Marks (/{subjectDoc?.fullMarks || 100})</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const marks = grades[student._id];
                  const numMarks = marks !== "" && marks !== undefined ? Number(marks) : null;
                  const fullMarks = subjectDoc?.fullMarks || 100;
                  let gradeLabel = "-";
                  if (numMarks !== null && !isNaN(numMarks)) {
                    const pct = (numMarks / fullMarks) * 100;
                    if (pct >= 90) gradeLabel = "A+";
                    else if (pct >= 80) gradeLabel = "A";
                    else if (pct >= 70) gradeLabel = "A-";
                    else if (pct >= 60) gradeLabel = "B";
                    else if (pct >= 50) gradeLabel = "C";
                    else if (pct >= 40) gradeLabel = "D";
                    else gradeLabel = "F";
                  }
                  const isEditable = !existingSubmission || existingSubmission.status === "draft";

                  return (
                    <tr key={student._id}>
                      <td>{idx + 1}</td>
                      <td>{student.user?.name || student.name || student.admissionNumber}</td>
                      <td>{student.rollNumber}</td>
                      <td>
                        <input
                          type="number"
                          className="input input-bordered input-sm w-20"
                          min="0"
                          max={fullMarks}
                          value={grades[student._id] ?? ""}
                          onChange={(e) => setGrades({ ...grades, [student._id]: e.target.value })}
                          disabled={!isEditable}
                        />
                      </td>
                      <td>
                        <span className={`badge badge-sm ${gradeLabel === "F" ? "badge-error" : gradeLabel === "-" ? "badge-ghost" : "badge-success"}`}>
                          {gradeLabel}
                        </span>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="input input-bordered input-sm w-32"
                          placeholder="Optional"
                          value={remarks[student._id] ?? ""}
                          onChange={(e) => setRemarks({ ...remarks, [student._id]: e.target.value })}
                          disabled={!isEditable}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(!existingSubmission || existingSubmission.status === "draft") && (
            <div className="flex justify-end">
              <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>
                {submitting ? <span className="loading loading-spinner loading-sm" /> : <><FaSave className="mr-1" /> Save Grades</>}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GradeEntry;
