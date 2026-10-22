
"use client";

import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dayjs from "dayjs";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Users,
  X,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { useStudentsList } from "@/lib/hooks/users/students/use-students";
import type {
  GetStudentsParams,
  Student,
  StudentGender,
} from "@/lib/interfaces/users/students";

const PAGE_SIZE = 10;

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#101d49] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#192c65] focus:outline-none focus:ring-4 focus:ring-[#101d49]/15 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4e9f2] bg-white px-4 py-2.5 text-sm font-semibold text-[#34415e] transition hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-50";

const cardClass =
  "overflow-hidden rounded-2xl border border-[#e7ebf3] bg-white shadow-[0_4px_24px_rgba(16,29,73,0.035)]";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[#e4e9f2] bg-white px-3.5 py-3 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#101d49]/50 focus:ring-4 focus:ring-[#101d49]/[0.06]";

interface StudentFormValues {
  name: string;
  email: string;
  phone: string;
  gender: StudentGender | "";
  guardianContact: string;
  programme: string;
}

const initialFormValues: StudentFormValues = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  guardianContact: "",
  programme: "",
};

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "S"
  );
}

function getAvatarStyle(name: string): string {
  const styles = [
    "bg-[#eef2ff] text-[#3730a3]",
    "bg-[#e5f7f0] text-[#087b55]",
    "bg-[#fff4d6] text-[#8a6500]",
    "bg-[#f3e8ff] text-[#7e22ce]",
    "bg-[#e6f4ff] text-[#075985]",
  ];

  const hash = [...name].reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );

  return styles[hash % styles.length] ?? styles[0]!;
}

function formatDate(date: string | null | undefined): string {
  return date && dayjs(date).isValid()
    ? dayjs(date).format("DD MMM YYYY")
    : "—";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function StudentRowsSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <tr
          key={index}
          className="animate-pulse border-b border-[#edf0f6] last:border-0"
        >
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-[#edf0f6]" />
              <div className="space-y-2">
                <div className="h-3.5 w-32 rounded bg-[#edf0f6]" />
                <div className="h-3 w-40 rounded bg-[#f2f4f8]" />
              </div>
            </div>
          </td>
          <td className="px-5 py-4">
            <div className="h-4 w-28 rounded bg-[#edf0f6]" />
          </td>
          <td className="px-5 py-4">
            <div className="h-6 w-16 rounded-full bg-[#edf0f6]" />
          </td>
          <td className="px-5 py-4">
            <div className="h-4 w-24 rounded bg-[#edf0f6]" />
          </td>
          <td className="px-5 py-4">
            <div className="h-4 w-24 rounded bg-[#edf0f6]" />
          </td>
          <td className="px-5 py-4">
            <div className="h-4 w-24 rounded bg-[#edf0f6]" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function StudentsPage() {
  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [gender, setGender] = useState<StudentGender | "">("");
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [hasSelectedPageSize, setHasSelectedPageSize] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);

  // Registration modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [formValues, setFormValues] =
    useState<StudentFormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof StudentFormValues, string>>
  >({});
  const [registrationAttempted, setRegistrationAttempted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCursor(null);
      setCursorStack([null]);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  // Close the modal with Escape and prevent background scrolling.
  useEffect(() => {
    if (!isRegisterModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRegisterModal();
      }
    };

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const computedPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`;
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRegisterModalOpen]);

  const params = useMemo<GetStudentsParams>(
    () => ({
      ...(hasSelectedPageSize ? { limit: rowsPerPage } : {}),
      ...(cursor ? { cursor } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(gender ? { gender } : {}),
    }),
    [hasSelectedPageSize, rowsPerPage, cursor, debouncedSearch, gender],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useStudentsList(params);

  const rows: Student[] = response?.data.items ?? [];
  const nextCursor = response?.data.nextCursor ?? null;

  const activeCount = useMemo(
    () => rows.filter((student) => student.user.isActive).length,
    [rows],
  );

  const currentPage = cursorStack.length;

  const resetPagination = () => {
    setCursor(null);
    setCursorStack([null]);
  };

  const handleGenderChange = (value: string) => {
    setGender(value === "male" || value === "female" ? value : "");
    resetPagination();
  };

  const handleRowsPerPageChange = (selectedValue: string) => {
    const value = Number(selectedValue);

    if (!Number.isInteger(value) || value < 1 || value > 50) return;

    setRowsPerPage(value);
    setHasSelectedPageSize(true);
    resetPagination();
  };

  const handleNextPage = () => {
    if (!nextCursor || isFetching) return;

    setCursorStack((previous) => [...previous, nextCursor]);
    setCursor(nextCursor);
  };

  const handlePrevPage = () => {
    if (cursorStack.length <= 1 || isFetching) return;

    const updatedStack = cursorStack.slice(0, -1);

    setCursorStack(updatedStack);
    setCursor(updatedStack[updatedStack.length - 1] ?? null);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setFormValues(initialFormValues);
    setFormErrors({});
    setRegistrationAttempted(false);
  };

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleFormSelectChange = (name: keyof StudentFormValues, value: string) => {
    setFormValues((previous) => ({ ...previous, [name]: value } as StudentFormValues));
    setFormErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof StudentFormValues, string>> = {};

    if (!formValues.name.trim()) {
      errors.name = "Student's full name is required.";
    } else if (formValues.name.trim().length < 2) {
      errors.name = "Name must contain at least 2 characters.";
    }

    if (!formValues.email.trim()) {
      errors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (
      formValues.phone.trim() &&
      !/^[+\d][\d\s()-]{6,19}$/.test(formValues.phone.trim())
    ) {
      errors.phone = "Enter a valid phone number.";
    }

    if (!formValues.gender) {
      errors.gender = "Please select the student's gender.";
    }

    return errors;
  };

  const handleRegistrationSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateForm();

    if (!formValues.programme) {
        errors.programme = "Please select a programme.";
      }

    setFormErrors(errors);
    setRegistrationAttempted(false);

    if (Object.keys(errors).length > 0) return;

    // The backend does not currently provide a student creation endpoint.
    // Do not send a request or pretend that the student has been created.
    setRegistrationAttempted(true);
  };

  const openRegisterModal = () => {
    setFormValues(initialFormValues);
    setFormErrors({});
    setRegistrationAttempted(false);
    setIsRegisterModalOpen(true);
  };

  const modalTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e4e9f2] bg-white px-3 py-1.5">
            <span className="size-2 rounded-full bg-[#d8a900]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64718a]">
              Learning operations
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">
            Students
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#718099]">
            Search and review student accounts, contact details, and account
            status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openRegisterModal}
            className={primaryButtonClass}
          >
            <UserPlus size={17} />
            Register Student
          </button>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className={secondaryButtonClass}
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      <section aria-label="Student overview" className="grid gap-4 sm:grid-cols-2">
        <div className={cn(cardClass, "p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#718099]">
                Students on this page
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
                {isLoading ? (
                  <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-[#edf0f6]" />
                ) : (
                  rows.length
                )}
              </p>
              <p className="mt-1 text-xs text-[#8995aa]">Current results</p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-[#eef2ff] text-[#101d49]">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className={cn(cardClass, "p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#718099]">
                Active students on this page
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#101d49]">
                {isLoading ? (
                  <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-[#edf0f6]" />
                ) : (
                  activeCount
                )}
              </p>
              <p className="mt-1 text-xs text-[#8995aa]">
                Accounts marked active
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-[#e5f7f0] text-[#087b55]">
              <CheckCircle2 size={21} />
            </div>
          </div>
        </div>
      </section>

      <section className={cardClass} aria-label="Student records">
        <div className="flex flex-col gap-3 border-b border-[#edf0f6] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="font-bold text-[#101d49]">Student directory</h2>
            <p className="mt-1 text-xs text-[#8995aa]">
              Search by name, email, or phone number.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa5b8]"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search students…"
                aria-label="Search students"
                className="w-full rounded-xl border border-[#e4e9f2] bg-white py-2.5 pl-9 pr-9 text-sm text-[#17233f] outline-none transition placeholder:text-[#9aa5b8] focus:border-[#101d49]/40 focus:ring-4 focus:ring-[#101d49]/[0.06]"
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8995aa] hover:bg-[#f3f5f9]"
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <AnimatedSelect
              ariaLabel="Filter by gender"
              value={gender}
              options={[
                { value: "", label: "All genders" },
                { value: "female", label: "Female" },
                { value: "male", label: "Male" },
              ]}
              onChange={handleGenderChange}
              className="min-h-10 min-w-[9.5rem] rounded-xl px-3 text-sm"
            />
          </div>
        </div>

        {isError ? (
          <div
            role="alert"
            className="m-5 flex flex-col items-center rounded-xl border border-red-100 bg-red-50 px-5 py-10 text-center"
          >
            <CircleAlert size={24} className="text-red-600" />
            <h3 className="mt-3 font-semibold text-red-900">
              Could not load students
            </h3>
            <p className="mt-1 max-w-md text-sm text-red-700">
              {getErrorMessage(error)}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className={cn(
                secondaryButtonClass,
                "mt-4 border-red-200 text-red-800 hover:bg-red-100",
              )}
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#fafbfd] text-[11px] font-bold uppercase tracking-[0.08em] text-[#8995aa]">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Student</th>
                    <th scope="col" className="px-5 py-3.5">Phone</th>
                    <th scope="col" className="px-5 py-3.5">Gender</th>
                    <th scope="col" className="px-5 py-3.5">Guardian contact</th>
                    <th scope="col" className="px-5 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5">Joined</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf0f6]">
                  {isLoading ? (
                    <StudentRowsSkeleton />
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f3f5f9] text-[#718099]">
                          <GraduationCap size={23} />
                        </div>
                        <p className="mt-3 font-semibold text-[#34415e]">
                          No students found
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#8995aa]">
                          {debouncedSearch || gender
                            ? "Adjust your search or filters and try again."
                            : "There are no student accounts to show yet."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((student) => (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-[#fafbfd]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt=""
                                className="size-10 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div
                                className={cn(
                                  "flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                                  getAvatarStyle(student.name),
                                )}
                              >
                                {getInitials(student.name)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#101d49]">
                                {student.name}
                              </p>
                              <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[#8995aa]">
                                <Mail size={12} className="shrink-0" />
                                <span className="truncate">
                                  {student.user.email}
                                </span>
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {student.user.phoneNo ? (
                            <span className="flex items-center gap-2 text-[#52617b]">
                              <Phone
                                size={14}
                                className="shrink-0 text-[#9aa5b8]"
                              />
                              <span className="tabular-nums">
                                {student.user.phoneNo}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[#b1bac8]">
                              Not provided
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 capitalize text-[#52617b]">
                          {student.gender ?? "—"}
                        </td>

                        <td className="px-5 py-4 text-[#52617b]">
                          {student.guardianPhoneOrEmail || (
                            <span className="text-[#b1bac8]">
                              Not provided
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                              student.user.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-[#f1f3f7] text-[#718099]",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                student.user.isActive
                                  ? "bg-emerald-500"
                                  : "bg-[#9aa5b8]",
                              )}
                            />
                            {student.user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-[#64718a]">
                          {formatDate(student.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#edf0f6] bg-[#fafbfd] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="text-xs text-[#8995aa]">
                Showing{" "}
                <span className="font-semibold text-[#34415e]">
                  {isLoading ? "…" : rows.length}
                </span>{" "}
                {rows.length === 1 ? "student" : "students"} on page{" "}
                <span className="font-semibold text-[#34415e]">
                  {currentPage}
                </span>
                {debouncedSearch && (
                  <>
                    {" "}matching{" "}
                    <span className="font-semibold text-[#34415e]">
                      “{debouncedSearch}”
                    </span>
                  </>
                )}
                {gender && (
                  <>
                    {" "}· <span className="capitalize">{gender}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-[#718099]">
                  Rows
                  <AnimatedSelect
                    ariaLabel="Rows per page"
                    value={String(rowsPerPage)}
                    options={[5, 10, 20, 30, 50].map((size) => ({ value: String(size), label: String(size) }))}
                    onChange={handleRowsPerPageChange}
                    className="min-h-9 min-w-[4.5rem] rounded-lg px-2.5 text-xs"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1 || isFetching}
                    className={cn(secondaryButtonClass, "px-3")}
                    aria-label="Previous page"
                  >
                    <ArrowLeft size={15} />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={!nextCursor || isFetching}
                    className={cn(primaryButtonClass, "px-3")}
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Register Student Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <motion.div
            key="register-student-backdrop"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={modalTransition}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#101d49]/50 p-4 backdrop-blur-[3px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeRegisterModal();
            }}
          >
            <motion.section
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.975 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
              transition={modalTransition}
              role="dialog"
              aria-modal="true"
              aria-labelledby="register-student-title"
              className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_24px_80px_rgba(7,16,39,0.28)]"
            >
            <div className="flex items-start justify-between gap-4 border-b border-[#edf0f6] px-5 py-5 sm:px-7">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff5d8] text-[#101d49]">
                  <UserPlus size={21} />
                </div>
                <div>
                  <h2
                    id="register-student-title"
                    className="text-lg font-bold text-[#101d49]"
                  >
                    Register a student
                  </h2>
                  <p className="mt-1 text-sm text-[#718099]">
                    Enter the student's basic information below.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeRegisterModal}
                aria-label="Close registration modal"
                className="rounded-lg p-2 text-[#718099] transition hover:bg-[#f3f5f9] hover:text-[#101d49]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegistrationSubmit} noValidate>
              <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-700"
                    />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Registration is not available yet
                      </p>
                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        The backend does not currently support creating student
                        accounts. You can fill in and validate this form, but
                        submitting it will not save a student.
                      </p>
                    </div>
                  </div>
                </div>

                {registrationAttempted && (
                  <div
                    role="status"
                    className="rounded-xl border border-[#e4e9f2] bg-[#f6f8fc] p-4"
                  >
                    <p className="text-sm font-semibold text-[#101d49]">
                      Your form passed validation.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#64718a]">
                      No student has been created. Registration can be enabled
                      when the backend provides a student creation endpoint.
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="student-name"
                    className="text-sm font-semibold text-[#34415e]"
                  >
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="student-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formValues.name}
                    onChange={handleFormChange}
                    placeholder="Enter student's full name"
                    aria-invalid={Boolean(formErrors.name)}
                    aria-describedby={
                      formErrors.name ? "student-name-error" : undefined
                    }
                    className={cn(
                      fieldClass,
                      formErrors.name && "border-red-400 focus:border-red-400",
                    )}
                  />
                  {formErrors.name && (
                    <p
                      id="student-name-error"
                      className="mt-1.5 text-xs text-red-600"
                    >
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="student-email"
                    className="text-sm font-semibold text-[#34415e]"
                  >
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="student-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formValues.email}
                    onChange={handleFormChange}
                    placeholder="student@example.com"
                    aria-invalid={Boolean(formErrors.email)}
                    aria-describedby={
                      formErrors.email ? "student-email-error" : undefined
                    }
                    className={cn(
                      fieldClass,
                      formErrors.email && "border-red-400 focus:border-red-400",
                    )}
                  />
                  {formErrors.email && (
                    <p
                      id="student-email-error"
                      className="mt-1.5 text-xs text-red-600"
                    >
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="student-phone"
                      className="text-sm font-semibold text-[#34415e]"
                    >
                      Phone number
                    </label>
                    <input
                      id="student-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formValues.phone}
                      onChange={handleFormChange}
                      placeholder="+234 800 000 0000"
                      aria-invalid={Boolean(formErrors.phone)}
                      aria-describedby={
                        formErrors.phone ? "student-phone-error" : undefined
                      }
                      className={cn(
                        fieldClass,
                        formErrors.phone &&
                          "border-red-400 focus:border-red-400",
                      )}
                    />
                    {formErrors.phone && (
                      <p
                        id="student-phone-error"
                        className="mt-1.5 text-xs text-red-600"
                      >
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="student-gender"
                      className="text-sm font-semibold text-[#34415e]"
                    >
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <AnimatedSelect
                      id="student-gender"
                      ariaLabel="Student gender"
                      value={formValues.gender}
                      options={[
                        { value: "", label: "Select gender" },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                      ]}
                      onChange={(value) => handleFormSelectChange("gender", value)}
                      ariaInvalid={Boolean(formErrors.gender)}
                      ariaDescribedBy={formErrors.gender ? "student-gender-error" : undefined}
                      className={cn(
                        fieldClass,
                        "justify-between",
                        !formValues.gender && "text-[#8995aa]",
                        formErrors.gender && "border-red-400 focus:border-red-400",
                      )}
                    />
                    {formErrors.gender && (
                      <p
                        id="student-gender-error"
                        className="mt-1.5 text-xs text-red-600"
                      >
                        {formErrors.gender}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="student-guardian"
                    className="text-sm font-semibold text-[#34415e]"
                  >
                    Guardian contact
                  </label>
                  <input
                    id="student-guardian"
                    name="guardianContact"
                    type="text"
                    value={formValues.guardianContact}
                    onChange={handleFormChange}
                    placeholder="Guardian's phone number or email"
                    className={fieldClass}
                  />
                  <p className="mt-1.5 text-xs text-[#8995aa]">
                    Optional — enter a phone number or email address.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="student-programme"
                    className="text-sm font-semibold text-[#34415e]"
                  >
                    Programme / Course <span className="text-red-500">*</span>
                  </label>

                  <AnimatedSelect
                    id="student-programme"
                    ariaLabel="Student programme"
                    value={formValues.programme}
                    options={[
                      { value: "", label: "Select a programme" },
                      { value: "computer-science", label: "Computer Science" },
                      { value: "software-engineering", label: "Software Engineering" },
                      { value: "data-science", label: "Data Science" },
                      { value: "cybersecurity", label: "Cybersecurity" },
                      { value: "information-technology", label: "Information Technology" },
                    ]}
                    onChange={(value) => handleFormSelectChange("programme", value)}
                    ariaInvalid={Boolean(formErrors.programme)}
                    ariaDescribedBy={formErrors.programme ? "student-programme-error" : undefined}
                    className={cn(
                      fieldClass,
                      "justify-between",
                      !formValues.programme && "text-[#8995aa]",
                      formErrors.programme && "border-red-400",
                    )}
                  />

                  {formErrors.programme && (
                    <p id="student-programme-error" className="mt-1.5 text-xs text-red-600">
                      {formErrors.programme}
                    </p>
                  )}

                  <p className="mt-1.5 text-xs text-[#8995aa]">
                    Select the programme the student intends to study.
                  </p>
                </div>

                <p className="text-xs leading-5 text-[#8995aa]">
                  Fields marked with <span className="text-red-500">*</span>{" "}
                  are required. Information entered here remains in the form
                  only and is not saved to the student directory.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#edf0f6] bg-[#fafbfd] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={closeRegisterModal}
                  className={secondaryButtonClass}
                >
                  Close
                </button>

                <button type="submit" className={primaryButtonClass}>
                  <CheckCircle2 size={16} />
                  Validate form
                </button>
              </div>
            </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
