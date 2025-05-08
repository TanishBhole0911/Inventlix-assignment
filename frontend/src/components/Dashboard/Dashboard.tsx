import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Button,
    Grid,
    Container,
    AppBar,
    Toolbar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar,
    Slider,
    Divider,
    Paper,
    Pagination,
    Stack,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    Inventory2Outlined,
    LogoutOutlined,
    Add,
    Refresh,
    CloudUpload,
    Delete,
    Search
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { InventoryCard } from './components/InventoryCard';
interface InventoryItem {
    id: number;
    product_name: string;
    sku: string;
    quantity: number;
    price: string;
    category: string;
    image?: string;
}
const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);

    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
    const [editedItem, setEditedItem] = useState<Omit<InventoryItem, 'id'>>({
        product_name: '',
        sku: '',
        quantity: 0,
        price: '',
        category: 'Electronics'
    });

    const [alertState, setAlertState] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
        product_name: '',
        sku: '',
        quantity: 0,
        price: '',
        category: 'Electronics'
    });

    const [newItemImageFile, setNewItemImageFile] = useState<File | null>(null);
    const [newItemImagePreview, setNewItemImagePreview] = useState<string | null>(null);
    const [editItemImageFile, setEditItemImageFile] = useState<File | null>(null);
    const [editItemImagePreview, setEditItemImagePreview] = useState<string | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Toys'];
    const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
    const [maxPossiblePrice, setMaxPossiblePrice] = useState<number>(1000);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [page, setPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);

    useEffect(() => {
        const checkAdmin = async () => {
            const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/user-role/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        };
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const decoded = await checkAdmin();
                setIsAdmin(decoded.is_admin);
            } catch (error) {
                console.error('Error decoding token:', error);
                handleLogout();
            }
        };

        (async () => {
            await checkAuth();
            fetchInventoryItems();
        })();
    }, [navigate]);

    useEffect(() => {
        if (items.length > 0) {
            const highestPrice = Math.max(...items.map(item => parseFloat(item.price)));
            const roundedMax = Math.ceil(highestPrice / 100) * 100;
            setMaxPossiblePrice(roundedMax);
            setPriceRange([0, roundedMax]);
        }
    }, [items]);

    const fetchInventoryItems = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/items/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setItems(response.data);
        } catch (error) {
            console.error('Error fetching inventory items:', error);
            setError('Failed to load inventory items. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const uploadImageToCloudinary = async (file: File): Promise<string> => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME!;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET!;
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const response = await axios.post(url, formData);
        return response.data.secure_url;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewItemImageFile(file);

            const previewUrl = URL.createObjectURL(file);
            setNewItemImagePreview(previewUrl);
        }
    };

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditItemImageFile(file);

            const previewUrl = URL.createObjectURL(file);
            setEditItemImagePreview(previewUrl);
        }
    };

    const clearImageSelection = () => {
        setNewItemImageFile(null);
        if (newItemImagePreview) {
            URL.revokeObjectURL(newItemImagePreview);
            setNewItemImagePreview(null);
        }
    };

    const clearEditImageSelection = () => {
        setEditItemImageFile(null);
        if (editItemImagePreview) {
            URL.revokeObjectURL(editItemImagePreview);
            setEditItemImagePreview(null);
        }
    };

    const handleAddItem = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                throw new Error('No authentication token found');
            }

            let imageUrl = "";
            if (newItemImageFile) {
                imageUrl = await uploadImageToCloudinary(newItemImageFile);
            }

            const payload = { ...newItem, image_url: imageUrl };
            console.log('Payload:', imageUrl);
            await axios.post(import.meta.env.VITE_API_BASE_URL + '/api/items/', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setAlertState({
                open: true,
                message: 'Item added successfully!',
                severity: 'success'
            });

            setNewItem({
                product_name: '',
                sku: '',
                quantity: 0,
                price: '',
                category: 'Electronics'
            });

            if (newItemImagePreview) {
                URL.revokeObjectURL(newItemImagePreview);
                setNewItemImagePreview(null);
            }
            setNewItemImageFile(null);
            setOpenAddDialog(false);
            fetchInventoryItems();
        } catch (error) {
            console.error('Error adding item:', error);
            setAlertState({
                open: true,
                message: 'Failed to add item. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleEditDialogOpen = (item: InventoryItem) => {
        setCurrentItem(item);
        setEditedItem({
            product_name: item.product_name,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            category: item.category
        });
        setEditItemImagePreview(item.image || null);
        setOpenEditDialog(true);
    };

    const handleDeleteDialogOpen = (item: InventoryItem) => {
        setCurrentItem(item);
        setOpenDeleteDialog(true);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedItem(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value, 10) : value
        }));
    };

    const handleEditItem = async () => {
        if (!currentItem) return;

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            let updatedItem = { ...editedItem };

            if (editItemImageFile) {
                const imageUrl = await uploadImageToCloudinary(editItemImageFile);
                updatedItem = { ...updatedItem, image: imageUrl };
            }

            await axios.put(import.meta.env.VITE_API_BASE_URL + `/api/items/${currentItem.id}/`, updatedItem, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setAlertState({
                open: true,
                message: 'Item updated successfully!',
                severity: 'success'
            });

            if (editItemImagePreview && editItemImageFile) {
                URL.revokeObjectURL(editItemImagePreview);
                setEditItemImagePreview(null);
            }
            setEditItemImageFile(null);

            setOpenEditDialog(false);
            fetchInventoryItems();
        } catch (error) {
            console.error('Error updating item:', error);
            setAlertState({
                open: true,
                message: 'Failed to update item. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleDeleteItem = async () => {
        if (!currentItem) return;

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            await axios.delete(import.meta.env.VITE_API_BASE_URL + `/api/items/${currentItem.id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setAlertState({
                open: true,
                message: 'Item deleted successfully!',
                severity: 'success'
            });

            setOpenDeleteDialog(false);
            fetchInventoryItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            setAlertState({
                open: true,
                message: 'Failed to delete item. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value, 10) : value
        }));
    };

    const handlePriceChange = (event: Event, newValue: number | number[]) => {
        setPriceRange(newValue as number[]);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', }}>
            <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }}>
                <Toolbar>
                    <Inventory2Outlined sx={{ fontSize: 40, color: 'orange', mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Inventory Management Platform
                    </Typography>
                    <Button
                        color="inherit"
                        startIcon={<LogoutOutlined />}
                        onClick={handleLogout}
                        sx={{
                            color: 'orange',
                            '&:hover': { backgroundColor: 'rgba(255, 165, 0, 0.08)' }
                        }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Box
                sx={{
                    bgcolor: 'rgba(255, 165, 0, 0.08)',
                    py: 8,
                    px: 2,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg" sx={{ marginLeft: 'auto' }}>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                        {isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}
                    </Typography>
                    <Typography variant="h6" paragraph color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
                        {isAdmin
                            ? 'Manage your inventory, add new items, and track stock levels all in one place.'
                            : 'View current inventory, check stock levels, and monitor product availability.'
                        }
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                        {isAdmin && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setOpenAddDialog(true)}
                                sx={{
                                    bgcolor: 'orange',
                                    '&:hover': { bgcolor: '#e67e00' },
                                    borderRadius: 2,
                                    py: 1.5,
                                    px: 3,
                                    fontWeight: 600
                                }}
                            >
                                Add New Item
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={fetchInventoryItems}
                            sx={{
                                color: 'orange',
                                borderColor: 'orange',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 165, 0, 0.08)',
                                    borderColor: '#e67e00'
                                },
                                borderRadius: 2,
                                py: 1.5,
                                px: 3,
                                fontWeight: 600
                            }}
                        >
                            Refresh Inventory
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold">
                        Inventory Items
                    </Typography>
                </Box>
                <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Filters</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={12} lg={4}>
                            <Typography variant="body1" sx={{ mb: 1 }}>Search:</Typography>
                            <TextField
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="Search by product name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': { borderColor: 'orange' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                            <Typography variant="body1" sx={{ mb: 1 }}>Category:</Typography>
                            <TextField
                                select
                                size="small"
                                fullWidth
                                variant="outlined"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <MenuItem value="All">All Categories</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Price Range: ${priceRange[0]} - ${priceRange[1]}
                            </Typography>
                            <Slider
                                value={priceRange}
                                onChange={handlePriceChange}
                                valueLabelDisplay="auto"
                                min={0}
                                max={maxPossiblePrice}
                                sx={{
                                    color: 'orange',
                                    '& .MuiSlider-thumb': {
                                        '&:hover, &.Mui-focusVisible': {
                                            boxShadow: '0px 0px 0px 8px rgba(255, 165, 0, 0.16)'
                                        }
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                        <CircularProgress sx={{ color: 'orange' }} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                ) : (() => {
                    const filteredItems = items.filter(item => {
                        const inCategory = selectedCategory === 'All' || item.category === selectedCategory;
                        const itemPrice = parseFloat(item.price);
                        const meetsMinPrice = itemPrice >= priceRange[0];
                        const meetsMaxPrice = itemPrice <= priceRange[1];
                        const matchesSearch = searchQuery === '' ||
                            item.product_name.toLowerCase().includes(searchQuery.toLowerCase());
                        return inCategory && meetsMinPrice && meetsMaxPrice && matchesSearch;
                    });

                    const indexOfLastItem = page * itemsPerPage;
                    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
                    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

                    return (
                        filteredItems.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No inventory items found.
                                </Typography>
                                {isAdmin && (
                                    <Button
                                        sx={{ mt: 2, color: 'orange' }}
                                        onClick={() => setOpenAddDialog(true)}
                                        startIcon={<Add />}
                                    >
                                        Add your first item
                                    </Button>
                                )}
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
                                    </Typography>
                                </Box>
                                <Grid container spacing={3}>
                                    {currentItems.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                                            <InventoryCard
                                                item={item}
                                                isAdmin={isAdmin}
                                                onEdit={handleEditDialogOpen}
                                                onDelete={handleDeleteDialogOpen}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                                {totalPages > 1 && (
                                    <Stack spacing={2} sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                                        <Pagination
                                            count={totalPages}
                                            page={page}
                                            onChange={handlePageChange}
                                            color="standard"
                                            size="large"
                                            showFirstButton
                                            showLastButton
                                            sx={{
                                                '& .MuiPaginationItem-root': {
                                                    '&.Mui-selected': {
                                                        bgcolor: 'orange',
                                                        color: 'white',
                                                        '&:hover': {
                                                            bgcolor: '#e67e00',
                                                        }
                                                    },
                                                }
                                            }}
                                        />
                                    </Stack>
                                )}
                            </>
                        )
                    );
                })()}
            </Container>

            <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Inventory Item</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="product_name"
                        name="product_name"
                        label="Product Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newItem.product_name}
                        onChange={handleInputChange}
                        sx={{
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'orange' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="sku"
                        name="sku"
                        label="SKU"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newItem.sku}
                        onChange={handleInputChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'orange' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="quantity"
                        name="quantity"
                        label="Quantity"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={newItem.quantity}
                        onChange={handleInputChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'orange' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="price"
                        name="price"
                        label="Price"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newItem.price}
                        onChange={handleInputChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'orange' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="category"
                        name="category"
                        select
                        label="Category"
                        fullWidth
                        variant="outlined"
                        value={newItem.category}
                        onChange={handleInputChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'orange' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                        }}
                    >
                        <MenuItem value="Electronics">Electronics</MenuItem>
                        <MenuItem value="Clothing">Clothing</MenuItem>
                        <MenuItem value="Food">Food</MenuItem>
                        <MenuItem value="Home Goods">Home Goods</MenuItem>
                        <MenuItem value="Office Supplies">Office Supplies</MenuItem>
                    </TextField>
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom >
                            Product Image
                        </Typography>
                        <Box
                            sx={{

                                borderColor: 'orange',
                                borderRadius: 1,
                                p: 3,
                                textAlign: 'center',
                                backgroundColor: 'rgba(255, 165, 0, 0.04)',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 165, 0, 0.08)'
                                }
                            }}
                            component="label"
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            {!newItemImagePreview ? (
                                <Box>
                                    <CloudUpload sx={{ fontSize: 48, color: 'orange', mb: 1 }} />
                                    <Typography>
                                        Drag & drop an image here or click to browse
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Supported formats: JPG, PNG, GIF (max 5MB)
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ position: 'relative' }}>
                                    <img
                                        src={newItemImagePreview}
                                        alt="Product preview"
                                        style={{
                                            maxHeight: '200px',
                                            maxWidth: '100%',
                                            objectFit: 'contain',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            clearImageSelection();
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            bgcolor: 'rgba(255,255,255,0.8)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                        {newItemImageFile && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                Selected file: {newItemImageFile.name} ({(newItemImageFile.size / 1024 / 1024).toFixed(2)} MB)
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setOpenAddDialog(false)}
                        sx={{ color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddItem}
                        variant="contained"
                        sx={{
                            bgcolor: 'orange',
                            '&:hover': { bgcolor: '#e67e00' },
                        }}
                    >
                        Add Item
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Inventory Item</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="product_name"
                        name="product_name"
                        label="Product Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editedItem.product_name}
                        onChange={handleEditInputChange}
                        sx={{
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'orange' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="sku"
                        name="sku"
                        label="SKU"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editedItem.sku}
                        onChange={handleEditInputChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'orange' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="quantity"
                        name="quantity"
                        label="Quantity"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editedItem.quantity}
                        onChange={handleEditInputChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'orange' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="price"
                        name="price"
                        label="Price"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editedItem.price}
                        onChange={handleEditInputChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'orange' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="category"
                        name="category"
                        select
                        label="Category"
                        fullWidth
                        variant="outlined"
                        value={editedItem.category}
                        onChange={handleEditInputChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: 'orange' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'orange' }
                        }}
                    >
                        {categories.map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </TextField>
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Product Image
                        </Typography>
                        <Box
                            sx={{
                                border: '2px dashed',
                                borderColor: 'orange',
                                borderRadius: 1,
                                p: 3,
                                textAlign: 'center',
                                backgroundColor: 'rgba(255, 165, 0, 0.04)',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 165, 0, 0.08)'
                                }
                            }}
                            component="label"
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageChange}
                                style={{ display: 'none' }}
                            />
                            {!editItemImagePreview ? (
                                <Box>
                                    <CloudUpload sx={{ fontSize: 48, color: 'orange', mb: 1 }} />
                                    <Typography>
                                        Drag & drop an image here or click to browse
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Supported formats: JPG, PNG, GIF (max 5MB)
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ position: 'relative' }}>
                                    <img
                                        src={editItemImagePreview}
                                        alt="Product preview"
                                        style={{
                                            maxHeight: '200px',
                                            maxWidth: '100%',
                                            objectFit: 'contain',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            clearEditImageSelection();
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            bgcolor: 'rgba(255,255,255,0.8)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                        {editItemImageFile && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                Selected file: {editItemImageFile.name} ({(editItemImageFile.size / 1024 / 1024).toFixed(2)} MB)
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setOpenEditDialog(false)}
                        sx={{ color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditItem}
                        variant="contained"
                        sx={{
                            bgcolor: 'orange',
                            '&:hover': { bgcolor: '#e67e00' },
                        }}
                    >
                        Update Item
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{currentItem?.product_name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        sx={{ color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteItem}
                        variant="contained"
                        sx={{
                            bgcolor: '#ff3d00',
                            '&:hover': { bgcolor: '#d32f2f' },
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={alertState.open}
                autoHideDuration={6000}
                onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
                    severity={alertState.severity}
                    elevation={6}
                    variant="filled"
                >
                    {alertState.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Dashboard;