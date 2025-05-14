import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Grid, Card, CardContent, Button, Divider
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate } from 'react-router-dom';
import QuizTakingModal from './QuizTakingModal';
import QuizPerformanceModal from './QuizPerformanceModal';

const tabLabels = ['Quiz Disponibles', 'Quiz Complétés'];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [quizzes, setQuizzes] = useState([]);
  const [openQuizModal, setOpenQuizModal] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [openPerformanceModal, setOpenPerformanceModal] = useState(false);
  const [selectedQuizPerformance, setSelectedQuizPerformance] = useState(null);
  

  useEffect(() => {
    if (tab === 0) {
      fetchAllQuizzes();
    } else if (tab === 1) {
      fetchCompletedQuizzes();
    }
  }, [tab]);
  const fetchCompletedQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/quizzes/completed', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCompletedQuizzes(data);
      } else {
        setCompletedQuizzes([]);
      }
    } catch (error) {
      setCompletedQuizzes([]);
    }
  };
  
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

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setOpenQuizModal(true);
  };

  const handleViewPerformance = async (quizId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching performance for quiz:', quizId);
      console.log('Token available:', !!token);
      console.log('Token value:', token);

      const url = `http://localhost:8080/api/quizzes/${quizId}/performance`;
      console.log('Request URL:', url);

      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      console.log('Request headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setSelectedQuizPerformance(data);
        setOpenPerformanceModal(true);
      } else {
        const errorText = await response.text();
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
      }
    } catch (error) {
      console.error('Error in handleViewPerformance:', {
        message: error.message,
        stack: error.stack
      });
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
                      Par Professeur {quiz.createdBy?.firstName ? `${quiz.createdBy.firstName} ${quiz.createdBy.lastName || ''}` : quiz.createdBy?.username || 'Inconnu'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {quiz.description}
                    </Typography>
                    <Box display="flex" gap={3} mb={1}>
                      <Typography variant="body2">
                        Questions<br /><b>{quiz.questions?.length || 0}</b>
                      </Typography>
                      <Typography variant="body2">
                        Durée<br /><b>{quiz.timeLimit} min</b>
                      </Typography>
                    </Box>
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      startIcon={<PlayCircleOutlineIcon />}
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ fontWeight: 600 }}
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      Commencer le Quiz
                    </Button>
                    <Typography variant="caption" color="text.secondary" align="right" sx={{ mt: 1 }}>
                      déposé le : {quiz.dateOfCreation ? new Date(quiz.dateOfCreation).toLocaleDateString() : '-'}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
       {tab === 1 && (
  <Grid container spacing={3}>
    {completedQuizzes.length === 0 ? (
      <Box sx={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Typography variant="body1" color="text.secondary">Aucun quiz complété pour le moment.</Typography>
      </Box>
    ) : (
      completedQuizzes.map((quiz) => (
        <Grid item xs={12} md={6} key={quiz.quizId}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>{quiz.quizTitle}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Score: <b>{quiz.score} / {quiz.maxScore}</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Terminé le : {quiz.completionTime ? new Date(quiz.completionTime).toLocaleString() : '-'}
              </Typography>
            </CardContent>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                startIcon={<BarChartIcon />}
                variant="outlined"
                fullWidth
                onClick={() => handleViewPerformance(quiz.quizId)}
              >
                Voir les détails
              </Button>
            </Box>
          </Card>
        </Grid>
      ))
    )}
  </Grid>
)}

      </Box>
      {openQuizModal && activeQuiz && (
        <QuizTakingModal
          quiz={activeQuiz}
          onClose={() => { setOpenQuizModal(false); setActiveQuiz(null); }}
        />
      )}
      {openPerformanceModal && selectedQuizPerformance && (
        <QuizPerformanceModal
          open={openPerformanceModal}
          onClose={() => { setOpenPerformanceModal(false); setSelectedQuizPerformance(null); }}
          quizPerformance={selectedQuizPerformance}
        />
      )}
    </Container>
  );
} 