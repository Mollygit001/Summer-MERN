import { useEffect, useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from "../../../config/config";

const USER_ROLES = ['viewer', 'developer'];

function ManageUsers() {
    const [errors, setErrors] = useState({});
    const [usersData, setUsersData] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        role: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const handleModalShow = (isEdit, data = {}) => {
        if (isEdit) {
            setFormData({
                id: data._id,
                email: data.email,
                name: data.name,
                role: data.role
            });
        } else {
            setFormData({ email: '', name: '', role: '' });
        }
        setIsEdit(isEdit);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setErrors({});
    };

    const handleDeleteModalShow = (userId) => {
        setFormData({ id: userId });
        setShowDeleteModal(true);
    };

    const handleDeleteModalClose = () => {
        setShowDeleteModal(false);
    };

    const handleDeleteSubmit = async () => {
        try {
            setFormLoading(true);
            await axios.delete(`${serverEndpoint}/users/${formData.id}`, { withCredentials: true });
            fetchUsers();
        } catch {
            setErrors({ message: 'Something went wrong, please try again' });
        } finally {
            handleDeleteModalClose();
            setFormLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        let isValid = true;
        if (!formData.email) {
            newErrors.email = 'Email is mandatory';
            isValid = false;
        }
        if (!formData.name) {
            newErrors.name = 'Name is mandatory';
            isValid = false;
        }
        if (!formData.role) {
            newErrors.role = 'Role is mandatory';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setFormLoading(true);
        const body = { email: formData.email, name: formData.name, role: formData.role };

        try {
            if (isEdit) {
                await axios.put(`${serverEndpoint}/users/${formData.id}`, body, { withCredentials: true });
            } else {
                await axios.post(`${serverEndpoint}/users`, body, { withCredentials: true });
            }
            fetchUsers();
            handleModalClose();
        } catch {
            setErrors({ message: 'Something went wrong, please try again' });
        } finally {
            setFormLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${serverEndpoint}/users`, { withCredentials: true });
            setUsersData(res.data);
        } catch {
            setErrors({ message: 'Unable to fetch users at the moment, please try again' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Users</h2>
                <button
                    className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700"
                    onClick={() => handleModalShow(false)}
                >
                    Add
                </button>
            </div>

            {errors.message && (
                <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
                    {errors.message}
                </div>
            )}

            <div className="overflow-x-auto border rounded">
                <table className="min-w-full table-auto text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center">Loading...</td>
                            </tr>
                        ) : usersData.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">No users found</td>
                            </tr>
                        ) : (
                            usersData.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.role}</td>
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => handleModalShow(true, user)}
                                            className="text-yellow-600 hover:text-yellow-800"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteModalShow(user._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md relative mx-4">
                        <button
                            onClick={handleModalClose}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
                        >
                            ×
                        </button>
                        <h3 className="text-lg font-semibold mb-4">{isEdit ? 'Edit User' : 'Add User'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-medium">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full border px-3 py-2 rounded ${
                                        errors.email ? 'border-red-500' : ''
                                    }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="block font-medium">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full border px-3 py-2 rounded ${
                                        errors.name ? 'border-red-500' : ''
                                    }`}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block font-medium">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className={`w-full border px-3 py-2 rounded ${
                                        errors.role ? 'border-red-500' : ''
                                    }`}
                                >
                                    <option value="">Select Role</option>
                                    {USER_ROLES.map((role) => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                disabled={formLoading}
                            >
                                {formLoading ? 'Submitting...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Delete */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm relative mx-4">
                        <button
                            onClick={handleDeleteModalClose}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
                        >
                            ×
                        </button>
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p className="mb-6">Are you sure you want to delete this user?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleDeleteModalClose}
                                className="bg-gray-300 px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSubmit}
                                disabled={formLoading}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {formLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;
