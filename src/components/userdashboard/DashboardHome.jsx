import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserPoliciesCurrent, getUserPackageKey } from '../../lib/userService';
import { FaRegFileAlt, FaPlus, FaChartPie, FaEye, FaFileAlt } from 'react-icons/fa';
import { getPackagesFromDatabase, getPolicyTypesForPackage } from '../../lib/policySettings';

const DashboardHome = () => {
  const [policies, setPolicies] = useState([]);
  const [packageKey, setPackageKey] = useState(null);
  const [stats, setStats] = useState({
    totalPolicies: 0,
    recentlyEdited: 0,
    allowedPolicies: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        // Get user policies
        const userPolicies = getUserPoliciesCurrent();
        setPolicies(userPolicies);
        
        // Get user package
        const userPackageKey = getUserPackageKey();
        setPackageKey(userPackageKey);
        
        // Calculate stats
        const allowedPolicyTypes = getPolicyTypesForPackage(userPackageKey);
        
        setStats({
          totalPolicies: userPolicies.length,
          recentlyEdited: userPolicies.filter(p => p.updatedAt).length,
          allowedPolicies: allowedPolicyTypes.length
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your FinePolicy dashboard. Manage your policies and subscription from here.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/policy-generator" 
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 flex items-center"
          >
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-4">
              <FaPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Create New Policy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate a new policy from templates</p>
            </div>
          </Link>
          
          <Link 
            to="/dashboard/policies" 
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 flex items-center"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
              <FaFileAlt className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">View All Policies</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Access and manage your policies</p>
            </div>
          </Link>
          
          <Link 
            to="/dashboard/subscription" 
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 flex items-center"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
              <FaChartPie className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Manage Subscription</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View or upgrade your plan</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                <FaRegFileAlt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Policies</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPolicies}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                <FaEye className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recently Edited</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.recentlyEdited}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-3">
                <FaFileAlt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Available Templates</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.allowedPolicies}</p>
          </div>
        </div>
      </div>

      {/* Recent Policies */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Policies</h2>
          <Link 
            to="/dashboard/policies"
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            View All
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-500" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : policies.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">You have no policies yet</p>
            <Link 
              to="/policy-generator"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Create Your First Policy
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Policy Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {policies.slice(0, 5).map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {policy.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                        {policy.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(policy.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {policy.updatedAt ? formatDate(policy.updatedAt) : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
