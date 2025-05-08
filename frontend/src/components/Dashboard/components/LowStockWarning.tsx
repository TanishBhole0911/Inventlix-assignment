import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

// Define the pulse animation
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 152, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
`;

interface LowStockWarningProps {
    quantity: number;
    threshold?: number;
}

export const LowStockWarning: React.FC<LowStockWarningProps> = ({
    quantity,
    threshold = 10
}) => {
    // Calculate severity based on quantity
    const getSeverity = () => {
        if (quantity <= 3) return { color: '#d32f2f', text: 'Critical Stock Level' };
        if (quantity <= 5) return { color: '#f44336', text: 'Very Low Stock' };
        return { color: '#d84315', text: 'Low Stock Warning' };
    };

    const severity = getSeverity();

    return (
        <Box sx={{
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            bgcolor: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid #ff9800',
            borderRadius: 2,
            boxShadow: '0 2px 5px rgba(255, 152, 0, 0.2)',
            animation: `${pulseAnimation} 2s infinite`
        }}>
            <Box component="span" sx={{
                display: 'inline-block',
                mr: 1,
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: '#ff9800',
                color: 'white',
                fontWeight: 'bold',
                lineHeight: '20px',
                textAlign: 'center'
            }}>!</Box>
            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 'bold',
                    color: severity.color
                }}
            >
                {severity.text}
            </Typography>
        </Box>
    );
};
