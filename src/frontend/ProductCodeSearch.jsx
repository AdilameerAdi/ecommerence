import { useState } from "react";
import { Search } from "lucide-react";

export default function ProductCodeSearch({ onCodeSearch }) {
  const [codeQuery, setCodeQuery] = useState("");

  const handleCodeSearch = (e) => {
    e.preventDefault();
    if (onCodeSearch && codeQuery.trim()) {
      onCodeSearch(codeQuery.trim());
    }
  };

  const handleInputChange = (e) => {
    setCodeQuery(e.target.value);
    // Real-time search for product codes
    if (onCodeSearch) {
      onCodeSearch(e.target.value);
    }
  };

  const handleClear = () => {
    setCodeQuery("");
    if (onCodeSearch) {
      onCodeSearch("");
    }
  };

  return (
    <div className="bg-gray-50 py-3 px-4 border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleCodeSearch} className="relative max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by product code..."
                value={codeQuery}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white text-black py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              {codeQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Search Code
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Enter exact product code for quick search (e.g., "SKU123", "PROD456")
          </p>
        </form>
      </div>
    </div>
  );
}