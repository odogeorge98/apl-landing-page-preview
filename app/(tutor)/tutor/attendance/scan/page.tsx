
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ScanLine,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import {
  getLocalDate,
  getStudents,
  markStudentPresent,
  type StudentRecord,
} from "@/lib/attendance-demo";

export default function TutorAttendanceScannerPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [scannedStudent, setScannedStudent] =
    useState<StudentRecord | null>(null);
  const [lastDate, setLastDate] = useState("");

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner) {
      setScanning(false);
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      scanner.clear();
    } catch {
      // The camera may already have stopped.
    } finally {
      scannerRef.current = null;
      setScanning(false);
    }
  }

  async function handleScan(decodedText: string) {
    if (processingRef.current) return;

    const prefix = "NUGI-STUDENT:";

    if (!decodedText.startsWith(prefix)) {
      setError("This QR code is not a Nugi student attendance code.");
      return;
    }

    const studentId = decodedText.slice(prefix.length).trim();
    const student = getStudents().find((item) => item.id === studentId);

    if (!student) {
      setError(
        "Student not found in this browser. Register the student on this device first.",
      );
      return;
    }

    processingRef.current = true;

    await stopScanner();

    setError("");
    setScannedStudent(student);
    setLastDate(getLocalDate());

    const result = markStudentPresent(student);
    setMessage(result.message);
  }

  async function startScanner() {
    setError("");
    setMessage("");
    setScannedStudent(null);
    setLastDate("");
    processingRef.current = false;

    if (typeof window === "undefined") return;

    try {
      await stopScanner();

      const scanner = new Html5Qrcode("attendance-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          void handleScan(decodedText);
        },
        () => {
          // Ignore frames without a readable QR code.
        },
      );

      setScanning(true);
    } catch {
      scannerRef.current = null;
      setScanning(false);
      setError(
        "Unable to open the camera. Allow camera permission in your browser and try again.",
      );
    }
  }

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner) {
        if (scanner.isScanning) {
          void scanner.stop().catch(() => undefined);
        }

        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        {/* Back navigation */}
        <Link
          href="/tutor/attendance"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#101D49] transition hover:text-[#A78300]"
        >
          <ArrowLeft size={18} />
          Back to Attendance
        </Link>

        {/* Page heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#101D49] text-white shadow-sm">
            <ScanLine size={30} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#101D49] sm:text-3xl">
            Scan Student QR Code
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#64718A] sm:text-base">
            Scan a registered student&apos;s QR code to record attendance for
            today.
          </p>
        </div>

        {/* Scanner and student details */}
        <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Scanner card */}
          <section className="rounded-2xl border border-[#E4E9F2] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-[#EAF0FF] p-3 text-[#101D49]">
                <ScanLine size={23} />
              </div>

              <div>
                <h2 className="font-bold text-[#101D49]">
                  Attendance Scanner
                </h2>
                <p className="mt-1 text-sm text-[#64718A]">
                  Position the QR code inside the scanning area.
                </p>
              </div>
            </div>

            {/* Camera viewport */}
            <div className="overflow-hidden rounded-xl border border-[#E4E9F2] bg-black">
              <div
                id="attendance-reader"
                className="min-h-[320px] w-full sm:min-h-[380px]"
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"
              >
                <ShieldAlert size={19} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Scan result message */}
            {message && (
              <div
                role="status"
                className={`mt-4 flex items-start gap-2 rounded-xl p-4 text-sm ${
                  message.startsWith("Student") ||
                  message.toLowerCase().includes("already been marked")
                    ? "bg-amber-50 text-amber-800"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Camera controls */}
            <button
              onClick={() => void startScanner()}
              disabled={scanning}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#101D49] px-5 py-3.5 font-semibold text-white transition hover:bg-[#172A60] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera size={19} />
              {scanning ? "Camera is running..." : "Start Camera"}
            </button>

            {scanning && (
              <button
                onClick={() => void stopScanner()}
                className="mt-3 w-full rounded-xl border border-[#E4E9F2] px-5 py-3 font-semibold text-[#101D49] transition hover:bg-[#F6F8FC]"
              >
                Stop Camera
              </button>
            )}

            <p className="mt-4 text-center text-xs leading-5 text-[#64718A]">
              Allow camera access when prompted. Camera access requires
              localhost during development or HTTPS when deployed.
            </p>
          </section>

          {/* Scanned student card */}
          <section className="h-fit rounded-2xl border border-[#E4E9F2] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-[#FFF6D8] p-3 text-[#101D49]">
                <UserRound size={23} />
              </div>

              <div>
                <h2 className="font-bold text-[#101D49]">
                  Scanned Student
                </h2>
                <p className="mt-1 text-sm text-[#64718A]">
                  Student details will appear here.
                </p>
              </div>
            </div>

            {scannedStudent ? (
              <div className="space-y-5">
                <div className="rounded-xl bg-[#F6F8FC] p-4">
                  <p className="text-xs font-medium text-[#64718A]">
                    Full Name
                  </p>
                  <p className="mt-1 break-words font-semibold text-[#101D49]">
                    {scannedStudent.fullName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#64718A]">
                    Student ID
                  </p>
                  <p className="mt-1 break-all font-semibold text-[#101D49]">
                    {scannedStudent.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#64718A]">
                    Email
                  </p>
                  <p className="mt-1 break-all text-sm text-[#17233F]">
                    {scannedStudent.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#64718A]">
                    Course
                  </p>
                  <p className="mt-1 text-sm text-[#17233F]">
                    {scannedStudent.course}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 size={18} />
                    <p className="text-xs font-medium">Attendance Date</p>
                  </div>

                  <p className="mt-2 font-semibold text-emerald-800">
                    {lastDate}
                  </p>
                </div>

                <Link
                  href="/tutor/attendance"
                  className="block rounded-xl border border-[#E4E9F2] px-4 py-3.5 text-center text-sm font-semibold text-[#101D49] transition hover:bg-[#F6F8FC]"
                >
                  View Attendance Records
                </Link>
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E9F2] px-5 py-12 text-center">
                <div className="mb-4 rounded-full bg-[#F6F8FC] p-4">
                  <UserRound size={32} className="text-[#64718A]" />
                </div>

                <p className="font-semibold text-[#101D49]">
                  Waiting for a scan
                </p>

                <p className="mt-2 max-w-xs text-sm leading-6 text-[#64718A]">
                  Start the camera and scan a registered student&apos;s QR code
                  to display their details here.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-[#64718A]">
          Nugi Innovations · Student Attendance
        </p>
      </div>
    </main>
  );
}
