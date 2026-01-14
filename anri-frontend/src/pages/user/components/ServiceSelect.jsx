import React from "react";
import { TextField, MenuItem, Stack, Typography, Alert } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function ServiceSelect({ services, serviceId, setServiceId, selectedService }) {
    return (
        <Stack spacing={1.5}>
            <TextField
                select
                label="Layanan"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                fullWidth
                helperText="Pilih layanan yang akan kamu ajukan."
            >
                {services.length === 0 ? (
                    <MenuItem value="" disabled>
                        (Layanan belum tersedia)
                    </MenuItem>
                ) : (
                    services.map((s) => (
                        <MenuItem key={s.id} value={String(s.id)}>
                            {s.name}
                        </MenuItem>
                    ))
                )}
            </TextField>

            {selectedService?.description ? (
                <Alert icon={<InfoOutlinedIcon />} severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2">{selectedService.description}</Typography>
                </Alert>
            ) : (
                <Typography variant="caption" color="text.secondary">
                    Pilih layanan untuk melihat deskripsi.
                </Typography>
            )}
        </Stack>
    );
}
