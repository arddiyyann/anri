import React from "react";
import {
    Card,
    CardHeader,
    CardContent,
    Grid,
    TextField,
    InputAdornment,
    Typography,
    Chip,
    Stack,
    Alert,
    Divider,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function InstitutionSection({
    institutionName,
    setInstitutionName,
    picName,
    setPicName,
    picPhone,
    setPicPhone,
}) {
    const phoneOk = !picPhone || /^[0-9+\-\s]{8,}$/.test(picPhone);

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
            <CardHeader
                title={
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" fontWeight={800}>
                            Data Instansi & PIC
                        </Typography>
                        <Chip size="small" color="primary" label="Wajib" />
                    </Stack>
                }
                subheader="Isi data instansi dan penanggung jawab untuk proses konfirmasi."
                sx={{
                    bgcolor: "background.default",
                    "& .MuiCardHeader-subheader": { mt: 0.5 },
                }}
            />

            <Divider />

            <CardContent sx={{ p: 2.5 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                        <TextField
                            label="Nama Instansi"
                            value={institutionName}
                            onChange={(e) => setInstitutionName(e.target.value)}
                            placeholder="Contoh: Universitas Indonesia / Dinas Arsip ..."
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BusinessIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            Gunakan nama instansi lengkap sesuai dokumen.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <TextField
                            label="Nama PIC"
                            value={picName}
                            onChange={(e) => setPicName(e.target.value)}
                            placeholder="Nama penanggung jawab"
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            PIC = orang yang bisa dihubungi untuk konfirmasi.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="No. HP PIC"
                            value={picPhone}
                            onChange={(e) => setPicPhone(e.target.value)}
                            placeholder="08xxxxxxxx / +62..."
                            fullWidth
                            required
                            error={!phoneOk}
                            helperText={!phoneOk ? "Format nomor belum valid (min 8 digit)." : "Gunakan nomor aktif."}
                            inputMode="tel"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIphoneIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Alert icon={<InfoOutlinedIcon />} severity="info" sx={{ borderRadius: 2 }}>
                            <Typography fontWeight={700}>Tips</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Pastikan nomor PIC bisa dihubungi. Jika PIC berubah sebelum kunjungan, update dulu sebelum submit.
                            </Typography>
                        </Alert>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
