import React, { useMemo } from "react";
import {
    Box,
    Chip,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Stack,
    Tooltip,
} from "@mui/material";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { formatDT } from "./ui.jsx";

function StatusChip({ status }) {
    const cfg = useMemo(() => {
        switch (status) {
            case "approved":
                return { label: "Approved", color: "success", variant: "filled" };
            case "rejected":
                return { label: "Rejected", color: "error", variant: "filled" };
            case "pending":
            default:
                return { label: "Pending", color: "warning", variant: "outlined" };
        }
    }, [status]);

    return <Chip size="small" label={cfg.label} color={cfg.color} variant={cfg.variant} />;
}

export default function MyReservationsTable({ myReservations }) {
    if (!myReservations || myReservations.length === 0) {
        return (
            <Box
                sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "background.default",
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <EventNoteRoundedIcon fontSize="small" />
                    <Typography fontWeight={900}>Belum ada data</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Klik <b>Refresh</b> atau <b>Load Reservasi Saya</b> untuk mengambil data reservasi kamu.
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
            }}
        >
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: "background.default" }}>
                        <TableCell sx={{ fontWeight: 900, width: 70 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Layanan</TableCell>
                        <TableCell sx={{ fontWeight: 900, minWidth: 220 }}>Jadwal</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Topik</TableCell>
                        <TableCell sx={{ fontWeight: 900, width: 110 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 900, minWidth: 220 }}>Info</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {myReservations.map((r) => {
                        const jadwal =
                            r.slot?.start_at && r.slot?.end_at
                                ? `${formatDT(r.slot.start_at)} - ${formatDT(r.slot.end_at)}`
                                : `slot_id #${r.slot_id}`;

                        const isApproved = r.status === "approved";
                        const isOnline = r.mode === "online";

                        let infoNode = <Typography variant="body2" color="text.secondary">-</Typography>;

                        if (isApproved) {
                            if (isOnline) {
                                infoNode = r.meeting_link ? (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <LinkRoundedIcon fontSize="small" />
                                        <Link href={r.meeting_link} target="_blank" rel="noreferrer" underline="hover">
                                            Join meeting
                                        </Link>
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        (meeting link belum diisi admin)
                                    </Typography>
                                );
                            } else {
                                infoNode = (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PlaceRoundedIcon fontSize="small" />
                                        <Typography variant="body2">
                                            {r.location || "(lokasi belum diisi admin)"}
                                        </Typography>
                                    </Stack>
                                );
                            }
                        }

                        return (
                            <TableRow key={r.id} hover>
                                <TableCell>{r.id}</TableCell>

                                <TableCell>
                                    <Typography fontWeight={800} variant="body2">
                                        {r.service?.name ?? `service_id #${r.service_id}`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Mode: {r.mode}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Typography variant="body2">{jadwal}</Typography>
                                </TableCell>

                                <TableCell>
                                    <Tooltip title={r.topic || ""}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                maxWidth: 220,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {r.topic}
                                        </Typography>
                                    </Tooltip>
                                </TableCell>

                                <TableCell>
                                    <StatusChip status={r.status} />
                                </TableCell>

                                <TableCell>
                                    <Stack spacing={0.75}>
                                        {infoNode}

                                        {r.admin_note ? (
                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                <InfoOutlinedIcon fontSize="small" />
                                                <Typography variant="caption" color="text.secondary">
                                                    <b>Catatan admin:</b> {r.admin_note}
                                                </Typography>
                                            </Stack>
                                        ) : null}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
