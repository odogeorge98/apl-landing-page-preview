"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import AdminSelect from "@/components/ui/AdminSelect";
import { useCreateStation } from "@/lib/hooks/stations/useStations";
import { StationType, CreateStationPayload } from "@/lib/interfaces/stations";
import { NIGERIA_STATES } from "@/lib/constants/nigeria-states";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputClass =
  "mt-2 w-full rounded-xl bg-white/[0.07] px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none ring-[#8247E5]/30 transition focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

const labelClass = "text-sm font-medium text-white/55";

const errorClass = "mt-1.5 text-xs text-red-400";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATION_TYPE_OPTIONS = [
  { value: StationType.CNG,            label: "CNG Station"       },
  { value: StationType.CNG_CONVERSION, label: "CNG Conversion"    },
  { value: StationType.EV_CHARGING,    label: "Charging Station"  },
];

const STATE_OPTIONS = NIGERIA_STATES.map((s) => ({ value: s, label: s }));

// ─── Form state type ──────────────────────────────────────────────────────────

interface FormFields {
  name: string;
  stationType: string;
  address: string;
  state: string;
  phoneNo: string;
  contactEmail: string;
  // longitude: string;
  // latitude: string;
  // stationImage: string;
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

const EMPTY_FORM: FormFields = {
  name: "",
  stationType: "",
  address: "",
  state: "",
  phoneNo: "",
  contactEmail: "",
  // longitude: "",
  // latitude: "",
  // stationImage: "",
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};

  if (!fields.name.trim())
    errors.name = "Station name is required.";

  if (!fields.stationType)
    errors.stationType = "Please select a station type.";

  if (!fields.address.trim())
    errors.address = "Address is required.";

  if (!fields.state)
    errors.state = "Please select a state.";

  if (!fields.phoneNo.trim()) {
    errors.phoneNo = "Phone number is required.";
  } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(fields.phoneNo.trim())) {
    errors.phoneNo = "Enter a valid phone number.";
  }

  if (!fields.contactEmail.trim()) {
    errors.contactEmail = "Contact email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.contactEmail.trim())) {
    errors.contactEmail = "Enter a valid email address.";
  }

  // const lon = parseFloat(fields.longitude);
  // if (!fields.longitude.trim()) {
  //   errors.longitude = "Longitude is required.";
  // } else if (isNaN(lon) || lon < -180 || lon > 180) {
  //   errors.longitude = "Enter a valid longitude (−180 to 180).";
  // }

  // const lat = parseFloat(fields.latitude);
  // if (!fields.latitude.trim()) {
  //   errors.latitude = "Latitude is required.";
  // } else if (isNaN(lat) || lat < -90 || lat > 90) {
  //   errors.latitude = "Enter a valid latitude (−90 to 90).";
  // }

  // if (!fields.stationImage.trim()) {
  //   errors.stationImage = "Station image URL is required.";
  // } else {
  //   try {
  //     new URL(fields.stationImage.trim());
  //   } catch {
  //     errors.stationImage = "Enter a valid URL.";
  //   }
  // }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddStationForm() {
  const [fields, setFields] = useState<FormFields>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});

  const { mutate: submitStation, isPending } = useCreateStation();

  // ── Field helpers ──────────────────────────────────────────────────────────

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target as { name: keyof FormFields; value: string };
    const updated = { ...fields, [name]: value };
    setFields(updated);
    // Re-validate the changed field immediately if it's been touched
    if (touched[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: validate(updated)[name as keyof FormFields] }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name } = e.target as { name: keyof FormFields };
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(fields)[name as keyof FormFields] }));
  }

  function handleSelectChange(field: keyof FormFields) {
    return (value: string) => {
      const updated = { ...fields, [field]: value };
      setFields(updated);
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({ ...prev, [field]: validate(updated)[field] }));
    };
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  function handleSubmit() {
    // Mark every field as touched so all errors surface at once
    const allTouched = Object.keys(EMPTY_FORM).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof FormFields, boolean>
    );
    setTouched(allTouched);

    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: CreateStationPayload = {
      name:          fields.name.trim(),
      stationType:   fields.stationType as StationType,
      address:       fields.address.trim(),
      state:         fields.state,
      country:       "Nigeria",
      phoneNo:       fields.phoneNo.trim(),
      contactEmail:  fields.contactEmail.trim(),
      // longitude:     parseFloat(fields.longitude),
      // latitude:      parseFloat(fields.latitude),
      // stationImage:  fields.stationImage.trim(),
    };

    submitStation(payload);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard/stations/cng-conversion"
          className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Add New Location
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
            Register a new station location so riders and drivers can easily find and use it.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c182b]/95 to-[#12101c]/95 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6">

          {/* Station Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Station Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Pepp CNG Station Calabar"
              value={fields.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
              className={inputClass}
            />
            {touched.name && errors.name && (
              <p className={errorClass}>{errors.name}</p>
            )}
          </div>

          {/* Station Type */}
          <div>
            <label htmlFor="stationType" className={labelClass}>
              Station Type
            </label>
            <div className="mt-2">
              <AdminSelect
                id="stationType"
                placeholder="Select type"
                options={STATION_TYPE_OPTIONS}
                value={fields.stationType}
                onValueChange={handleSelectChange("stationType")}
                aria-label="Station type"
                size="lg"
                disabled={isPending}
              />
            </div>
            {touched.stationType && errors.stationType && (
              <p className={errorClass}>{errors.stationType}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className={labelClass}>
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="e.g. 123 Murtala Mohammed Highway"
              value={fields.address}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
              className={inputClass}
            />
            {touched.address && errors.address && (
              <p className={errorClass}>{errors.address}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className={labelClass}>
              State
            </label>
            <div className="mt-2">
              <AdminSelect
                id="state"
                placeholder="Select state"
                options={STATE_OPTIONS}
                value={fields.state}
                onValueChange={handleSelectChange("state")}
                aria-label="State"
                size="lg"
                disabled={isPending}
              />
            </div>
            {touched.state && errors.state && (
              <p className={errorClass}>{errors.state}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNo" className={labelClass}>
              Phone Number
            </label>
            <input
              id="phoneNo"
              name="phoneNo"
              type="tel"
              placeholder="e.g. +2348012345678"
              value={fields.phoneNo}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
              className={inputClass}
            />
            {touched.phoneNo && errors.phoneNo && (
              <p className={errorClass}>{errors.phoneNo}</p>
            )}
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className={labelClass}>
              Contact Email
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              placeholder="e.g. station@peppcruise.com"
              value={fields.contactEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
              className={inputClass}
            />
            {touched.contactEmail && errors.contactEmail && (
              <p className={errorClass}>{errors.contactEmail}</p>
            )}
          </div>

          {/* Longitude */}
          {/* <div>
            <label htmlFor="longitude" className={labelClass}>
              Longitude
            </label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              placeholder="e.g. 8.341429"
              value={fields.longitude}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
              className={inputClass}
            />
            {touched.longitude && errors.longitude && (
              <p className={errorClass}>{errors.longitude}</p>
            )}
          </div> */}

          {/* Latitude */}
          {/* <div>
            <label htmlFor="latitude" className={labelClass}>
              Latitude
            </label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              placeholder="e.g. 5.013869"
              value={fields.latitude}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
              className={inputClass}
            />
            {touched.latitude && errors.latitude && (
              <p className={errorClass}>{errors.latitude}</p>
            )}
          </div> */}

          {/* Station Image URL — full width */}
          {/* <div className="sm:col-span-2">
            <label htmlFor="stationImage" className={labelClass}>
              Station Image URL
            </label>
            <input
              id="stationImage"
              name="stationImage"
              type="url"
              placeholder="https://cdn.peppcruise.com/stations/example.png"
              value={fields.stationImage}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
              className={inputClass}
            />
            {touched.stationImage && errors.stationImage && (
              <p className={errorClass}>{errors.stationImage}</p>
            )}
          </div> */}

        </div>

        {/* Actions */}
        <div className="mt-10 border-t border-white/[0.06] pt-8">
          <p className="text-sm font-semibold text-white">Actions</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/stations/cng-conversion"
              className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-xl border border-[#8247E5]/45 bg-transparent px-5 text-sm font-semibold text-white transition hover:bg-[#8247E5]/10"
            >
              Discard
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-xl bg-[#8B5CF6] px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save Station"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}