import { useState } from "react";
import { useLazySearchDataQuery } from "../store/apiSlice"; // Updated path
import { useNavigate } from "react-router-dom";

const FetchData = () => {
  const [formData, setFormData] = useState({
    city: "",
    country: "",
    designation: "",
    organization: "",
    email: "",
    mobile: "",
    seniority: "",
  });
  const [searchType, setSearchType] = useState("all");
  const navigate = useNavigate();

  // Use the lazy query hook from our API slice.
  // "lazy" means the query is triggered manually, not on component mount.
  const [triggerSearch, { isLoading, isError, error }] = useLazySearchDataQuery();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    const fieldsToInclude = {
        all: ["city", "country", "designation", "organization", "email", "mobile", "seniority"],
        email: ["email"],
        mobile: ["mobile"],
        "email-mobile": ["email", "mobile"]
    }[searchType];

    fieldsToInclude.forEach(field => {
        if (formData[field]) {
            params.append(field, formData[field]);
        }
    });
    return params.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = buildQuery();
    if (!query) {
        // You might want to show an error to the user here
        console.error("Search query is empty.");
        return;
    }
    try {
      // Trigger the API call and unwrap the result
      await triggerSearch(query).unwrap();
      // On success, navigate to the data table page
      navigate("/dataTable");
    } catch (err) {
      console.error("Failed to fetch data:", err);
      // Error is already handled by the hook's `isError` and `error` state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-4xl transition-transform duration-300 hover:scale-[1.01] relative">
        <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
          Search Information
        </h2>

        <div className="mb-6">
          <label
            htmlFor="searchType"
            className="block text-gray-700 font-semibold mb-2"
          >
            Search Type
          </label>
          <select
            id="searchType"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-300 hover:border-indigo-400 bg-white"
          >
            <option value="all">All Fields</option>
            <option value="email">Email Only</option>
            <option value="mobile">Mobile Only</option>
            <option value="email-mobile">Email + Mobile</option>
          </select>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { name: "city", label: "City" },
              { name: "country", label: "Country" },
              { name: "designation", label: "Designation" },
              { name: "organization", label: "Organization" },
              { name: "email", label: "Email", type: "email" },
              { name: "mobile", label: "Mobile", type: "tel" },
              { name: "seniority", label: "Seniority" },
            ].map((field) => (
              <div key={field.name} className="flex flex-col">
                <label
                  htmlFor={field.name}
                  className="mb-2 text-gray-700 font-semibold"
                >
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-300 hover:border-indigo-400"
                  placeholder={`Enter ${field.label}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 text-black font-semibold rounded-xl border  flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="loader"></div>
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
            {isError && (
              <p className="text-red-500 mt-4">
                Error: {error?.data?.message || "Failed to fetch data"}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FetchData;