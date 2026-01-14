import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Box,
    Paper,
    Tabs,
    Tab,
    Typography,
    IconButton,
    Avatar,
    useMediaQuery,
    Container,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

function initials(name = "") {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    const init = parts.map((p) => p[0]?.toUpperCase()).join("");
    return init || "U";
}

export default function UserHeaderWithSeparateNav({
    me,
    brand = "Reservasi Kegiatan",
    onLogout,
}) {
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
    const nav = useNavigate();
    const { pathname = "" } = useLocation();

    const items = [
        { label: "Dashboard", path: "/user" },
        { label: "Riwayat", path: "/user/rapor" },
        { label: "Profil", path: "/user/profil" },
    ];

    const value = Math.max(
        0,
        items.findIndex((x) => pathname === x.path || pathname.startsWith(x.path + "/"))
    );

    const HEADER_H = 64;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const go = (path) => {
        handleClose();
        nav(path);
    };

    const doLogout = () => {
        handleClose();
        if (typeof onLogout === "function") onLogout();
        else nav("/login");
    };

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.92),
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backdropFilter: "blur(14px)",
                    color: "text.primary",
                }}
            >
                <Toolbar sx={{ minHeight: HEADER_H }}>
                    <Container
                        maxWidth="lg"
                        disableGutters
                        sx={{
                            px: { xs: 2, sm: 2.5 },
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 180 }}>
                            <Typography sx={{ fontWeight: 950, letterSpacing: 0.2 }}>
                                {brand}
                            </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }} />
                        <IconButton onClick={handleOpen} sx={{ p: 0.4 }}>
                            <Avatar sx={{ width: 38, height: 38, fontWeight: 900 }}>
                                {initials(me?.name)}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            transformOrigin={{ horizontal: "right", vertical: "top" }}
                            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            PaperProps={{
                                sx: {
                                    borderRadius: 2.5,
                                    minWidth: 240,
                                    mt: 1,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    overflow: "hidden",
                                    bgcolor: alpha(theme.palette.background.paper, 0.92),
                                    backdropFilter: "blur(14px)",
                                },
                            }}
                        >
                            <Box sx={{ px: 2, pt: 1.6, pb: 1.2 }}>
                                <Typography fontWeight={950}>{me?.name || "User"}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {me?.role ? `Role: ${me.role}` : ""}
                                </Typography>
                            </Box>

                            <Divider />

                            <MenuItem onClick={() => go("/user/profil")}>
                                <ListItemIcon>
                                    <PersonRoundedIcon fontSize="small" />
                                </ListItemIcon>
                                Profil
                            </MenuItem>

                            <Divider />

                            <MenuItem
                                onClick={doLogout}
                                sx={{
                                    color: "error.main",
                                    fontWeight: 900,
                                    "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.08) },
                                }}
                            >
                                <ListItemIcon sx={{ color: "error.main" }}>
                                    <LogoutRoundedIcon fontSize="small" />
                                </ListItemIcon>
                                Keluar
                            </MenuItem>
                        </Menu>
                    </Container>
                </Toolbar>
            </AppBar>

            {/* PIL NAV TERPISAH */}
            <Box
                sx={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    py: { xs: 1.6, md: 2.5 },
                    px: 2,
                    bgcolor: "transparent",
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2.5,
                        border: "1px solid",
                        borderColor: "divider",
                        px: 0.75,
                        bgcolor: alpha(theme.palette.background.paper, 0.96),
                        overflow: "hidden",
                    }}
                >
                    <Tabs
                        value={value}
                        onChange={(_, v) => nav(items[v].path)}
                        variant={isMdUp ? "standard" : "scrollable"}
                        scrollButtons={isMdUp ? false : "auto"}
                        allowScrollButtonsMobile
                        TabIndicatorProps={{ sx: { height: 3, borderRadius: 999 } }}
                        sx={{
                            minHeight: 44,
                            "& .MuiTab-root": {
                                minHeight: 44,
                                textTransform: "none",
                                fontWeight: 800,
                                borderRadius: 2,
                                px: 2.4,
                                color: "text.secondary",
                            },
                            "& .Mui-selected": {
                                color: "primary.main",
                                fontWeight: 950,
                            },
                        }}
                    >
                        {items.map((it) => (
                            <Tab key={it.path} label={it.label} disableRipple />
                        ))}
                    </Tabs>
                </Paper>
            </Box>

            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 2.5 } }} />
        </>
    );
}
