import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    Typography, 
    IconButton, 
    Box,
    Button
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

interface LinkMobileModalProps {
    open: boolean;
    onClose: () => void;
    activeTripId: string | null;
}

const LinkMobileModal: React.FC<LinkMobileModalProps> = ({ open, onClose, activeTripId }) => {
    const navigate = useNavigate();

    const trackingUrl = activeTripId 
        ? `${window.location.origin}/dashboard/track/${activeTripId}`
        : '';

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            PaperProps={{
                sx: { borderRadius: 4, p: 2, maxWidth: '400px' }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Link Mobile Device</Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 2 }}>
                    <Box sx={{ 
                        p: 3, 
                        bgcolor: 'white', 
                        borderRadius: 4, 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        mb: 3
                    }}>
                        <QRCodeSVG value={trackingUrl} size={250} level="H" includeMargin />
                    </Box>
                    <Typography variant="body1" color="text.primary" fontWeight="600" gutterBottom>
                        Scan to start tracking
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Open your phone camera or QR scanner to link this trip session to your mobile device.
                    </Typography>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={() => {
                            onClose();
                            navigate(`/dashboard/trips/${activeTripId}`);
                        }}
                        sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                    >
                        Open Dashboard View
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default LinkMobileModal;
