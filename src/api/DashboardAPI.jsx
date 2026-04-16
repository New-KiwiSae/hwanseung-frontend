import axios from "axios";

const getHeader = () => {
  const accessToken = sessionStorage.getItem("accessToken");
  const refreshToken = sessionStorage.getItem("refreshToken");
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Refresh-Token": refreshToken,
    },
  };
};

export const fetchWeeklyTrend = async () => {
  const response = await axios.get(
    "/api/admin/dashboard/weekly-trend",
    getHeader()
  );
  return response.data;
};

export const fetchDashboardSummary = async () => {
  const response = await axios.get(
    "/api/admin/dashboard/summary",
    getHeader()
  );
  return response.data;
};

export const fetchPendingReports = async () => {
  const response = await axios.get(
    "/api/admin/dashboard/pending-reports",
    getHeader()
  );
  return response.data;
};

export const fetchTransactionLogs = async () => {
  const response = await axios.get(
    "/api/admin/dashboard/transaction-logs",
    getHeader()
  );
  return response.data;
};

export const fetchRecentProducts = async () => {
  const response = await axios.get(
    "/api/admin/dashboard/recent-products",
    getHeader()
  );
  return response.data;
};
