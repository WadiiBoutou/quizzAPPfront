import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', username: '', password: '', role: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    setFormData({ ...formData, role: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.role) {
      setError('Veuillez sélectionner un rôle.');
      return;
    }
    try {
      await axios.post('http://localhost:8080/api/auth/register', formData);
      setSuccess('Registration successful!');
      setError('');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        setError(err.response.data.message || 'Registration failed. Please check your input.');
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('Unable to connect to the server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', err.message);
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={5}>
        <Typography variant="h5" align="center" gutterBottom>Register</Typography>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleRegister}>
          <TextField fullWidth margin="normal" label="First Name" name="firstName" onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Last Name" name="lastName" onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Email" name="email" type="email" onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Username" name="username" onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Password" name="password" type="password" onChange={handleChange} />
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Vous êtes ?</FormLabel>
            <RadioGroup row name="role" value={formData.role} onChange={handleRoleChange}>
              <FormControlLabel value="enseignant" control={<Radio />} label="Enseignant" />
              <FormControlLabel value="etudiant" control={<Radio />} label="Etudiant" />
            </RadioGroup>
          </FormControl>
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Register</Button>
        </form>
        <Button fullWidth variant="text" sx={{ mt: 1 }} onClick={() => navigate('/login')}>Sign In</Button>
      </Box>
    </Container>
  );
}
