import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import { FaArrowLeft, FaUserGraduate, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaTint } from "react-icons/fa";

const StudentDetails = () => {
  const { studentId } = useParams();
  const axiosSecure = useAxiosSecure();
  const { error: showError } = useNotification();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axiosSecure.get(`/students/${studentId}`);
        if (res.data.success) {
          setStudent(res.data.data);
        }
      } catch (err) {
        showError("Failed to load student details", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  if (loading) return <Loader />;

  if (!student) {
    return (
      <div className="text-center py-16">
        <p className="text-base-content/60">Student not found</p>
        <Link to="/dashboard/students" className="btn btn-primary btn-sm mt-4">Back to Students</Link>
      </div>
    );
  }

  const defaultImg = "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

  const statusColors = {
    active: "badge-success",
    transferred: "badge-warning",
    graduated: "badge-info",
    dropped: "badge-error",
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/dashboard/students" className="btn btn-ghost btn-sm gap-2 text-base-content/60">
        <FaArrowLeft /> Back to Students
      </Link>

      {/* Profile Card */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={student.user?.photoURL || defaultImg}
                    alt={student.user?.name}
                    onError={(e) => { e.target.src = defaultImg; }}
                  />
                </div>
              </div>
              <span className={`badge ${statusColors[student.status] || "badge-ghost"}`}>
                {student.status}
              </span>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-base-content">{student.user?.name || "Unknown"}</h1>
                <p className="text-base-content/60 text-sm">Admission #{student.admissionNumber}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <FaEnvelope className="text-primary text-xs" />
                  <span className="text-base-content/70">{student.user?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaPhone className="text-primary text-xs" />
                  <span className="text-base-content/70">{student.user?.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaCalendarAlt className="text-primary text-xs" />
                  <span className="text-base-content/70">
                    DOB: {student.dob ? new Date(student.dob).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaUserGraduate className="text-primary text-xs" />
                  <span className="text-base-content/70">Roll #{student.rollNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaTint className="text-primary text-xs" />
                  <span className="text-base-content/70">Blood: {student.bloodGroup || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaMapMarkerAlt className="text-primary text-xs" />
                  <span className="text-base-content/70">{student.address || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic & Parent Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Info */}
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-base text-base-content/80">Academic Information</h2>
            <div className="space-y-3 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Class</span>
                <span className="font-medium text-base-content">{student.className || "—"}</span>
              </div>
              <div className="divider my-0"></div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Section</span>
                <span className="font-medium text-base-content">{student.sectionName || "—"}</span>
              </div>
              <div className="divider my-0"></div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Academic Year</span>
                <span className="font-medium text-base-content">{student.academicYear || "—"}</span>
              </div>
              <div className="divider my-0"></div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Gender</span>
                <span className="font-medium text-base-content capitalize">{student.gender || "—"}</span>
              </div>
              <div className="divider my-0"></div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Admission Date</span>
                <span className="font-medium text-base-content">
                  {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "—"}
                </span>
              </div>
              {student.previousInstitute && (
                <>
                  <div className="divider my-0"></div>
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/50">Previous Institute</span>
                    <span className="font-medium text-base-content">{student.previousInstitute}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Parent Info */}
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-base text-base-content/80">Parent / Guardian</h2>
            {student.parent ? (
              <div className="space-y-3 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/50">Name</span>
                  <span className="font-medium text-base-content">{student.parent.user?.name || "—"}</span>
                </div>
                <div className="divider my-0"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/50">Email</span>
                  <span className="font-medium text-base-content">{student.parent.user?.email || "—"}</span>
                </div>
                <div className="divider my-0"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/50">Phone</span>
                  <span className="font-medium text-base-content">{student.parent.user?.phone || "—"}</span>
                </div>
                <div className="divider my-0"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/50">Relationship</span>
                  <span className="font-medium text-base-content capitalize">{student.parent.relationship || "—"}</span>
                </div>
                <div className="divider my-0"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/50">Occupation</span>
                  <span className="font-medium text-base-content">{student.parent.occupation || "—"}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-base-content/40 mt-2">No parent linked yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
