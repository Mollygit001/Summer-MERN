import UserFooter from "./UserFooter";
import UserHeader from "./UserHeader";

function UserLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <UserHeader />
            <main className="flex-grow container mx-auto px-4 py-6">
                {children}
            </main>
            <UserFooter />
        </div>
    );
}

export default UserLayout;