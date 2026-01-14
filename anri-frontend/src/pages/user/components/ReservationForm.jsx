import React, { useMemo } from "react";
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Stack,
    Button,
    Divider,
    Alert,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

import InstitutionSection from "./InstitutionSection";

export default function ReservationForm({
    mode,
    setMode,
    requestedStartAt,
    setRequestedStartAt,
    requestedEndAt,
    setRequestedEndAt,

    institutionName,
    setInstitutionName,
    picName,
    setPicName,
    picPhone,
    setPicPhone,
    topic,
    setTopic,
    details,
    setDetails,

    canSubmit, // boleh tetap, tapi kita juga hitung internal
    onSubmit,
    onLoadMine,
}) {
    const timeOk = Boolean(requestedStartAt && requestedEndAt);

    const requiredOk = useMemo(() => {
        return (
            timeOk &&
            Boolean(institutionName?.trim()) &&
            Boolean(picName?.trim()) &&
            Boolean(picPhone?.trim()) &&
            Boolean(topic?.trim())
        );
    }, [timeOk, institutionName, picName, picPhone, topic]);

    const submitEnabled = Boolean(canSubmit && requiredOk);

    const phoneOk = !picPhone || /^[0-9+\-\s]{8,}$/.test(picPhone);

    function handleSubmit() {
        // guard biar tidak ngirim kosong
        if (!requestedStartAt) return alert("Tanggal/jam mulai wajib diisi.");
        if (!requestedEndAt) return alert("Tanggal/jam selesai wajib diisi.");
        if (!institutionName.trim()) return alert("Instansi wajib diisi.");
        if (!picName.trim()) return alert("Nama PIC wajib diisi.");
        if (!picPhone.trim()) return alert("No HP PIC wajib diisi.");
        if (!phoneOk) return alert("Format No HP PIC belum valid.");
        if (!topic.trim()) return alert("Topik wajib diisi.");

        onSubmit();
    }

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    <div>
                        <Typography variant="h6" fontWeight={900}>
                            Form Pengajuan Reservasi
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Isi jadwal, data instansi & PIC, lalu ajukan. Status awal: <b>pending</b> (menunggu admin).
                        </Typography>
                    </div>

                    <Alert
                        icon={<AccessTimeRoundedIcon />}
                        severity={timeOk ? "success" : "warning"}
                        sx={{ borderRadius: 2, py: 0.5 }}
                    >
                        {timeOk ? "Jadwal sudah terisi" : "Lengkapi jadwal mulai & selesai"}
                    </Alert>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* BAGIAN: Jadwal & Mode */}
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            label="Mode"
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="online">Online</MenuItem>
                            <MenuItem value="offline">Offline</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Mulai"
                            type="datetime-local"
                            value={requestedStartAt}
                            onChange={(e) => setRequestedStartAt(e.target.value)}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            error={!requestedStartAt}
                            helperText={!requestedStartAt ? "Wajib diisi" : " "}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Selesai"
                            type="datetime-local"
                            value={requestedEndAt}
                            onChange={(e) => setRequestedEndAt(e.target.value)}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            error={!requestedEndAt}
                            helperText={!requestedEndAt ? "Wajib diisi" : " "}
                        />
                    </Grid>

                    {/* BAGIAN: Instansi & PIC (komponen MUI yang lebih menarik) */}
                    <Grid item xs={12}>
                        <InstitutionSection
                            institutionName={institutionName}
                            setInstitutionName={setInstitutionName}
                            picName={picName}
                            setPicName={setPicName}
                            picPhone={picPhone}
                            setPicPhone={setPicPhone}
                        />
                    </Grid>

                    {/* BAGIAN: Topik */}
                    <Grid item xs={12}>
                        <TextField
                            label="Topik"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Contoh: Permohonan akses arsip ..."
                            fullWidth
                            required
                            error={!topic?.trim()}
                            helperText={!topic?.trim() ? "Wajib diisi" : " "}
                        />
                    </Grid>

                    {/* BAGIAN: Keterangan */}
                    <Grid item xs={12}>
                        <TextField
                            label="Keterangan (opsional)"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Keterangan tambahan (opsional)"
                            fullWidth
                            multiline
                            minRows={3}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Actions */}
                <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SendRoundedIcon />}
                        onClick={handleSubmit}
                        disabled={!submitEnabled}
                        sx={{ fontWeight: 900, borderRadius: 2 }}
                    >
                        Ajukan Reservasi
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<RefreshRoundedIcon />}
                        onClick={onLoadMine}
                        sx={{ fontWeight: 900, borderRadius: 2 }}
                    >
                        Load Reservasi Saya
                    </Button>

                    {!phoneOk && (
                        <Typography variant="body2" color="error" sx={{ ml: 0.5 }}>
                            Format No HP PIC belum valid.
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
