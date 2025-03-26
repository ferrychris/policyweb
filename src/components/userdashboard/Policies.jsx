import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { getUserPoliciesCurrent, updateUserPolicy, deleteUserPolicy } from '../../lib/userService';
import { FaEdit, FaDownload, FaSearch, FaTrash, FaTimes, FaPlus, FaEye } from 'react-icons/fa';
import { cn, themeClasses, gradientClasses } from '../../lib/utils';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user policies
    const loadPolicies = () => {
      setLoading(true);
      try {
        const userPolicies = getUserPoliciesCurrent();
        setPolicies(userPolicies);
      } catch (error) {
        console.error('Error loading policies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredPolicies = policies.filter(policy =>
    policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (policy) => {
    setViewingPolicy(policy);
    setShowViewModal(true);
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setEditContent(policy.content);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPolicy) return;

    try {
      const result = await updateUserPolicy(editingPolicy.id, {
        content: editContent
      });

      if (result.success) {
        // Update the local state
        setPolicies(policies.map(p =>
          p.id === editingPolicy.id ? { ...p, content: editContent, updatedAt: new Date() } : p
        ));

        setShowEditModal(false);
        setEditingPolicy(null);
        setEditContent('');
      } else {
        console.error('Failed to update policy:', result.error);
      }
    } catch (error) {
      console.error('Error updating policy:', error);
    }
  };

  const handleDelete = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        const result = await deleteUserPolicy(policyId);

        if (result.success) {
          // Update the local state
          setPolicies(policies.filter(p => p.id !== policyId));
        } else {
          console.error('Failed to delete policy:', result.error);
        }
      } catch (error) {
        console.error('Error deleting policy:', error);
      }
    }
  };

  const handleDownloadPDF = (policy) => {
    const doc = new jsPDF();

    // Set title
    doc.setFontSize(16);
    doc.text(policy.title, 20, 20);

    // Set content
    doc.setFontSize(12);

    // Split content into lines to handle wrapping
    const contentLines = doc.splitTextToSize(policy.content, 170);
    doc.text(contentLines, 20, 30);

    // Save the PDF
    doc.save(`${policy.title.replace(/\s+/g, '_')}.pdf`);
  };

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
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={cn("text-2xl font-bold mb-2", themeClasses.heading)}>My Policies</h2>
          <p className={cn("text-gray-600 dark:text-gray-400", themeClasses.text)}>
            Manage and download your generated policies.
          </p>
        </div>
        <Link
          to="/dashboard/new-policy"
          className={cn(
            "flex items-center px-4 py-2 rounded-lg font-medium",
            "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
            "hover:from-indigo-700 hover:to-purple-700",
            "transition-colors",
            "shadow-md"
          )}
        >
          <FaPlus className="mr-2" />
          Generate Policy
        </Link>
      </div>

      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search policies..."
            className="w-full px-4 py-2 pl-10 pr-4 text-sm text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={handleSearch}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : policies.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <p className={cn("text-gray-600 dark:text-gray-400 mb-4", themeClasses.text)}>
            You haven't created any policies yet.
          </p>
          <Link
            to="/dashboard/new-policy"
            className={cn(
              "inline-flex items-center px-4 py-2 rounded-lg font-medium",
              "bg-indigo-100 text-indigo-700",
              "dark:bg-indigo-900/30 dark:text-indigo-300",
              "hover:bg-indigo-200 dark:hover:bg-indigo-900/50",
              "transition-colors"
            )}
          >
            <FaPlus className="mr-2" />
            Create Your First Policy
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPolicies.map(policy => (
            <div
              key={policy.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={cn("font-bold text-lg", themeClasses.heading)}>
                    {policy.title}
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleView(policy)}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Policy"
                    >
                      <FaEye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(policy)}
                      className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                      title="Edit Policy"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(policy)}
                      className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      title="Download PDF"
                    >
                      <FaDownload className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Policy"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex text-sm text-gray-600 dark:text-gray-400 space-x-4">
                    <span>Created: {formatDate(policy.createdAt)}</span>
                    {policy.updatedAt && (
                      <span>Last edited: {formatDate(policy.updatedAt)}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-32 overflow-hidden relative">
                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm">
                      {policy.content.substring(0, 250)}
                      {policy.content.length > 250 && '...'}
                    </div>
                    {policy.content.length > 250 && (
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-700"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View modal */}
      {showViewModal && viewingPolicy && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {viewingPolicy.title}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleDownloadPDF(viewingPolicy)}
                  className="flex items-center text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  title="Download PDF"
                >
                  <FaDownload className="w-5 h-5 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingPolicy);
                  }}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  title="Edit Policy"
                >
                  <FaEdit className="w-5 h-5 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {viewingPolicy.content}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Created:</span> {formatDate(viewingPolicy.createdAt)}
                {viewingPolicy.updatedAt && (
                  <span className="ml-4">
                    <span className="font-medium">Last edited:</span> {formatDate(viewingPolicy.updatedAt)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Edit Policy - {editingPolicy?.title}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <textarea
                className="w-full h-96 px-3 py-2 text-gray-700 dark:text-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 space-x-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
