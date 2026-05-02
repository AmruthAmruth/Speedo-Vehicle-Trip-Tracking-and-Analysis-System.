import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ConfirmationModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    danger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
    danger = false
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={onCancel}
            PaperProps={{
                sx: { 
                    borderRadius: 3, 
                    padding: 1,
                    maxWidth: '400px'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {danger && <WarningAmberIcon color="error" />}
                <Typography variant="h6" fontWeight="bold">
                    {title}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" color="text.secondary">
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ padding: 2, gap: 1 }}>
                <Button 
                    onClick={onCancel} 
                    disabled={loading}
                    sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'text.secondary'
                    }}
                >
                    {cancelText}
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    disabled={loading}
                    sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        backgroundColor: danger ? '#E53E3E' : '#667eea',
                        '&:hover': {
                            backgroundColor: danger ? '#C53030' : '#5a67d8',
                        }
                    }}
                >
                    {loading ? 'Processing...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationModal;
