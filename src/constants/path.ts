export const PATHS = {
  LOGIN: "/login",
  REGISTER: "/register",

  HOME: "/",
  DASHBOARD: "/dashboard",
  TRANSACTIONS: "/transactions",
  INCOME: "/income",
  TAXES: "/taxes",
  SETTINGS: "/settings",
  SAVINGS: "/savings",

  SCHEDULE_DETAIL: (id: string) => `/schedule/${id}`,
  SCHEDULE_UPDATE: (id: string) => `/schedule/${id}/update`,
};

/**
 * Helper function to add locale prefix to paths
 * @param locale - The locale (e.g., 'en', 'vi')
 * @param path - The path to prefix
 * @returns The path with locale prefix
 */
export const withLocale = (locale: string, path: string) => {
  // Remove leading slash from path if exists to avoid double slashes
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${cleanPath}`;
};
