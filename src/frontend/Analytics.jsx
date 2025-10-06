import { useState, useEffect, useCallback } from 'react';
import {
  getUniqueVisitors,
  getProductAnalyticsSummary,
  getSearchAnalyticsSummary,
  getDailyAnalyticsOverview,
  getAnalyticsTotals
} from '../lib/supabase';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7'); // 7, 30, 90 days
  const [analyticsData, setAnalyticsData] = useState({
    visitors: [],
    products: [],
    searches: [],
    dailyOverview: null,
    totals: null
  });

  // Date range options
  const dateRanges = {
    '7': { label: 'Last 7 Days', days: 7 },
    '30': { label: 'Last 30 Days', days: 30 },
    '90': { label: 'Last 90 Days', days: 90 }
  };

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // console.log('Fetching analytics data for date range:', { startDate, endDate });

      const [visitorsResult, productsResult, searchesResult, dailyResult, totalsResult] = await Promise.all([
        getUniqueVisitors(startDate, endDate),
        getProductAnalyticsSummary(startDate, endDate),
        getSearchAnalyticsSummary(startDate, endDate),
        getDailyAnalyticsOverview(),
        getAnalyticsTotals(startDate, endDate)
      ]);

      // console.log('Analytics results:', {
      //   visitorsResult,
      //   productsResult,
      //   searchesResult,
      //   dailyResult,
      //   totalsResult
      // });

      setAnalyticsData({
        visitors: visitorsResult.data || [],
        products: productsResult.data || [],
        searches: searchesResult.data || [],
        dailyOverview: dailyResult.data,
        totals: totalsResult.data
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, fetchAnalyticsData]);

  // Calculate totals - use direct totals from database if available, otherwise calculate from arrays
  const totalVisitors = analyticsData.totals?.unique_visitors ??
    analyticsData.visitors.reduce((sum, day) => sum + (day.unique_visitors || 0), 0);

  const totalProductViews = analyticsData.totals?.total_product_views ??
    analyticsData.products.reduce((sum, product) => sum + (product.total_views || 0), 0);

  const totalDMClicks = analyticsData.totals?.total_dm_clicks ??
    analyticsData.products.reduce((sum, product) => sum + (product.total_dm_clicks || 0), 0);

  const totalSearches = analyticsData.totals?.total_searches ??
    analyticsData.searches.reduce((sum, search) => sum + (search.search_count || 0), 0);

  // Debug logging (commented out for production)
  // useEffect(() => {
  //   console.log('Analytics Data State:', {
  //     visitors: analyticsData.visitors,
  //     products: analyticsData.products,
  //     searches: analyticsData.searches,
  //     dailyOverview: analyticsData.dailyOverview
  //   });
  //   console.log('Calculated Totals:', {
  //     totalVisitors,
  //     totalProductViews,
  //     totalDMClicks,
  //     totalSearches
  //   });
  // }, [analyticsData, totalVisitors, totalProductViews, totalDMClicks, totalSearches]);

  // Simple chart component for visitors
  const VisitorsChart = () => {
    if (analyticsData.visitors.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No visitor data available</p>
        </div>
      );
    }

    const maxVisitors = Math.max(...analyticsData.visitors.map(v => v.unique_visitors || 0));
    
    return (
      <div className="h-64 flex items-end justify-between space-x-2 p-4 bg-gray-50 rounded-lg">
        {analyticsData.visitors.map((day, index) => {
          const height = maxVisitors > 0 ? (day.unique_visitors / maxVisitors) * 200 : 0;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 w-full rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}px` }}
                title={`${day.visit_date}: ${day.unique_visitors} visitors`}
              />
              <div className="text-xs text-gray-600 mt-2 text-center">
                {new Date(day.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs font-semibold text-gray-800">
                {day.unique_visitors}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Product Analytics Table
  const ProductAnalyticsTable = () => {
    if (analyticsData.products.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No product analytics data available
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Card Clicks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                View Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DM Clicks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modal Opens
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conversion Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {analyticsData.products.slice(0, 20).map((product, index) => {
              const conversionRate = product.total_views > 0 
                ? ((product.total_dm_clicks / product.total_views) * 100).toFixed(1)
                : '0.0';
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {product.product_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.total_views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.total_clicks || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.total_dm_clicks || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.total_modal_opens || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      parseFloat(conversionRate) > 5 ? 'bg-green-100 text-green-800' :
                      parseFloat(conversionRate) > 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {conversionRate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Search Analytics Table
  const SearchAnalyticsTable = () => {
    if (analyticsData.searches.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No search analytics data available
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Search Query
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Search Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Results
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Searched
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {analyticsData.searches.slice(0, 20).map((search, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                    "{search.search_query}"
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {search.search_count}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.round(search.avg_results_count || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(search.last_searched).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Time Period:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {Object.entries(dateRanges).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'User Analysis' },
              { id: 'products', label: 'Product Analysis' },
              { id: 'searches', label: 'Search Analysis' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Unique Visitors</p>
                  <p className="text-2xl font-bold text-blue-900">{totalVisitors}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Product Views</p>
                  <p className="text-2xl font-bold text-green-900">{totalProductViews}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">DM Clicks</p>
                  <p className="text-2xl font-bold text-purple-900">{totalDMClicks}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Total Searches</p>
                  <p className="text-2xl font-bold text-orange-900">{totalSearches}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visitors Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unique Visitors Trend</h3>
            <VisitorsChart />
          </div>
        </div>
      )}

      {/* User Analysis Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{totalVisitors}</p>
                <p className="text-sm text-gray-600">Total Unique Visitors</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.visitors.length > 0 ? Math.round(totalVisitors / analyticsData.visitors.length) : 0}
                </p>
                <p className="text-sm text-gray-600">Average Daily Visitors</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.visitors.length > 0 ? Math.max(...analyticsData.visitors.map(v => v.unique_visitors || 0)) : 0}
                </p>
                <p className="text-sm text-gray-600">Peak Daily Visitors</p>
              </div>
            </div>
            <VisitorsChart />
          </div>
        </div>
      )}

      {/* Product Analysis Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
            <ProductAnalyticsTable />
          </div>
        </div>
      )}

      {/* Search Analysis Tab */}
      {activeTab === 'searches' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Analytics</h3>
            <SearchAnalyticsTable />
          </div>
        </div>
      )}
    </div>
  );
}
