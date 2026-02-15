import { useState, useEffect } from "react";
import { Link } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import {
  FaPlus,
  FaEye,
  FaTrash,
  FaUserGraduate,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

const Students = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit functionality
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    classId: "",
    sectionId: "",
    status: "",
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filters
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Dropdown data
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosSecure.get("/classes");
        if (res.data.success) {
          setClasses(res.data.data);
        }
      } catch {
        // Silently fail - classes dropdown just won't populate
      }
    };
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sections when classId changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!classId) {
        setSections([]);
        return;
      }
      try {
        const res = await axiosSecure.get("/sections", {
          params: { classId },
        });
        if (res.data.success) {
          setSections(res.data.data);
        }
      } catch {
        setSections([]);
      }
    };
    fetchSections();
    setSectionId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (classId) params.classId = classId;
      if (sectionId) params.sectionId = sectionId;
      if (status) params.status = status;
      if (search) params.search = search;

      const res = await axiosSecure.get("/students", { params });
      if (res.data.success) {
        setStudents(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showError("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, classId, sectionId, status, search]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [classId, sectionId, status, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axiosSecure.delete(`/students/${deleteTarget._id}`);
      success("Student deleted successfully");
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete student");
    } finally {
      setDeleteLoading(false);
    }
  };

  const startEdit = (student) => {
    setEditingStudentId(student._id);
    setEditForm({
      name: student.user?.name || "",
      email: student.user?.email || "",
      classId: student.classId || "",
      sectionId: student.sectionId || "",
      status: student.status || "active",
    });
  };

  const cancelEdit = () => {
    setEditingStudentId(null);
    setEditForm({
      name: "",
      email: "",
      classId: "",
      sectionId: "",
      status: "",
    });
  };

  const saveEdit = async () => {
    if (!editingStudentId) return;
    setSaveLoading(true);
    try {
      await axiosSecure.patch(`/students/${editingStudentId}`, editForm);
      success("Student updated successfully");
      cancelEdit();
      fetchStudents();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update student");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading && students.length === 0) return <Loader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Animated gradient background blob */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30 animation-delay-2000" />

      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0xMiAxMmMwLTYuNjI3IDUuMzczLTEyIDEyLTEyczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyem0wIDI0YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow">
              <FaUserGraduate className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Students Management
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium animate-pulse">
                  <FaChartLine className="text-xs" />
                  {pagination.total || 0}
                </span>
              </h1>
              <p className="text-white/80 text-sm mt-2">
                Manage and track all students enrolled in your organization
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/students/add"
            className="btn btn-sm gap-2 bg-white text-primary hover:bg-white/90 border-none shadow-lg hover:scale-105 transition-all duration-300"
          >
            <FaPlus /> Add Student
          </Link>
        </div>
      </div>

      {/* Filters Bar with glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl bg-base-100/80 backdrop-blur-xl border border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 p-6">
          <div className="flex items-center gap-3 text-base-content">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
              <FaFilter className="text-primary" />
            </div>
            <span className="font-semibold text-lg">Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Class Filter */}
            <select
              className="select select-bordered select-sm bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary transition-all duration-300 hover:scale-105"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>

            {/* Section Filter */}
            <select
              className="select select-bordered select-sm bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-105"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              disabled={!classId}
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>
                  {sec.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="select select-bordered select-sm bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-105"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative group">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-all text-xs" />
              <input
                type="text"
                className="input input-bordered input-sm pl-9 w-56 bg-base-100/50 backdrop-blur-sm border-info/30 focus:border-info transition-all duration-300 hover:scale-105"
                placeholder="Search by name, email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-ghost btn-sm hover:bg-primary/10 transition-all duration-300 hover:scale-105"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Students Table */}
      {students.length === 0 && !loading ? (
        <EmptyState
          icon={FaUserGraduate}
          title="No students found"
          message="No students match the current filters. Try adjusting your filters or add a new student."
        />
      ) : (
        <>
          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden md:block relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 shadow-xl">
            {/* Animated gradient border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x" />

            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead className="bg-gradient-to-r from-base-200 to-base-300/50">
                  <tr className="text-base-content">
                    <th className="font-bold text-sm">Avatar</th>
                    <th className="font-bold text-sm">Roll No.</th>
                    <th className="font-bold text-sm">Name</th>
                    <th className="font-bold text-sm">Email</th>
                    <th className="font-bold text-sm">Class</th>
                    <th className="font-bold text-sm">Section</th>
                    <th className="font-bold text-sm">Status</th>
                    <th className="font-bold text-sm text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student._id}
                      className="group hover:bg-gradient-to-r hover:from-primary/5 hover:via-secondary/5 hover:to-accent/5 transition-all duration-300 animate-in slide-in-from-bottom"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Avatar */}
                      <td>
                        <div className="relative avatar">
                          <div className="w-10 h-10 rounded-full ring-2 ring-primary/50 ring-offset-1 ring-offset-base-100 group-hover:ring-primary transition-all duration-300">
                            {student.user?.photoURL ? (
                              <img
                                src={student.user.photoURL}
                                alt={student.user?.name || "Student"}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <FaUserGraduate className="text-sm text-primary" />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Roll Number */}
                      <td>
                        <span className="px-2 py-1 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-bold text-xs rounded-full">
                          #{student.rollNumber || "—"}
                        </span>
                      </td>

                      {/* Name - Editable */}
                      <td>
                        {editingStudentId === student._id ? (
                          <input
                            type="text"
                            className="input input-bordered input-xs w-full max-w-xs bg-base-100 focus:border-primary transition-all"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        ) : (
                          <span className="font-medium text-base-content group-hover:text-primary transition-colors">
                            {student.user?.name || "—"}
                          </span>
                        )}
                      </td>

                      {/* Email - Editable */}
                      <td>
                        {editingStudentId === student._id ? (
                          <input
                            type="email"
                            className="input input-bordered input-xs w-full max-w-xs bg-base-100 focus:border-secondary transition-all"
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm({ ...editForm, email: e.target.value })
                            }
                          />
                        ) : (
                          <span className="text-sm text-base-content/70">
                            {student.user?.email || "—"}
                          </span>
                        )}
                      </td>

                      {/* Class - Editable */}
                      <td>
                        {editingStudentId === student._id ? (
                          <select
                            className="select select-bordered select-xs w-full max-w-xs bg-base-100 focus:border-primary transition-all"
                            value={editForm.classId}
                            onChange={(e) => {
                              setEditForm({ ...editForm, classId: e.target.value, sectionId: "" });
                            }}
                          >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                              <option key={cls._id} value={cls._id}>
                                {cls.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="badge badge-sm bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            {student.className || "—"}
                          </span>
                        )}
                      </td>

                      {/* Section - Editable */}
                      <td>
                        {editingStudentId === student._id ? (
                          <select
                            className="select select-bordered select-xs w-full max-w-xs bg-base-100 focus:border-secondary transition-all"
                            value={editForm.sectionId}
                            onChange={(e) =>
                              setEditForm({ ...editForm, sectionId: e.target.value })
                            }
                            disabled={!editForm.classId}
                          >
                            <option value="">Select Section</option>
                            {sections
                              .filter((sec) => sec.classId === editForm.classId)
                              .map((sec) => (
                                <option key={sec._id} value={sec._id}>
                                  {sec.name}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <span className="badge badge-sm bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary border-secondary/30">
                            {student.sectionName || "—"}
                          </span>
                        )}
                      </td>

                      {/* Status - Editable */}
                      <td>
                        {editingStudentId === student._id ? (
                          <select
                            className="select select-bordered select-xs w-full max-w-xs bg-base-100 focus:border-accent transition-all"
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({ ...editForm, status: e.target.value })
                            }
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="graduated">Graduated</option>
                            <option value="transferred">Transferred</option>
                          </select>
                        ) : (
                          <span
                            className={`badge badge-sm ${
                              student.status === "active"
                                ? "bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30"
                                : student.status === "graduated"
                                ? "bg-gradient-to-r from-info/20 to-info/10 text-info border-info/30"
                                : student.status === "transferred"
                                ? "bg-gradient-to-r from-warning/20 to-warning/10 text-warning border-warning/30"
                                : "bg-gradient-to-r from-error/20 to-error/10 text-error border-error/30"
                            }`}
                          >
                            {student.status || "active"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          {editingStudentId === student._id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                disabled={saveLoading}
                                className="btn btn-xs bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30 hover:from-success hover:to-success/80 hover:text-white transition-all duration-300 hover:scale-110"
                              >
                                {saveLoading ? (
                                  <span className="loading loading-spinner loading-xs" />
                                ) : (
                                  <FaSave />
                                )}
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={saveLoading}
                                className="btn btn-xs bg-gradient-to-r from-error/20 to-error/10 text-error border-error/30 hover:from-error hover:to-error/80 hover:text-white transition-all duration-300 hover:scale-110"
                              >
                                <FaTimes />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(student)}
                                className="btn btn-xs bg-gradient-to-r from-warning/20 to-warning/10 text-warning border-warning/30 hover:from-warning hover:to-warning/80 hover:text-white transition-all duration-300 hover:scale-110"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <Link
                                to={`/dashboard/students/${student._id}`}
                                className="btn btn-xs bg-gradient-to-r from-info/20 to-info/10 text-info border-info/30 hover:from-info hover:to-info/80 hover:text-white transition-all duration-300 hover:scale-110"
                                title="View Details"
                              >
                                <FaEye />
                              </Link>
                              <button
                                onClick={() => setDeleteTarget(student)}
                                className="btn btn-xs bg-gradient-to-r from-error/20 to-error/10 text-error border-error/30 hover:from-error hover:to-error/80 hover:text-white transition-all duration-300 hover:scale-110"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Accordion View - Hidden on Desktop */}
          <div className="md:hidden space-y-3">
            {students.map((student, index) => (
              <div
                key={student._id}
                className="collapse collapse-arrow bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <input type="checkbox" className="peer" />

                {/* Collapsed Header */}
                <div className="collapse-title">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full ring-2 ring-primary/50 ring-offset-1 ring-offset-base-100">
                        {student.user?.photoURL ? (
                          <img
                            src={student.user.photoURL}
                            alt={student.user?.name || "Student"}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <FaUserGraduate className="text-lg text-primary" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base-content truncate">
                        {student.user?.name || "—"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-bold text-xs rounded-full">
                          #{student.rollNumber || "—"}
                        </span>
                        <span
                          className={`badge badge-xs ${
                            student.status === "active"
                              ? "bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30"
                              : student.status === "graduated"
                              ? "bg-gradient-to-r from-info/20 to-info/10 text-info border-info/30"
                              : student.status === "transferred"
                              ? "bg-gradient-to-r from-warning/20 to-warning/10 text-warning border-warning/30"
                              : "bg-gradient-to-r from-error/20 to-error/10 text-error border-error/30"
                          }`}
                        >
                          {student.status || "active"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <div className="collapse-content">
                  <div className="space-y-4 pt-4 border-t border-base-300/50">
                    {editingStudentId === student._id ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <div className="form-control">
                          <label className="label label-text-alt font-semibold">Name</label>
                          <input
                            type="text"
                            className="input input-bordered input-sm w-full bg-base-100 focus:border-primary"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        </div>

                        <div className="form-control">
                          <label className="label label-text-alt font-semibold">Email</label>
                          <input
                            type="email"
                            className="input input-bordered input-sm w-full bg-base-100 focus:border-secondary"
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm({ ...editForm, email: e.target.value })
                            }
                          />
                        </div>

                        <div className="form-control">
                          <label className="label label-text-alt font-semibold">Class</label>
                          <select
                            className="select select-bordered select-sm w-full bg-base-100 focus:border-primary"
                            value={editForm.classId}
                            onChange={(e) => {
                              setEditForm({ ...editForm, classId: e.target.value, sectionId: "" });
                            }}
                          >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                              <option key={cls._id} value={cls._id}>
                                {cls.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-control">
                          <label className="label label-text-alt font-semibold">Section</label>
                          <select
                            className="select select-bordered select-sm w-full bg-base-100 focus:border-secondary"
                            value={editForm.sectionId}
                            onChange={(e) =>
                              setEditForm({ ...editForm, sectionId: e.target.value })
                            }
                            disabled={!editForm.classId}
                          >
                            <option value="">Select Section</option>
                            {sections
                              .filter((sec) => sec.classId === editForm.classId)
                              .map((sec) => (
                                <option key={sec._id} value={sec._id}>
                                  {sec.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="form-control">
                          <label className="label label-text-alt font-semibold">Status</label>
                          <select
                            className="select select-bordered select-sm w-full bg-base-100 focus:border-accent"
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({ ...editForm, status: e.target.value })
                            }
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="graduated">Graduated</option>
                            <option value="transferred">Transferred</option>
                          </select>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={saveEdit}
                            disabled={saveLoading}
                            className="btn btn-sm flex-1 bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30 hover:from-success hover:to-success/80 hover:text-white"
                          >
                            {saveLoading ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <>
                                <FaSave /> Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saveLoading}
                            className="btn btn-sm flex-1 bg-gradient-to-r from-error/20 to-error/10 text-error border-error/30 hover:from-error hover:to-error/80 hover:text-white"
                          >
                            <FaTimes /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-base-content/60 text-xs font-semibold mb-1">Email</p>
                            <p className="text-base-content truncate">{student.user?.email || "—"}</p>
                          </div>
                          <div>
                            <p className="text-base-content/60 text-xs font-semibold mb-1">Roll No.</p>
                            <p className="text-base-content">#{student.rollNumber || "—"}</p>
                          </div>
                          <div>
                            <p className="text-base-content/60 text-xs font-semibold mb-1">Class</p>
                            <span className="badge badge-sm bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30">
                              {student.className || "—"}
                            </span>
                          </div>
                          <div>
                            <p className="text-base-content/60 text-xs font-semibold mb-1">Section</p>
                            <span className="badge badge-sm bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary border-secondary/30">
                              {student.sectionName || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-base-300/50">
                          <button
                            onClick={() => startEdit(student)}
                            className="btn btn-sm flex-1 bg-gradient-to-r from-warning/20 to-warning/10 text-warning border-warning/30 hover:from-warning hover:to-warning/80 hover:text-white"
                          >
                            <FaEdit /> Edit
                          </button>
                          <Link
                            to={`/dashboard/students/${student._id}`}
                            className="btn btn-sm flex-1 bg-gradient-to-r from-info/20 to-info/10 text-info border-info/30 hover:from-info hover:to-info/80 hover:text-white"
                          >
                            <FaEye /> View
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(student)}
                            className="btn btn-sm flex-1 bg-gradient-to-r from-error/20 to-error/10 text-error border-error/30 hover:from-error hover:to-error/80 hover:text-white"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination with gradient */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 shadow-lg">
              <p className="text-sm text-base-content/60 font-medium">
                Showing{" "}
                <span className="text-primary font-bold">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="text-primary font-bold">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                of{" "}
                <span className="text-primary font-bold">
                  {pagination.total}
                </span>{" "}
                students
              </p>
              <div className="join shadow-lg">
                <button
                  className="join-item btn btn-sm hover:scale-105 transition-all duration-300"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === pagination.pages ||
                      Math.abs(p - page) <= 1
                    );
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push(
                        <button
                          key={`ellipsis-${p}`}
                          className="join-item btn btn-sm btn-disabled"
                        >
                          ...
                        </button>
                      );
                    }
                    acc.push(
                      <button
                        key={p}
                        className={`join-item btn btn-sm transition-all duration-300 hover:scale-105 ${
                          p === page
                            ? "bg-gradient-to-r from-primary to-secondary text-white border-none"
                            : ""
                        }`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                    return acc;
                  }, [])}
                <button
                  className="join-item btn btn-sm hover:scale-105 transition-all duration-300"
                  disabled={page >= pagination.pages}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.pages, p + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading overlay with gradient spinner */}
      {loading && students.length > 0 && (
        <div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-40 animate-in fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full animate-spin blur-xl opacity-50" />
            <span className="loading loading-spinner loading-lg text-primary relative z-10" />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Student?"
        message={`Are you sure you want to delete "${
          deleteTarget?.user?.name || "this student"
        }"? This action will soft-delete the student record.`}
        confirmText="Delete"
        loading={deleteLoading}
        variant="danger"
      />

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Students;
