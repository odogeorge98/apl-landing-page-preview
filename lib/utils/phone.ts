
/**
 * Formats a Nigerian phone number to international format.
 *
 * Examples:
 * 08045123456   -> 2348045123456
 * 0804 512 3456 -> 2348045123456
 * +2348045123456 -> 2348045123456
 * 2348045123456 -> 2348045123456
 */
export const formatNigerianPhoneNumber = (
  phone: string,
): string => {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return "";

  // Convert local Nigerian format: 080... -> 23480...
  if (digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }

  // Remove the international dialing prefix.
  if (digits.startsWith("234")) {
    return digits;
  }

  // Treat an unprefixed number as a Nigerian number.
  return `234${digits}`;
};
