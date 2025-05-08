import React from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Chip,
    Divider
} from '@mui/material';
import { LowStockWarning } from './LowStockWarning';

interface InventoryItem {
    id: number;
    product_name: string;
    sku: string;
    quantity: number;
    price: string;
    category: string;
    image_url: string;
}

interface InventoryCardProps {
    item: InventoryItem;
    isAdmin: boolean;
    onEdit: (item: InventoryItem) => void;
    onDelete: (item: InventoryItem) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
    item,
    isAdmin,
    onEdit,
    onDelete
}) => {
    return (
        <Card elevation={3} sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            transition: 'all 0.3s ease-in-out',
            overflow: 'hidden',
            position: 'relative',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }
        }}>
            <Box
                component="img"
                src={item.image_url}
                alt={item.product_name}
                sx={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover'
                }}
            />

            <Box sx={{
                position: 'absolute',
                bottom: 'calc(100% - 180px)',
                right: 0,
                zIndex: 1,
                bgcolor: 'rgba(0,0,0,0.6)',
                borderTopLeftRadius: 8,
                p: 1
            }}>
                <Typography
                    variant="h6"
                    sx={{
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                >
                    ${item.price}
                </Typography>
            </Box>

            <CardContent sx={{
                flexGrow: 1,
                p: 3,
                background: 'linear-gradient(to bottom, rgba(255,165,0,0.05), transparent)'
            }}>
                <Typography variant="h6" component="div" fontWeight="bold" gutterBottom>
                    {item.product_name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        SKU: {item.sku}
                    </Typography>
                    <Chip
                        label={item.category}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(0, 0, 0, 0.08)',
                            fontSize: '0.7rem'
                        }}
                    />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    bgcolor: 'rgba(255, 165, 0, 0.08)',
                    borderRadius: 2
                }}>
                    <Typography variant="h6" align='center' fontWeight="bold">
                        Quantity: {item.quantity}
                    </Typography>
                </Box>
                {item.quantity < 10 && (
                    <LowStockWarning quantity={item.quantity} />
                )}
            </CardContent>
            {isAdmin && (
                <CardActions sx={{
                    justifyContent: 'space-between',
                    p: 2,
                    bgcolor: 'rgba(0,0,0,0.03)'
                }}>
                    <Button
                        size="small"
                        sx={{
                            color: 'orange',
                            fontWeight: 'medium',
                            '&:hover': { bgcolor: 'rgba(255, 165, 0, 0.08)' }
                        }}
                        onClick={() => onEdit(item)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="small"
                        sx={{
                            color: '#ff3d00',
                            fontWeight: 'medium',
                            '&:hover': { bgcolor: 'rgba(255, 61, 0, 0.08)' }
                        }}
                        onClick={() => onDelete(item)}
                    >
                        Remove
                    </Button>
                </CardActions>
            )}
        </Card>
    );
};
