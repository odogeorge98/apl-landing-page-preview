export function handleApiResponse<T>(
  result: any,
  defaultMessage: string
): {
  status: string;
  statusCode: number;
  message: string;
  data: T;
} {
  if (result.status === "error") {
    throw new Error(result.message || "An error occurred");
  }

  return {
    status: result.status,
    statusCode: result.statusCode,
    message: result.message || defaultMessage,
    data: result.data,
  };
}