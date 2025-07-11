import { useEffect, useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../../../config/config';
import { usePermissions } from '../../../rbac/permissions';
import { useNavigate } from 'react-router-dom';

function LinkDashboard() {
  const [errors, setErrors] = useState({});
  const [linksData, setLinksData] = useState([]);
  const [formData, setFormData] = useState({
    campaignTitle: '',
    originalUrl: '',
    category: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const permission = usePermissions();
  const navigate = useNavigate(); // ✅ added

  const handleModalShow = (isEdit, data = {}) => {
    if (isEdit) {
      setFormData({
        id: data._id,
        campaignTitle: data.campaignTitle,
        originalUrl: data.originalUrl,
        category: data.category
      });
    } else {
      setFormData({ campaignTitle: '', originalUrl: '', category: '' });
    }
    setIsEdit(isEdit);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setErrors({});
  };

  const handleDeleteModalShow = (id) => {
    setFormData({ id });
    setShowDeleteModal(true);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`${serverEndpoint}/links/${formData.id}`, { withCredentials: true });
      setFormData({ campaignTitle: '', originalUrl: '', category: '' });
      fetchLinks();
    } catch {
      setErrors({ message: 'Something went wrong, please try again' });
    } finally {
      handleDeleteModalClose();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.campaignTitle) {
      newErrors.campaignTitle = 'Campaign Title is mandatory';
      isValid = false;
    }
    if (!formData.originalUrl) {
      newErrors.originalUrl = 'Original URL is mandatory';
      isValid = false;
    }
    if (!formData.category) {
      newErrors.category = 'Category is mandatory';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const body = {
      campaignTitle: formData.campaignTitle,
      originalUrl: formData.originalUrl,
      category: formData.category
    };
    const config = { withCredentials: true };

    try {
      if (isEdit) {
        await axios.put(`${serverEndpoint}/links/${formData.id}`, body, config);
      } else {
        await axios.post(`${serverEndpoint}/links`, body, config);
      }
      setFormData({ campaignTitle: '', originalUrl: '', category: '' });
      fetchLinks();
      handleModalClose();
    } catch (error) {
      if (error.response?.data?.code === 'INSUFFICIENT_FUNDS') {
        setErrors({ message: `You do not have enough credits to perform this action. Add funds to your account using Manage Payment option.` });
      } else {
        setErrors({ message: 'Something went wrong, please try again' });
      }
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await axios.get(`${serverEndpoint}/links`, { withCredentials: true });
      setLinksData(res.data.data);
    } catch {
      setErrors({ message: 'Unable to fetch links at the moment, please try again' });
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Affiliate Links</h2>
        {permission.canCreateLink && (
          <button
            onClick={() => handleModalShow(false)}
            className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700"
          >
            Add
          </button>
        )}
      </div>

      {errors.message && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">{errors.message}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Campaign</th>
              <th className="p-3 border">URL</th>
              <th className="p-3 border">Category</th>
              <th className="p-3 border">Clicks</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {linksData.map((row) => (
              <tr key={row._id} className="hover:bg-gray-50">
                <td className="p-3 border">{row.campaignTitle}</td>
                <td className="p-3 border">
                  <a
                    href={`${serverEndpoint}/links/r/${row._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {row.originalUrl}
                  </a>
                </td>
                <td className="p-3 border">{row.category}</td>
                <td className="p-3 border">{row.clickCount}</td>
                <td className="p-3 border flex gap-2">
                  {permission.canEditLink && (
                    <button
                      onClick={() => handleModalShow(true, row)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      ✏️
                    </button>
                  )}
                  {permission.canDeleteLink && (
                    <button
                      onClick={() => handleDeleteModalShow(row._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  )}
                  {permission.canViewLink && (
                    <button
                      onClick={() => navigate(`/analytics/${row._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      📊
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tailwind Modal: Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-xl w-full max-w-md mx-4 p-6 relative">
            <button
              onClick={handleModalClose}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              X
            </button>
            <h3 className="text-xl font-bold mb-4">{isEdit ? 'Edit Link' : 'Add Link'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Campaign Title</label>
                <input
                  name="campaignTitle"
                  value={formData.campaignTitle}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded ${errors.campaignTitle ? 'border-red-500' : ''
                    }`}
                />
                {errors.campaignTitle && (
                  <p className="text-red-500 text-sm mt-1">{errors.campaignTitle}</p>
                )}
              </div>
              <div>
                <label className="block font-medium">Original URL</label>
                <input
                  name="originalUrl"
                  value={formData.originalUrl}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded ${errors.originalUrl ? 'border-red-500' : ''
                    }`}
                />
                {errors.originalUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.originalUrl}</p>
                )}
              </div>
              <div>
                <label className="block font-medium">Category</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded ${errors.category ? 'border-red-500' : ''
                    }`}
                />
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tailwind Modal: Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm mx-4 relative">
            <button
              onClick={handleDeleteModalClose}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this link?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDeleteModalClose}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LinkDashboard;
