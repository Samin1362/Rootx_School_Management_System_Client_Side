import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import { FaArrowLeft, FaEnvelope, FaPhone, FaIdBadge, FaCalendarAlt, FaBookOpen } from "react-icons/fa";

const TeacherDetails = () => {
  const { teacherId } = useParams();
  const axiosSecure = useAxiosSecure();
  const { error: showError } = useNotification();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await axiosSecure.get(`/teachers/${teacherId}`);
        if (res.data.success) {
          setTeacher(res.data.data);
        }
      } catch (err) {
        showError("Failed to load teacher details");
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [teacherId]);

  if (loading) return <Loader />;

  if (!teacher) {
    return (
      <div className="text-center py-16">
        <p className="text-base-content/60">Teacher not found</p>
        <Link to="/dashboard/teachers" className="btn btn-primary btn-sm mt-4">Back to Teachers</Link>
      </div>
    );
  }

  const defaultImg = "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

  return (
    <div className="space-y-6">
      <Link to="/dashboard/teachers" className="btn btn-ghost btn-sm gap-2 text-base-content/60">
        <FaArrowLeft /> Back to Teachers
      </Link>

      {/* Profile Card */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                  <img
                    src={teacher.user?.photoURL || defaultImg}
                    alt={teacher.user?.name}
                    onError={(e) => { e.target.src = defaultImg; }}
                  />
                </div>
              </div>
              <span className={`badge ${
                teacher.status === "active" ? "badge-success" :
                teacher.status === "on_leave" ? "badge-warning" : "badge-error"
              }`}>
                {teacher.status}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-base-content">{teacher.user?.name || "Unknown"}</h1>
                <p className="text-base-content/60 text-sm">{teacher.qualification || "Teacher"}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <FaEnvelope className="text-secondary text-xs" />
                  <span className="text-base-content/70">{teacher.user?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaPhone className="text-secondary text-xs" />
                  <span className="text-base-content/70">{teacher.user?.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaIdBadge className="text-secondary text-xs" />
                  <span className="text-base-content/70">ID: {teacher.employeeId || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaCalendarAlt className="text-secondary text-xs" />
                  <span className="text-base-content/70">
                    Joined: {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                {teacher.specialization && (
                  <div className="flex items-center gap-2 text-sm">
                    <FaBookOpen className="text-secondary text-xs" />
                    <span className="text-base-content/70">{teacher.specialization}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Classes & Subjects */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-base text-base-content/80">Assigned Classes & Subjects</h2>
          {teacher.assignedSubjects && teacher.assignedSubjects.length > 0 ? (
            <div className="overflow-x-auto mt-2">
              <table className="table table-sm">
                <thead>
                  <tr className="bg-base-200/50">
                    <th>Subject</th>
                    <th>Code</th>
                    <th>Class</th>
                    <th>Type</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {teacher.assignedSubjects.map((sub) => (
                    <tr key={sub._id} className="hover:bg-base-200/30">
                      <td className="font-medium text-base-content">{sub.name}</td>
                      <td><span className="badge badge-ghost badge-xs">{sub.subjectCode || "—"}</span></td>
                      <td>{sub.className || "—"}</td>
                      <td>
                        <span className={`badge badge-xs ${sub.type === "mandatory" ? "badge-primary" : "badge-secondary"}`}>
                          {sub.type}
                        </span>
                      </td>
                      <td className="text-sm text-base-content/60">{sub.fullMarks}/{sub.passMarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-base-content/40 mt-2">No subjects assigned yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;
