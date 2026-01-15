import * as React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";

import { useAuth } from "../auth/useAuth";
import { ADMIN_NAVIGATION } from "../routes/adminNavigation";

export default function AdminToolpadLayout() {
    const nav = useNavigate();
    const { user, logout } = useAuth();

    const BRANDING = React.useMemo(
        () => ({
            title: "ANRI Admin",
            homeUrl: "/admin",
        }),
        []
    );

    const handleSignIn = React.useCallback(() => nav("/login"), [nav]);
    const handleSignOut = React.useCallback(() => {
        logout?.();
        nav("/login", { replace: true });
    }, [logout, nav]);

    const session = React.useMemo(
        () => ({
            user: {
                name: user?.name || "Admin",
                email: user?.email || "",
                image: user?.image,
            },
        }),
        [user?.name, user?.email, user?.image]
    );

    const authentication = React.useMemo(
        () => ({
            signIn: handleSignIn,
            signOut: handleSignOut,
        }),
        [handleSignIn, handleSignOut]
    );

    return (
        <ReactRouterAppProvider
            navigation={ADMIN_NAVIGATION}
            branding={BRANDING}
            session={session}
            authentication={authentication}
        >
            <DashboardLayout>
                <PageContainer>
                    <Outlet />
                </PageContainer>
            </DashboardLayout>
        </ReactRouterAppProvider>
    );
}
