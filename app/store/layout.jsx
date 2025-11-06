import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "Vendora. - Store Dashboard",
    description: "Vendora. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
