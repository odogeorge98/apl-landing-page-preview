/**
 * Sample weekly timetable for the student portal.
 *
 * Classes repeat every week, so the schedule always shows current dates.
 * Replace this with the student's confirmed sessions once the schedule API is
 * connected.
 */

export type ClassMode = "Online" | "On-site";
export type ClassKind = "Class" | "Workshop" | "Mentorship";

export type WeeklyClass = {
  id: string;
  course: string;
  topic: string;
  kind: ClassKind;
  /** 0 = Sunday ... 6 = Saturday, as in Date#getDay(). */
  weekday: number;
  /** 24-hour "HH:MM" in the learner's local time. */
  startTime: string;
  endTime: string;
  mode: ClassMode;
  location: string;
  notes?: string;
};

export const ONLINE_LOCATION = "Online classroom";
export const ONSITE_LOCATION = "Training centre";

export const weeklyClasses: WeeklyClass[] = [
  {
    id: "fe-html-css",
    course: "Front-End Web Development",
    topic: "HTML5 and CSS3 practical",
    kind: "Class",
    weekday: 1,
    startTime: "10:00",
    endTime: "12:00",
    mode: "On-site",
    location: ONSITE_LOCATION,
    notes: "Bring your laptop and complete the previous week's exercise.",
  },
  {
    id: "fe-javascript",
    course: "Front-End Web Development",
    topic: "JavaScript fundamentals",
    kind: "Class",
    weekday: 2,
    startTime: "14:00",
    endTime: "16:00",
    mode: "Online",
    location: ONLINE_LOCATION,
  },
  {
    id: "it-fundamentals",
    course: "IT Training",
    topic: "Computer fundamentals and troubleshooting",
    kind: "Class",
    weekday: 3,
    startTime: "10:00",
    endTime: "12:00",
    mode: "On-site",
    location: ONSITE_LOCATION,
  },
  {
    id: "pd-wireframing",
    course: "Product Design (UI/UX)",
    topic: "Wireframing in Figma",
    kind: "Workshop",
    weekday: 3,
    startTime: "15:00",
    endTime: "16:30",
    mode: "Online",
    location: ONLINE_LOCATION,
    notes: "Have a free Figma account ready before the session.",
  },
  {
    id: "fe-react",
    course: "Front-End Web Development",
    topic: "React components and state",
    kind: "Class",
    weekday: 4,
    startTime: "10:00",
    endTime: "12:00",
    mode: "On-site",
    location: ONSITE_LOCATION,
  },
  {
    id: "ds-pandas",
    course: "Data Science",
    topic: "Python and pandas workshop",
    kind: "Workshop",
    weekday: 4,
    startTime: "14:00",
    endTime: "15:30",
    mode: "Online",
    location: ONLINE_LOCATION,
  },
  {
    id: "be-apis",
    course: "Back-End Development",
    topic: "REST APIs and databases",
    kind: "Class",
    weekday: 5,
    startTime: "11:00",
    endTime: "12:30",
    mode: "Online",
    location: ONLINE_LOCATION,
  },
  {
    id: "cs-fundamentals",
    course: "Cybersecurity",
    topic: "Security fundamentals",
    kind: "Class",
    weekday: 5,
    startTime: "14:00",
    endTime: "15:00",
    mode: "Online",
    location: ONLINE_LOCATION,
  },
  {
    id: "mentor-clinic",
    course: "Front-End Web Development",
    topic: "Project clinic and mentor feedback",
    kind: "Mentorship",
    weekday: 6,
    startTime: "10:00",
    endTime: "12:00",
    mode: "On-site",
    location: ONSITE_LOCATION,
    notes: "Bring your current project for a review with your mentor.",
  },
];

export const scheduleCourses: string[] = Array.from(new Set(weeklyClasses.map((item) => item.course)));
