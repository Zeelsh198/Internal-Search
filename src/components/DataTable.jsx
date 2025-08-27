import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaArrowUp, FaArrowDown, FaSort, FaFileExport } from "react-icons/fa"; // Added FaFileExport
import { Parser } from "@json2csv/plainjs"; // Import json2csv for CSV conversion

const DataTable = () => {
  const { results, status, error } = useSelector((state) => state.data);
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [toast, setToast] = useState(null); // State for toast notification

  console.log("Fetched Data from Redux:", results); // ✅ log persisted data

  const columns = results && results.length > 0 ? Object.keys(results[0]) : [];

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = React.useMemo(() => {
    if (!results) return [];
    let sortableResults = [...results];
    if (sortConfig.key) {
      sortableResults.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableResults;
  }, [results, sortConfig]);

  // Function to capitalize column headers
  const capitalizeHeader = (col) => {
    return col
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Function to render clickable cell content
  const renderCell = (value) => {
    if (value == null) return "—";
    if (typeof value !== "string" && typeof value !== "number") return value;

    const strValue = String(value).trim();

    // Email detection
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(strValue)) {
      return (
        <a
          href={`mailto:${strValue}`}
          className="text-indigo-600 hover:underline"
        >
          {strValue}
        </a>
      );
    }

    // Phone number detection (simple: optional +, 10-15 digits)
    if (/^\+?\d{10,15}$/.test(strValue)) {
      return (
        <a href={`tel:${strValue}`} className="text-indigo-600 hover:underline">
          {strValue}
        </a>
      );
    }

    // Link detection
    if (/^(https?:\/\/|www\.).+/.test(strValue)) {
      const url = strValue.startsWith("http") ? strValue : `https://${strValue}`;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          {strValue}
        </a>
      );
    }

    return strValue;
  };

  // Function to handle CSV export
  const handleExport = () => {
    if (!results || results.length === 0) {
      setToast({ type: "error", message: "No data available to export." });
      setTimeout(() => setToast(null), 3000); // Clear toast after 3s
      return;
    }

    try {
      const parser = new Parser({ fields: columns });
      const csv = parser.parse(results);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      link.setAttribute("href", url);
      link.setAttribute("download", `data_export_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast({ type: "success", message: "Data exported successfully!" });
      setTimeout(() => setToast(null), 3000); // Clear toast after 3s
    } catch (err) {
      console.error("Export failed:", err);
      setToast({ type: "error", message: "Failed to export data." });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Search Results</h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                New Search
              </button>
              <button
                onClick={handleExport}
                disabled={status !== "succeeded" || results.length === 0}
                className={`px-6 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                  status === "succeeded" && results.length > 0
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                title="Export data as CSV"
                aria-label="Export table data as CSV"
              >
                <FaFileExport className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-opacity duration-300 ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {status === "loading" && (
            <div className="p-6 flex justify-center items-center">
              <svg
                className="animate-spin h-6 w-6 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                ></path>
              </svg>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          )}
          {status === "failed" && (
            <p className="p-6 text-red-600 font-medium">Error: {error}</p>
          )}
          {status === "succeeded" && results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                        onClick={() => handleSort(col)}
                        role="button"
                        aria-sort={
                          sortConfig.key === col
                            ? sortConfig.direction === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span>{capitalizeHeader(col)}</span>
                          {sortConfig.key === col ? (
                            sortConfig.direction === "asc" ? (
                              <FaArrowUp className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <FaArrowDown className="w-4 h-4 text-indigo-600" />
                            )
                          ) : (
                            <FaSort className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`${
                        rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-t border-gray-200 hover:bg-indigo-50 transition-colors duration-150`}
                    >
                      {columns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs"
                        >
                          {renderCell(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {status === "succeeded" && results.length === 0 && (
            <div className="p-6 text-center text-gray-600">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <p className="mt-2 text-sm font-medium">No results found</p>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria and try again.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Start New Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTable;