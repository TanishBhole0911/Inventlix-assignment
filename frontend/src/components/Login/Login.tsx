import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    Divider,
    Alert,
    Snackbar,
    AlertColor,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonOutline,
    LockOutlined,
    Inventory2Outlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './Login.css';

interface FormData {
    username: string;
    password: string;
    confirmPassword?: string;
    role?: string;
}

interface FormErrors {
    username: string;
    password: string;
    confirmPassword: string;
    role: string;
}

interface AlertState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertState>({
        open: false,
        message: '',
        severity: 'error'
    });

    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'Staff'
    });

    const [errors, setErrors] = useState<FormErrors>({
        username: '',
        password: '',
        confirmPassword: '',
        role: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>): void => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name as keyof FormData]: value as string
        });

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors({
                ...errors,
                [name as keyof FormErrors]: ''
            });
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;
        const newErrors = { ...errors };

        // Common validations
        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (!formData.username) {
            newErrors.username = 'Username is required';
            isValid = false;
        }

        if (!isLogin) {
            // Register validations
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
                isValid = false;
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
                isValid = false;
            }

            if (!formData.role) {
                newErrors.role = 'Role is required';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (isLogin) {
                // Call login API with env based URL
                const loginData = {
                    username: formData.username,
                    password: formData.password
                };

                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/token/`,
                    loginData,
                    {
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                // Save tokens in localStorage
                localStorage.setItem('accessToken', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);

                setAlert({
                    open: true,
                    message: 'Login successful!',
                    severity: 'success'
                });

                // Redirect to dashboard after successful login
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                // Handle register logic
                const registerData = {
                    username: formData.username,
                    password: formData.password,
                    role: formData.role?.toLowerCase()
                };

                // First call register API with env based URL
                await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/register/`,
                    registerData,
                    {
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                // Then call token API to get authentication tokens with env based URL
                const tokenResponse = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/token/`,
                    {
                        username: formData.username,
                        password: formData.password
                    },
                    {
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                // Save tokens in localStorage
                localStorage.setItem('accessToken', tokenResponse.data.access);
                localStorage.setItem('refreshToken', tokenResponse.data.refresh);

                setAlert({
                    open: true,
                    message: 'Registration successful! Redirecting to dashboard...',
                    severity: 'success'
                });

                // Redirect to dashboard after successful registration
                setTimeout(() => navigate('/dashboard'), 1500);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            let errorMessage = 'An error occurred';

            if (axios.isAxiosError(error) && error.response) {
                // Extract error message from API response
                if (typeof error.response.data === 'object' && error.response.data !== null) {
                    if (error.response.data.detail) {
                        errorMessage = error.response.data.detail;
                    } else {
                        // Handle validation errors from DRF
                        const firstError = Object.values(error.response.data)[0];
                        errorMessage = Array.isArray(firstError) ? firstError[0].toString() : 'Validation error';
                    }
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            setAlert({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const toggleMode = (): void => {
        setIsLogin(!isLogin);
        // Clear form data and errors when switching modes
        setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            role: 'Staff'
        });
        setErrors({
            username: '',
            password: '',
            confirmPassword: '',
            role: ''
        });
    };

    const handleCloseAlert = (): void => {
        setAlert({ ...alert, open: false });
    };

    return (
        <Box className="login-page-container" sx={{
            minHeight: '100vh',
            display: 'flex',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eaec 100%)',
            overflow: 'auto'
        }}>
            <Grid container className="login-stacked-container" sx={{
                width: '100%',
                margin: 0,
                justifyContent: 'space-between'
            }}>
                {/* Left side - Inventory Management Platform Info */}
                <Grid item xs={12} md={7} lg={7} className="login-info-section"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: 8,
                    }}
                >
                    <Box sx={{
                        position: 'relative',
                        zIndex: 2,
                        textAlign: 'center',
                        maxWidth: '700px',
                        padding: 4
                    }}>
                        <Inventory2Outlined sx={{ fontSize: 80, color: 'orange', mb: 2 }} />
                        <Typography variant="h3" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
                            Inventory Management Platform
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
                            Streamline your inventory operations, track products in real-time,
                            and optimize your supply chain with our comprehensive solution.
                        </Typography>
                        <Box className="login-stats-container" sx={{
                            display: 'flex',
                            gap: 4,
                            justifyContent: 'center',
                            mt: 4
                        }}>
                            {/* <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" fontWeight="bold" color="orange">
                                    99%
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Accuracy Rate
                                </Typography>
                            </Box> */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" fontWeight="bold" color="orange">
                                    50%
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Time Saved
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" fontWeight="bold" color="orange">
                                    24/7
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Real-time Updates
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Background decoration elements */}
                    <Box sx={{
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'rgba(255, 165, 0, 0.1)',
                        top: '10%',
                        left: '-100px'
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'rgba(255, 165, 0, 0.08)',
                        bottom: '5%',
                        right: '10%'
                    }} />
                </Grid>

                {/* Right side - Login form */}
                <Grid item xs={12} md={5} lg={5} className="login-form-section"
                    sx={{
                        display: 'flex',
                        justifyContent: { xs: 'center', lg: 'flex-end' },
                        alignItems: 'center',
                        padding: { xs: 2, md: 4, lg: '4rem 5rem 4rem 0' },
                        position: 'relative'
                    }}
                >
                    <Paper elevation={3} sx={{
                        width: '100%',
                        maxWidth: '450px',
                        borderRadius: '16px',
                        padding: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        zIndex: 1,
                    }}>
                        <Box sx={{ mb: 4, textAlign: 'center' }}>
                            <Typography variant="h4" component="h1" sx={{
                                fontWeight: 700,
                                mb: 1,
                                color: '#333'
                            }}>
                                {isLogin ? 'Welcome Back!' : 'Join Us'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {isLogin ? 'Sign in to your account' : 'Create your account'}
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit} className="login-form">
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={formData.username}
                                onChange={handleChange}
                                error={!!errors.username}
                                helperText={errors.username}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'orange'
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'orange'
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'orange'
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'orange'
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {!isLogin && (
                                <>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        error={!!errors.confirmPassword}
                                        helperText={errors.confirmPassword}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'orange'
                                                },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: 'orange'
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlined sx={{ color: 'text.secondary' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle confirm password visibility"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <FormControl fullWidth margin="normal" required variant="outlined">
                                        <InputLabel id="role-label" sx={{
                                            '&.Mui-focused': {
                                                color: 'orange'
                                            }
                                        }}>Role</InputLabel>
                                        <Select
                                            labelId="role-label"
                                            id="role"
                                            name="role"
                                            label="Role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            sx={{
                                                borderRadius: '8px',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderRadius: '8px'
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'orange'
                                                }
                                            }}
                                        >
                                            <MenuItem value="Admin">Admin</MenuItem>
                                            <MenuItem value="Staff">Staff</MenuItem>
                                        </Select>
                                        {errors.role && (
                                            <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                                                {errors.role}
                                            </Typography>
                                        )}
                                    </FormControl>
                                </>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    borderRadius: '8px',
                                    padding: '12px 0',
                                    backgroundColor: 'orange',
                                    fontWeight: 600,
                                    '&:hover': {
                                        backgroundColor: '#e67e00',
                                    }
                                }}
                            >
                                {isLogin ? 'Sign In' : 'Register'}
                            </Button>

                            <Divider sx={{ my: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    OR
                                </Typography>
                            </Divider>

                            <Box textAlign="center">
                                <Button
                                    onClick={toggleMode}
                                    sx={{
                                        color: 'orange',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 165, 0, 0.08)'
                                        }
                                    }}
                                >
                                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                    <Box sx={{
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'rgba(255, 165, 0, 0.08)',
                        bottom: '5%',
                        right: '10%'
                    }} />
                </Grid>
            </Grid>

            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity={alert.severity}
                    elevation={6}
                    variant="filled"
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Login;