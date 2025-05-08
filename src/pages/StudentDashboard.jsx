import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Grid, Card, CardContent, Button, Divider
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const tabLabels = ['Quiz Disponibles', 'Quiz Complétés'];

export default function StudentDashboard() {
  const [tab, setTab] = useState(0);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    if (tab === 0) {
      fetchAllQuizzes();
    }
  }, [tab]);

  const fetchAllQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/quizzes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      setQuizzes([]);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box mb={2}>
        <Typography variant="h4" fontWeight={700}>Tableau de bord Étudiant</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Participez aux quiz et consultez vos résultats
        </Typography>
      </Box>
      <Box sx={{ bgcolor: '#fafbfc', borderRadius: 2, p: 2, mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          {tabLabels.map((label, idx) => (
            <Tab key={label} label={label} sx={{ fontWeight: 600, minWidth: 180 }} />
          ))}
        </Tabs>
        {tab === 0 && (
          <Grid container spacing={3}>
            {quizzes.map((quiz) => (
              <Grid item xs={12} md={6} key={quiz.id}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700}>{quiz.title}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Par {quiz.createdBy?.firstName ? `${quiz.createdBy.firstName} ${quiz.createdBy.lastName || ''}` : quiz.createdBy?.username || 'Inconnu'}
                    </Typography>
                    <Box display="flex" gap={3} mb={1}>
                      <Typography variant="body2">
                        Questions<br /><b>{quiz.questions?.length || 0}</b>
                      </Typography>
                      <Typography variant="body2">
                        Durée<br /><b>{quiz.timeLimit} minutes</b>
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Date limite<br /><b>{quiz.dateLimit ? new Date(quiz.dateLimit).toLocaleDateString() : '-'}</b>
                    </Typography>
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Button
                      startIcon={<PlayCircleOutlineIcon />}
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ fontWeight: 600 }}
                      // onClick={() => {}}
                    >
                      Commencer le Quiz
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        {tab === 1 && (
          <Box sx={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">Aucun quiz complété pour le moment.</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
} 