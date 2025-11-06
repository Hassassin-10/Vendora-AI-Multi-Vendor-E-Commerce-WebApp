import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Vendora. - Admin",
    description: "Vendora. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
