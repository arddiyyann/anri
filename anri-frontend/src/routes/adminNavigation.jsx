// src/routes/adminNavigation.jsx
import * as React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import BuildIcon from "@mui/icons-material/Build";
import PersonIcon from "@mui/icons-material/Person";

export const ADMIN_NAVIGATION = [
    {
        kind: "page",
        segment: "admin",
        title: "Dashboard",
        icon: <DashboardIcon />,
    },
    {
        kind: "page",
        segment: "admin/pending",
        title: "Pending",
        icon: <PendingActionsIcon />,
    },
    {
        kind: "page",
        segment: "admin/services",
        title: "Services",
        icon: <BuildIcon />,
    },
    {
        kind: "page",
        segment: "admin/profile",
        title: "Profile",
        icon: <PersonIcon />,
    },
];
