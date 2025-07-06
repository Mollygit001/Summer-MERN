function UnauthorizedAccess() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Unauthorized Access</h2>
            <p className="text-gray-700">
                You do not have sufficient permissions to view this page.
                <br />
                Please contact your administrator.
            </p>
        </div>
    );
}

export default UnauthorizedAccess;
