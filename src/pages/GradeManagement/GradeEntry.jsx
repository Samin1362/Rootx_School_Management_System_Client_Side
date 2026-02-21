import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaPencilAlt,
  FaSave,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

const GradeEntry = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  // Teacher's own profile (needed to filter subjects by teacher)
  const [teacherDoc, setTeacherDoc] = useState(null);

  // Dropdown data
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  // Selections
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Grade entry state
  const [grades, setGrades] = useState({});
  const [remarks, setRemarks] = useState({});
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [subjectDoc, setSubjectDoc] = useState(null);

  // Loading / action states
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingCascade, setLoadingCascade] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Derived: the exam object and its linked class
  const examDoc = exams.find((e) => e._id === selectedExam) || null;
  const derivedClassId = examDoc ? String(examDoc.classId) : "";
  const derivedClassName = examDoc?.className || "";

  // ── INIT: fetch teacher profile + exams ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [teacherRes, examsRes] = await Promise.all([
          axiosSecure.get("/teachers/me"),
          axiosSecure.get("/exams"),
        ]);
        if (teacherRes.data.success) setTeacherDoc(teacherRes.data.data);
        if (examsRes.data.success) setExams(examsRes.data.data);
      } catch {
        showError("Failed to load initial data");
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, []);

  // ── CASCADE: exam → sections + subjects ──────────────────────────────
  useEffect(() => {
    setSelectedSection("");
    setSelectedSubject("");
    setSections([]);
    setSubjects([]);
    setStudents([]);
    setGrades({});
    setRemarks({});
    setExistingSubmission(null);

    if (!selectedExam || !derivedClassId || !teacherDoc) return;

    const fetchCascade = async () => {
      setLoadingCascade(true);
      try {
        const [sectionsRes, subjectsRes] = await Promise.all([
          axiosSecure.get(`/sections?classId=${derivedClassId}`),
          axiosSecure.get(
            `/subjects?classId=${derivedClassId}&teacherId=${teacherDoc._id}`
          ),
        ]);
        if (sectionsRes.data.success) setSections(sectionsRes.data.data);
        if (subjectsRes.data.success) setSubjects(subjectsRes.data.data);
      } catch {
        showError("Failed to load class data");
      } finally {
        setLoadingCascade(false);
      }
    };
    fetchCascade();
  }, [selectedExam, derivedClassId, teacherDoc]);

  // ── CASCADE: section + subject → students + existing submission ───────
  useEffect(() => {
    setStudents([]);
    setGrades({});
    setRemarks({});
    setExistingSubmission(null);

    if (!selectedExam || !derivedClassId || !selectedSection || !selectedSubject) return;

    const subDoc = subjects.find((s) => s._id === selectedSubject) || null;
    setSubjectDoc(subDoc);

    const fetchStudentsAndSubmission = async () => {
      setLoadingStudents(true);
      try {
        const [studentsRes, submissionsRes] = await Promise.all([
          axiosSecure.get(
            `/students?classId=${derivedClassId}&sectionId=${selectedSection}&status=active&limit=200`
          ),
          axiosSecure.get(
            `/grade-submissions?examId=${selectedExam}&classId=${derivedClassId}&sectionId=${selectedSection}&subjectId=${selectedSubject}&limit=1`
          ),
        ]);

        const studentList = studentsRes.data.success
          ? studentsRes.data.data
          : [];
        setStudents(studentList);

        const submissions = submissionsRes.data.success
          ? submissionsRes.data.data
          : [];

        if (submissions.length > 0) {
          const existing = submissions[0];
          setExistingSubmission(existing);
          const gradeMap = {};
          const remarkMap = {};
          existing.grades.forEach((g) => {
            gradeMap[String(g.studentId)] =
              g.marks !== null && g.marks !== undefined ? String(g.marks) : "";
            remarkMap[String(g.studentId)] = g.remarks || "";
          });
          setGrades(gradeMap);
          setRemarks(remarkMap);
        } else {
          // Pre-fill empty entries for all students
          const defaults = {};
          const defaultRemarks = {};
          studentList.forEach((s) => {
            defaults[String(s._id)] = "";
            defaultRemarks[String(s._id)] = "";
          });
          setGrades(defaults);
          setRemarks(defaultRemarks);
        }
      } catch {
        showError("Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudentsAndSubmission();
  }, [selectedExam, derivedClassId, selectedSection, selectedSubject, subjects]);

  // ── HELPERS ───────────────────────────────────────────────────────────
  const calcGrade = (marks, fullMarks) => {
    if (marks === null || marks === undefined || marks === "") return "-";
    const pct = (Number(marks) / fullMarks) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "A-";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    if (pct >= 40) return "D";
    return "F";
  };

  const gradeColor = (g) => {
    if (g === "-") return "badge-ghost";
    if (g === "F") return "badge-error";
    if (g === "D" || g === "C") return "badge-warning";
    return "badge-success";
  };

  const buildPayload = () => {
    const fullMarks = subjectDoc?.fullMarks || 100;
    return Object.entries(grades).map(([studentId, marks]) => ({
      studentId,
      marks: marks !== "" ? Number(marks) : null,
      remarks: remarks[studentId] || "",
    }));
  };

  // ── SAVE (create draft or update draft) ───────────────────────────────
  const handleSave = async () => {
    const fullMarks = subjectDoc?.fullMarks || 100;
    const entries = buildPayload();

    for (const g of entries) {
      if (g.marks !== null && (g.marks < 0 || g.marks > fullMarks)) {
        showError(`Marks must be between 0 and ${fullMarks}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (existingSubmission) {
        if (existingSubmission.status !== "draft") {
          showError(
            `Cannot edit: submission is already '${existingSubmission.status}'`
          );
          return;
        }
        const res = await axiosSecure.patch(
          `/grade-submissions/${existingSubmission._id}`,
          { grades: entries }
        );
        if (res.data.success) {
          success("Grades saved successfully");
          setExistingSubmission(res.data.data);
        }
      } else {
        const res = await axiosSecure.post("/grade-submissions", {
          examId: selectedExam,
          classId: derivedClassId,
          sectionId: selectedSection,
          subjectId: selectedSubject,
          grades: entries,
        });
        if (res.data.success) {
          success("Grade draft created");
          setExistingSubmission(res.data.data);
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save grades");
    } finally {
      setSubmitting(false);
    }
  };

  // ── SUBMIT FOR REVIEW ─────────────────────────────────────────────────
  const handleSubmitForReview = async () => {
    if (!existingSubmission || existingSubmission.status !== "draft") return;

    setSubmittingReview(true);
    try {
      const res = await axiosSecure.post(
        `/grade-submissions/${existingSubmission._id}/submit`
      );
      if (res.data.success) {
        success("Submitted for review successfully");
        setExistingSubmission((prev) => ({ ...prev, status: "submitted" }));
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to submit for review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────
  if (loadingInit) return <Loader />;

  const fullMarks = subjectDoc?.fullMarks || 100;
  const isEditable =
    !existingSubmission || existingSubmission.status === "draft";
  const allSelected =
    selectedExam && selectedSection && selectedSubject;

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaPencilAlt className="text-primary" />
          Grade Entry
        </h1>
        <p className="text-base-content/60 text-sm mt-1">
          Select an exam and subject to enter student marks
        </p>
      </div>

      {/* Selection Panel */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 space-y-4">
          <h2 className="font-semibold text-base-content/80 text-sm uppercase tracking-wide">
            Select Context
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Exam */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium">Exam *</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
              >
                <option value="">Select Exam</option>
                {exams.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} — {e.className}
                  </option>
                ))}
              </select>
            </div>

            {/* Section (cascades from exam's class) */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium">Section *</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedSubject("");
                }}
                disabled={!selectedExam || loadingCascade}
              >
                <option value="">
                  {!selectedExam
                    ? "Select an exam first"
                    : loadingCascade
                    ? "Loading..."
                    : "Select Section"}
                </option>
                {sections.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject (filtered to teacher's assigned subjects) */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium">Subject *</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedExam || loadingCascade}
              >
                <option value="">
                  {!selectedExam
                    ? "Select an exam first"
                    : loadingCascade
                    ? "Loading..."
                    : subjects.length === 0
                    ? "No subjects assigned"
                    : "Select Subject"}
                </option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.code ? `(${s.code})` : ""} — Full Marks:{" "}
                    {s.fullMarks}
                  </option>
                ))}
              </select>
              {selectedExam && !loadingCascade && subjects.length === 0 && (
                <p className="text-warning text-xs mt-1">
                  You have no subjects assigned for this class.
                </p>
              )}
            </div>
          </div>

          {/* Class info badge (derived from exam) */}
          {examDoc && (
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <FaInfoCircle className="text-info flex-shrink-0" />
              <span>
                Class: <strong className="text-base-content">{derivedClassName}</strong>
                {" · "}Academic Year:{" "}
                <strong className="text-base-content">{examDoc.academicYear}</strong>
                {" · "}Exam Status:{" "}
                <span
                  className={`badge badge-sm ${
                    examDoc.status === "ongoing"
                      ? "badge-success"
                      : examDoc.status === "completed"
                      ? "badge-ghost"
                      : "badge-warning"
                  }`}
                >
                  {examDoc.status}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Submission Status Banner */}
      {existingSubmission && (
        <div
          className={`alert gap-2 ${
            existingSubmission.status === "draft"
              ? "alert-info"
              : existingSubmission.status === "submitted" ||
                existingSubmission.status === "under_review"
              ? "alert-warning"
              : existingSubmission.status === "approved" ||
                existingSubmission.status === "published"
              ? "alert-success"
              : "alert-error"
          }`}
        >
          <FaInfoCircle />
          <div>
            <span>
              Submission status:{" "}
              <strong className="uppercase">{existingSubmission.status}</strong>
            </span>
            {existingSubmission.status !== "draft" && (
              <span className="text-sm block">
                Editing is locked for non-draft submissions.
              </span>
            )}
            {existingSubmission.rejectionReason && (
              <span className="text-sm block mt-1 flex items-center gap-1">
                <FaExclamationTriangle />
                Rejection reason: {existingSubmission.rejectionReason}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      {!allSelected ? (
        <EmptyState
          icon={FaPencilAlt}
          title="Select Exam, Section & Subject"
          message="Choose all three fields above to load the student list for grade entry."
        />
      ) : loadingStudents ? (
        <Loader fullPage={false} message="Loading students..." />
      ) : students.length === 0 ? (
        <EmptyState
          icon={FaPencilAlt}
          title="No Students Found"
          message="No active students found in this class and section."
        />
      ) : (
        <>
          {/* Grade Table */}
          <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className="w-10">#</th>
                    <th>Student</th>
                    <th className="w-20">Roll No</th>
                    <th className="w-36">
                      Marks
                      <span className="text-base-content/50 font-normal">
                        {" "}/ {fullMarks}
                      </span>
                    </th>
                    <th className="w-20">Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const studentId = String(student._id);
                    const rawMarks = grades[studentId];
                    const gradeLabel = calcGrade(rawMarks, fullMarks);

                    return (
                      <tr key={studentId} className="hover">
                        <td className="text-base-content/50">{idx + 1}</td>
                        <td>
                          <div className="font-medium">
                            {student.user?.name ||
                              student.name ||
                              student.admissionNumber}
                          </div>
                          {student.user?.email && (
                            <div className="text-xs text-base-content/40">
                              {student.user.email}
                            </div>
                          )}
                        </td>
                        <td>{student.rollNumber ?? "—"}</td>
                        <td>
                          <input
                            type="number"
                            className={`input input-bordered input-sm w-24 ${
                              rawMarks !== "" &&
                              rawMarks !== undefined &&
                              (Number(rawMarks) < 0 ||
                                Number(rawMarks) > fullMarks)
                                ? "input-error"
                                : ""
                            }`}
                            min="0"
                            max={fullMarks}
                            value={rawMarks ?? ""}
                            placeholder="—"
                            onChange={(e) =>
                              setGrades((prev) => ({
                                ...prev,
                                [studentId]: e.target.value,
                              }))
                            }
                            disabled={!isEditable}
                          />
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm font-semibold ${gradeColor(
                              gradeLabel
                            )}`}
                          >
                            {gradeLabel}
                          </span>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="input input-bordered input-sm w-36"
                            placeholder="Optional"
                            value={remarks[studentId] ?? ""}
                            onChange={(e) =>
                              setRemarks((prev) => ({
                                ...prev,
                                [studentId]: e.target.value,
                              }))
                            }
                            disabled={!isEditable}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-base-content/50">
              {students.length} student{students.length !== 1 ? "s" : ""} ·
              Full marks: {fullMarks}
            </div>

            <div className="flex gap-3">
              {/* Save / Update Draft */}
              {isEditable && (
                <button
                  className="btn btn-primary gap-2"
                  onClick={handleSave}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <FaSave />
                  )}
                  {existingSubmission ? "Update Draft" : "Save Draft"}
                </button>
              )}

              {/* Submit for Review (only when draft saved) */}
              {existingSubmission?.status === "draft" && (
                <button
                  className="btn btn-success gap-2"
                  onClick={handleSubmitForReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <FaPaperPlane />
                  )}
                  Submit for Review
                </button>
              )}

              {/* Published confirmation */}
              {existingSubmission?.status === "published" && (
                <div className="flex items-center gap-2 text-success font-medium">
                  <FaCheckCircle />
                  Results Published
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GradeEntry;
