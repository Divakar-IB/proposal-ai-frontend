// "09 Jul 2026"
export const formatDate = (value: string | Date): string =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// "07:51 AM"
export const formatTime = (value: string | Date): string =>
  new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// "09 Jul 2026, 07:51 AM"
export const formatDateTime = (value: string | Date): string =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
