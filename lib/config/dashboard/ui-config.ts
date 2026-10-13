
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  LifeBuoy,
  Megaphone,
  MessageSquare,
  MonitorPlay,
  Settings,
  ShieldCheck,
  UserCircle,
  UserCog,
  Users,
  User,
  Video,
  type LucideIcon,
} from "lucide-react";
import { DashboardNavItem, DashboardQuickAction, DashboardStat, DashboardUIConfig } from "@/lib/interfaces/ui-config";
import { UserType } from "@/lib/types/users";

/* -------------------------------------------------------------------------- */
/* BRAND CONFIGURATION                                                        */
/* -------------------------------------------------------------------------- */

export const BRAND_CONFIG = {
  name: "Nugi Innovations",
  shortName: "Nugi",
  tagline: "Learn. Build. Innovate.",
  portalName: "Tech Training Platform Portal",
  description:
    "Technology education, practical training, and career development.",

  logo: {
    src: "/ni-logo.svg" ,
    alt: "Nugi Innovations",
  },

  support: {
    label: "Help & Support",
    href: "/support",
  },

  auth: {
    loginPath: "/login",
    forgotPasswordPath: "/forgot-password",
    resetPasswordPath: "/reset-password",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* GLOBAL THEME                                                               */
/* -------------------------------------------------------------------------- */

export const UI_THEME = {
  colors: {
    primary: "#101D49",
    primaryHover: "#172A60",
    primaryLight: "#EAF0FF",

    secondary: "#F5C542",
    secondaryHover: "#E8B72D",
    secondaryLight: "#FFF6D8",

    background: "#F6F8FC",
    surface: "#FFFFFF",
    surfaceMuted: "#F9FAFD",

    text: "#17233F",
    textMuted: "#64718A",

    border: "#E4E9F2",

    success: "#16845B",
    warning: "#B7791F",
    danger: "#C93636",
    info: "#2857A4",
  },

  radius: {
    card: "16px",
    input: "12px",
    button: "12px",
  },

  layout: {
    sidebarWidth: "264px",
    sidebarCollapsedWidth: "80px",
    headerHeight: "72px",
    contentMaxWidth: "1600px",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* ADMIN                                                                      */
/* -------------------------------------------------------------------------- */

const adminConfig: DashboardUIConfig = {
  role: UserType.ADMIN,
  label: "Administration",

  header: {
    title: "Nugi Innovations",
    subtitle: "Platform administration",
  },

  title: "Dashboard Overview",

  description:
    "Manage technology programmes, users, courses, enrolments, and learning operations.",

  dashboardPath: "/dashboard",
  profilePath: "/dashboard/profile",

  stats: [
    {
      key: "users",
      label: "Total Users",
      description: "Registered platform users",
      icon: Users,
    },
    {
      key: "courses",
      label: "Active Courses",
      description: "Published training programmes",
      icon: BookOpen,
    },
    {
      key: "enrollments",
      label: "Enrolments",
      description: "Learners enrolled in programmes",
      icon: GraduationCap,
    },
    {
      key: "completionRate",
      label: "Completion Rate",
      description: "Learner course completion",
      icon: BarChart3,
    },
  ],

  quickActions: [
    {
      key: "create-course",
      title: "Create Course",
      description: "Set up a new training programme.",
      href: "/dashboard/courses/new",
      icon: BookOpen,
    },
    {
      key: "manage-users",
      title: "Manage Users",
      description: "Manage students, tutors, and administrators.",
      href: "/dashboard/users",
      icon: UserCog,
    },
    {
      key: "manage-enrollments",
      title: "Manage Enrolments",
      description: "Review learner registrations.",
      href: "/dashboard/enrollments",
      icon: ClipboardCheck,
    },
    {
      key: "view-reports",
      title: "View Reports",
      description: "Review platform performance.",
      href: "/dashboard/reports",
      icon: BarChart3,
    },
  ],

  navItems: [
    {
      label: "Overview",
      href: "/dashboard",
      description: "Platform summary",
      icon: LayoutDashboard,
      section: "Workspace",
    },
    {
      label: "Users",
      href: "/dashboard/users",
      description: "Admins, tutors, and students",
      icon: Users,
      section: "Management",
      // 💡 Add your drop-down sub-items here
      items: [
        { label: "Admins", href: "/dashboard/users/admins", icon: ShieldCheck },
        { label: "Tutors", href: "/dashboard/users/tutors", icon: GraduationCap },
        { label: "Students", href: "/dashboard/users/students", icon: User },
      ],
    },
    {
      label: "Courses",
      href: "/dashboard/courses",
      description: "Manage training programmes",
      icon: BookOpen,
      section: "Management",
    },
    {
      label: "Curriculum",
      href: "/dashboard/curriculum",
      description: "Tracks, modules, and lessons",
      icon: Library,
      section: "Management",
    },
    {
      label: "Cohorts",
      href: "/dashboard/cohorts",
      description: "Training groups and schedules",
      icon: Users,
      section: "Management",
    },
    {
      label: "Enrolments",
      href: "/dashboard/enrollments",
      description: "Course registrations",
      icon: ClipboardCheck,
      section: "Management",
    },
    {
      label: "Assignments",
      href: "/dashboard/assignments",
      description: "Assignments and assessments",
      icon: CheckSquare,
      section: "Learning",
    },
    {
      label: "Certificates",
      href: "/dashboard/certificates",
      description: "Learner certifications",
      icon: Award,
      section: "Learning",
    },
    {
      label: "Announcements",
      href: "/dashboard/announcements",
      description: "Portal-wide announcements",
      icon: Megaphone,
      section: "Communication",
    },
    {
      label: "Reports",
      href: "/dashboard/reports",
      description: "Learning and operational analytics",
      icon: BarChart3,
      section: "Insights",
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      description: "Platform configuration",
      icon: Settings,
      section: "System",
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      description: "Your account",
      icon: UserCircle,
      section: "System",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* TUTOR                                                                      */
/* -------------------------------------------------------------------------- */

const tutorConfig: DashboardUIConfig = {
  role: UserType.TUTOR,
  label: "Teaching Workspace",

  header: {
    title: "Nugi Innovations",
    subtitle: "Teaching and course delivery",
  },

  title: "Teaching Overview",

  description:
    "Manage your assigned courses, support your students, and track learning progress.",

  dashboardPath: "/tutor/dashboard",
  profilePath: "/tutor/profile",

  stats: [
    {
      key: "courses",
      label: "My Courses",
      description: "Courses assigned to you",
      icon: BookOpen,
    },
    {
      key: "students",
      label: "My Students",
      description: "Students in your courses",
      icon: GraduationCap,
    },
    {
      key: "pendingSubmissions",
      label: "Pending Reviews",
      description: "Submissions awaiting feedback",
      icon: ClipboardCheck,
    },
    {
      key: "upcomingSessions",
      label: "Upcoming Sessions",
      description: "Scheduled teaching sessions",
      icon: CalendarDays,
    },
  ],

  quickActions: [
    {
      key: "my-courses",
      title: "Open My Courses",
      description: "Review your assigned courses and materials.",
      href: "/tutor/courses",
      icon: BookOpen,
    },
    {
      key: "create-assignment",
      title: "Create Assignment",
      description: "Prepare work for your students.",
      href: "/tutor/assignments/new",
      icon: CheckSquare,
    },
    {
      key: "review-submissions",
      title: "Review Submissions",
      description: "Give feedback and grade submitted work.",
      href: "/tutor/submissions",
      icon: ClipboardCheck,
    },
    {
      key: "schedule",
      title: "View Schedule",
      description: "Check upcoming teaching sessions.",
      href: "/tutor/schedule",
      icon: CalendarDays,
    },
  ],

  navItems: [
    {
      label: "Dashboard",
      href: "/tutor/dashboard",
      description: "Teaching overview",
      icon: LayoutDashboard,
      section: "Workspace",
    },
    {
      label: "My Courses",
      href: "/tutor/courses",
      description: "Assigned courses",
      icon: BookOpen,
      section: "Teaching",
    },
    {
      label: "Lessons",
      href: "/tutor/lessons",
      description: "Learning content and lessons",
      icon: MonitorPlay,
      section: "Teaching",
    },
    {
      label: "Learning Materials",
      href: "/tutor/materials",
      description: "Course resources",
      icon: FolderOpen,
      section: "Teaching",
    },
    {
      label: "Assignments",
      href: "/tutor/assignments",
      description: "Create and manage assignments",
      icon: CheckSquare,
      section: "Assessment",
    },
    {
      label: "Submissions",
      href: "/tutor/submissions",
      description: "Review student submissions",
      icon: ClipboardCheck,
      section: "Assessment",
    },
    {
      label: "My Students",
      href: "/tutor/students",
      description: "Students in assigned courses",
      icon: Users,
      section: "Learning",
    },
    {
      label: "Schedule",
      href: "/tutor/schedule",
      description: "Teaching timetable",
      icon: CalendarDays,
      section: "Learning",
    },
    {
      label: "Announcements",
      href: "/tutor/announcements",
      description: "Course communications",
      icon: Megaphone,
      section: "Communication",
    },
    {
      label: "Profile",
      href: "/tutor/profile",
      description: "Your teaching profile",
      icon: UserCircle,
      section: "Account",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* STUDENT                                                                    */
/* -------------------------------------------------------------------------- */

const studentConfig: DashboardUIConfig = {
  role: UserType.STUDENT,
  label: "Student Learning Portal",

  header: {
    title: "Nugi Innovations",
    subtitle: "Your learning journey",
  },

  title: "My Learning Dashboard",

  description:
    "Continue learning, complete assignments, follow your schedule, and track your progress.",

  dashboardPath: "/student/dashboard",
  profilePath: "/student/profile",

  stats: [
    {
      key: "enrolledCourses",
      label: "My Courses",
      description: "Courses you are enrolled in",
      icon: BookOpen,
    },
    {
      key: "completedLessons",
      label: "Lessons Completed",
      description: "Lessons completed so far",
      icon: CheckSquare,
    },
    {
      key: "pendingAssignments",
      label: "Pending Assignments",
      description: "Work awaiting submission",
      icon: ClipboardCheck,
    },
    {
      key: "learningProgress",
      label: "Learning Progress",
      description: "Your overall learning progress",
      icon: Activity,
    },
  ],

  quickActions: [
    {
      key: "continue-learning",
      title: "Continue Learning",
      description: "Return to your enrolled courses.",
      href: "/student/courses",
      icon: MonitorPlay,
    },
    {
      key: "assignments",
      title: "My Assignments",
      description: "Review deadlines and submit your work.",
      href: "/student/assignments",
      icon: ClipboardCheck,
    },
    {
      key: "schedule",
      title: "My Schedule",
      description: "Check upcoming classes and sessions.",
      href: "/student/schedule",
      icon: CalendarDays,
    },
    {
      key: "certificates",
      title: "My Certificates",
      description: "View certificates you have earned.",
      href: "/student/certificates",
      icon: Award,
    },
  ],

  navItems: [
    {
      label: "Dashboard",
      href: "/student/dashboard",
      description: "Your learning overview",
      icon: LayoutDashboard,
      section: "Workspace",
    },
    {
      label: "My Courses",
      href: "/student/courses",
      description: "Enrolled courses",
      icon: BookOpen,
      section: "Learning",
    },
    {
      label: "Course Catalogue",
      href: "/courses",
      description: "Explore available programmes",
      icon: Library,
      section: "Learning",
    },
    {
      label: "Lessons",
      href: "/student/lessons",
      description: "Course lessons and videos",
      icon: Video,
      section: "Learning",
    },
    {
      label: "Learning Materials",
      href: "/student/materials",
      description: "Notes and downloadable resources",
      icon: FolderOpen,
      section: "Learning",
    },
    {
      label: "Assignments",
      href: "/student/assignments",
      description: "Tasks and deadlines",
      icon: ClipboardCheck,
      section: "Assessment",
    },
    {
      label: "Assessments",
      href: "/student/assessments",
      description: "Quizzes and course assessments",
      icon: FileText,
      section: "Assessment",
    },
    {
      label: "Schedule",
      href: "/student/schedule",
      description: "Classes and training sessions",
      icon: CalendarDays,
      section: "Learning",
    },
    {
      label: "My Progress",
      href: "/student/progress",
      description: "Track learning milestones",
      icon: BarChart3,
      section: "Learning",
    },
    {
      label: "Certificates",
      href: "/student/certificates",
      description: "Your earned certificates",
      icon: Award,
      section: "Achievements",
    },
    {
      label: "Announcements",
      href: "/student/announcements",
      description: "Course updates and notices",
      icon: Megaphone,
      section: "Communication",
    },
    {
      label: "Profile",
      href: "/student/profile",
      description: "Your learner profile",
      icon: UserCircle,
      section: "Account",
    },
    {
      label: "Help & Support",
      href: "/support",
      description: "Get assistance",
      icon: LifeBuoy,
      section: "Account",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* EXPORTED CONFIGURATION                                                     */
/* -------------------------------------------------------------------------- */

export const DASHBOARD_UI_CONFIG: Record<
  UserType,
  DashboardUIConfig
> = {
  ADMIN: adminConfig,
  TUTOR: tutorConfig,
  STUDENT: studentConfig,
};

export function getDashboardUIConfig(
  role: UserType,
): DashboardUIConfig {
  return DASHBOARD_UI_CONFIG[role];
}
