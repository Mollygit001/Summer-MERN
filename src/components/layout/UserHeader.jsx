import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";
import { serverEndpoint } from "../../config/config";
import Can from "../../rbac/Can";
import { clearUserDetails } from "../../features/form/formSlice";
import ResetPasswordModal from "../ResetPasswordModal";


function UserHeader() {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.form.userDetails);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${serverEndpoint}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setDropdownOpen(false);
        dispatch(clearUserDetails());
        window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Dashboard
          </Link>

          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden text-gray-300 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 hover:text-gray-300 focus:outline-none"
              >
                <span>{userDetails ? userDetails.name : "Account"}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg z-50">
                  <Can permission="canViewUser">
                    <li>
                      <Link
                        to="/users"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Manage Users
                      </Link>
                    </li>
                  </Can>
                  <hr className="my-1" />
                  <li>
                    <Link
                      to='/manage-payment'
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Manage Payment
                    </Link>
                  </li>
                  <hr className="my-1" />
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowResetModal(true);
                      }}
                    >
                      Reset Password
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={(e) => {
                        setDropdownOpen(false);
                        handleLogout(e);
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu - optional future expansion */}
        {menuOpen && (
          <div className="lg:hidden px-4 pb-4">
            <ul className="space-y-2">
              {/* Mobile nav links can go here */}
            </ul>
          </div>
        )}
      </nav>
      {showResetModal && (
        <ResetPasswordModal showModal={showResetModal} setShowModal={setShowResetModal} />
      )}
    </>
  );
}

export default UserHeader;
