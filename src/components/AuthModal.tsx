import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tabs,
  Tab,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Divider
} from '@mui/material';
import {
  Person,
  Lock,
  Email,
  FitnessCenter
} from '@mui/icons-material';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function AuthModal({ 
  open, 
  onClose, 
  onLogin, 
  onRegister, 
  loading, 
  error 
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setLocalError(null);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setLocalError(null);
    if (activeTab === 0) {
      await onLogin(formData.email, formData.password);
    } else {
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      await onRegister(formData.name, formData.email, formData.password);
    }
  };

  const isLoginValid = formData.email && formData.password;
  const isRegisterValid = formData.name && formData.email && formData.password && 
                         formData.password === formData.confirmPassword;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
          border: '1px solid rgba(0, 230, 118, 0.2)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <FitnessCenter sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" sx={{ color: '#ffffff !important' }}>
            SciOptimal
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          Welcome to AI-Powered Fitness
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTab-root': {
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }
            }}
          >
            <Tab label="Login" icon={<Person />} iconPosition="start" />
            <Tab label="Register" icon={<Lock />} iconPosition="start" />
          </Tabs>
        </Box>

        {(localError || error) && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {localError || error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {activeTab === 1 && (
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              margin="normal"
              required
              variant="outlined"
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }
              }}
            />
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            margin="normal"
            required
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
              sx: {
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            margin="normal"
            required
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
              sx: {
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }
              }
            }}
          />

          {activeTab === 1 && (
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              margin="normal"
              required
              variant="outlined"
              sx={{ mb: 2 }}
              error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
              helperText={
                formData.password !== formData.confirmPassword && formData.confirmPassword !== ''
                  ? 'Passwords do not match'
                  : ''
              }
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                sx: {
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }
              }}
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || (activeTab === 0 ? !isLoginValid : !isRegisterValid)}
            className="gradient-button"
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              activeTab === 0 ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            or
          </Typography>
        </Divider>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          {activeTab === 0 ? "Don't have an account? " : "Already have an account? "}
          <Button
            variant="text"
            onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)}
            sx={{ 
              color: 'primary.main',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {activeTab === 0 ? 'Sign up' : 'Sign in'}
          </Button>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
