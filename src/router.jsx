import { createBrowserRouter, Navigate } from "react-router";
import App from "./App";
import AuthLayout from "./layouts/AuthLayout";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import SuperAdminDashboardLayout from "./layouts/SuperAdminDashboardLayout";
import Login from "./pages/Auth/Login";
import HomePage from "./pages/Landing/HomePage";
import ContactPage from "./pages/Landing/ContactPage";
import Register from "./pages/Auth/Register";
import OrganizationSignup from "./pages/Organization/OrganizationSignup";
import SubscriptionPlans from "./pages/Subscription/SubscriptionPlans";
import WaitingForOrganization from "./pages/WaitingForOrganization";
import OrganizationSuspended from "./pages/OrganizationSuspended";
import ErrorPage from "./pages/ErrorPage";

// Phase 2 – Dashboard
import Overview from "./pages/Dashboard/Overview";

// Phase 2 – Academic Structure
import Classes from "./pages/AcademicStructure/Classes";
import AddClass from "./pages/AcademicStructure/AddClass";
import Sections from "./pages/AcademicStructure/Sections";
import AddSection from "./pages/AcademicStructure/AddSection";
import Subjects from "./pages/AcademicStructure/Subjects";
import AddSubject from "./pages/AcademicStructure/AddSubject";

// Phase 2 – Student Management
import Students from "./pages/StudentManagement/Students";
import StudentDetails from "./pages/StudentManagement/StudentDetails";
import AddStudent from "./pages/StudentManagement/AddStudent";

// Phase 2 – Teacher Management
import Teachers from "./pages/TeacherManagement/Teachers";
import TeacherDetails from "./pages/TeacherManagement/TeacherDetails";
import AddTeacher from "./pages/TeacherManagement/AddTeacher";

// Phase 2 – User Management & Settings
import UserManagement from "./pages/UserManagement/UserManagement";
import OrganizationSettings from "./pages/Settings/OrganizationSettings";

// Phase 3 – Attendance Management
import MarkAttendance from "./pages/AttendanceManagement/MarkAttendance";
import AttendanceHistory from "./pages/AttendanceManagement/AttendanceHistory";
import AttendanceReports from "./pages/AttendanceManagement/AttendanceReports";

// Phase 4 – Exam Management
import Exams from "./pages/ExamManagement/Exams";
import ExamDetails from "./pages/ExamManagement/ExamDetails";

// Phase 4 – Grade Management
import GradeEntry from "./pages/GradeManagement/GradeEntry";
import MySubmissions from "./pages/GradeManagement/MySubmissions";
import PendingReviews from "./pages/GradeManagement/PendingReviews";
import GradeApproval from "./pages/GradeManagement/GradeApproval";
import SubmissionDetails from "./pages/GradeManagement/SubmissionDetails";

// Phase 4 – Results
import Results from "./pages/Results/Results";
import ReportCard from "./pages/Results/ReportCard";
import MyResults from "./pages/Results/MyResults";

// Phase 4 – Notifications
import Notifications from "./pages/Notifications/Notifications";

// Phase 5 – Fee Management
import FeeStructures from "./pages/FeeManagement/FeeStructures";
import StudentFees from "./pages/FeeManagement/StudentFees";
import CollectPayment from "./pages/FeeManagement/CollectPayment";
import FeeDues from "./pages/FeeManagement/FeeDues";
import FeeReports from "./pages/FeeManagement/FeeReports";
import PaymentReceipt from "./pages/FeeManagement/PaymentReceipt";
import MyFees from "./pages/FeeManagement/MyFees";
import ChildFees from "./pages/FeeManagement/ChildFees";

// Phase 5 – Finance Management
import Expenses from "./pages/FinanceManagement/Expenses";
import AddExpense from "./pages/FinanceManagement/AddExpense";
import Salaries from "./pages/FinanceManagement/Salaries";
import FinanceReports from "./pages/FinanceManagement/FinanceReports";

// Phase 6 – Communication & Reports
import Announcements from "./pages/Announcements/Announcements";
import CreateAnnouncement from "./pages/Announcements/CreateAnnouncement";
import Reports from "./pages/Reports/Reports";
import ActivityLogs from "./pages/ActivityLogs/ActivityLogs";

// Phase 7 – Super Admin Dashboard
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import OrganizationsManagement from "./pages/SuperAdmin/OrganizationsManagement";
import OrganizationDetails from "./pages/SuperAdmin/OrganizationDetails";
import UsersManagement from "./pages/SuperAdmin/UsersManagement";
import UserDetails from "./pages/SuperAdmin/UserDetails";
import SubscriptionsManagement from "./pages/SuperAdmin/SubscriptionsManagement";
import SubscriptionRequests from "./pages/SuperAdmin/SubscriptionRequests";
import ReactivationRequests from "./pages/SuperAdmin/ReactivationRequests";
import PlansManagement from "./pages/SuperAdmin/PlansManagement";
import PlatformSettings from "./pages/SuperAdmin/PlatformSettings";
import PlatformReports from "./pages/SuperAdmin/PlatformReports";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // Public routes — landing page and contact page
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "/contact",
            element: <ContactPage />,
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/register",
            element: <Register />,
          },
        ],
      },
      {
        path: "/signup",
        element: <OrganizationSignup />,
      },
      {
        path: "/plans",
        element: <SubscriptionPlans />,
      },
      {
        path: "/waiting-for-organization",
        element: <WaitingForOrganization />,
      },
      {
        path: "/organization-suspended",
        element: <OrganizationSuspended />,
      },
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/overview" replace />,
          },
          {
            path: "overview",
            element: <Overview />,
          },
          // Student Management
          {
            path: "students",
            element: <Students />,
          },
          {
            path: "students/add",
            element: <AddStudent />,
          },
          {
            path: "students/:studentId",
            element: <StudentDetails />,
          },
          // Teacher Management
          {
            path: "teachers",
            element: <Teachers />,
          },
          {
            path: "teachers/add",
            element: <AddTeacher />,
          },
          {
            path: "teachers/:teacherId",
            element: <TeacherDetails />,
          },
          // Academic Structure
          {
            path: "classes",
            element: <Classes />,
          },
          {
            path: "classes/add",
            element: <AddClass />,
          },
          {
            path: "sections",
            element: <Sections />,
          },
          {
            path: "sections/add",
            element: <AddSection />,
          },
          {
            path: "subjects",
            element: <Subjects />,
          },
          {
            path: "subjects/add",
            element: <AddSubject />,
          },
          // Phase 3 – Attendance Management
          {
            path: "attendance/mark",
            element: <MarkAttendance />,
          },
          {
            path: "attendance/history",
            element: <AttendanceHistory />,
          },
          {
            path: "attendance/reports",
            element: <AttendanceReports />,
          },
          // Phase 4 – Exam Management
          {
            path: "exams",
            element: <Exams />,
          },
          {
            path: "exams/:examId",
            element: <ExamDetails />,
          },
          // Phase 4 – Grade Management
          {
            path: "grade-entry",
            element: <GradeEntry />,
          },
          {
            path: "my-submissions",
            element: <MySubmissions />,
          },
          {
            path: "pending-reviews",
            element: <PendingReviews />,
          },
          {
            path: "grade-approval",
            element: <GradeApproval />,
          },
          {
            path: "grade-submissions/:submissionId",
            element: <SubmissionDetails />,
          },
          // Phase 4 – Results
          {
            path: "results",
            element: <Results />,
          },
          {
            path: "my-results",
            element: <MyResults />,
          },
          {
            path: "report-card/:studentId/:examId",
            element: <ReportCard />,
          },
          // Phase 4 – Notifications
          {
            path: "notifications",
            element: <Notifications />,
          },
          // Phase 5 – Fee Management
          {
            path: "fee-structures",
            element: <FeeStructures />,
          },
          {
            path: "student-fees",
            element: <StudentFees />,
          },
          {
            path: "collect-payment",
            element: <CollectPayment />,
          },
          {
            path: "fee-dues",
            element: <FeeDues />,
          },
          {
            path: "fee-reports",
            element: <FeeReports />,
          },
          {
            path: "receipt/:paymentId",
            element: <PaymentReceipt />,
          },
          {
            path: "my-fees",
            element: <MyFees />,
          },
          {
            path: "child-fees",
            element: <ChildFees />,
          },
          // Phase 5 – Finance Management
          {
            path: "expenses",
            element: <Expenses />,
          },
          {
            path: "expenses/add",
            element: <AddExpense />,
          },
          {
            path: "expenses/edit/:expenseId",
            element: <AddExpense />,
          },
          {
            path: "salaries",
            element: <Salaries />,
          },
          {
            path: "finance-reports",
            element: <FinanceReports />,
          },
          // Phase 6 – Announcements
          {
            path: "announcements",
            element: <Announcements />,
          },
          {
            path: "announcements/create",
            element: <CreateAnnouncement />,
          },
          {
            path: "announcements/edit/:announcementId",
            element: <CreateAnnouncement />,
          },
          // Phase 6 – Reports
          {
            path: "reports",
            element: <Reports />,
          },
          // Phase 6 – Activity Logs
          {
            path: "activity-logs",
            element: <ActivityLogs />,
          },
          // User Management & Settings
          {
            path: "users",
            element: <UserManagement />,
          },
          {
            path: "settings",
            element: <OrganizationSettings />,
          },
        ],
      },
      // Super Admin Dashboard with separate layout
      {
        path: "/dashboard/super-admin",
        element: <SuperAdminDashboardLayout />,
        children: [
          {
            index: true,
            element: <SuperAdminDashboard />,
          },
          {
            path: "organizations",
            element: <OrganizationsManagement />,
          },
          {
            path: "organizations/:id",
            element: <OrganizationDetails />,
          },
          {
            path: "users",
            element: <UsersManagement />,
          },
          {
            path: "users/:id",
            element: <UserDetails />,
          },
          {
            path: "subscriptions",
            element: <SubscriptionsManagement />,
          },
          {
            path: "subscription-requests",
            element: <SubscriptionRequests />,
          },
          {
            path: "reactivation-requests",
            element: <ReactivationRequests />,
          },
          {
            path: "plans",
            element: <PlansManagement />,
          },
          {
            path: "settings",
            element: <PlatformSettings />,
          },
          {
            path: "reports",
            element: <PlatformReports />,
          },
        ],
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  }
]);

export default router;
