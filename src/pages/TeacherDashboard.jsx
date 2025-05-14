import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Grid, Card, CardContent, CardActions,
  Button, IconButton, TextField, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const createEmptyAnswer = () => ({ text: '', correct: false });

const createEmptyQuestion = () => ({ 
  text: '', 
  points: 0,
  answers: Array(4).fill(null).map(() => createEmptyAnswer())
});

const tabLabels = ['Tous', 'Actifs', 'Brouillons', 'Archivés'];

// Move AIGenerationDialog outside of TeacherDashboard
const AIGenerationDialog = ({ 
  open, 
  onClose, 
  aiForm, 
  setAiForm, 
  onGenerate 
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Générer un Quiz avec l'IA</DialogTitle>
    <DialogContent>
      <Box component="form" sx={{ mt: 2 }}>
        <TextField
          label="Sujet du quiz"
          fullWidth
          margin="normal"
          value={aiForm.prompt}
          onChange={(e) => setAiForm({ ...aiForm, prompt: e.target.value })}
          placeholder="Ex: Mathématiques de base, Histoire de France..."
          required
        />
        <TextField
          label="Nombre de questions"
          type="number"
          fullWidth
          margin="normal"
          value={aiForm.numberOfQuestions}
          onChange={(e) => setAiForm({ ...aiForm, numberOfQuestions: parseInt(e.target.value) })}
          InputProps={{ inputProps: { min: 1, max: 20 } }}
          required
        />
        <TextField
          label="Limite de temps (minutes)"
          type="number"
          fullWidth
          margin="normal"
          value={aiForm.timeLimit}
          onChange={(e) => setAiForm({ ...aiForm, timeLimit: parseInt(e.target.value) })}
          InputProps={{ inputProps: { min: 1 } }}
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Type de réponses</InputLabel>
          <Select
            value={aiForm.singleCorrectAnswer}
            onChange={(e) => setAiForm({ ...aiForm, singleCorrectAnswer: e.target.value })}
            label="Type de réponses"
          >
            <MenuItem value={true}>Une seule réponse correcte</MenuItem>
            <MenuItem value={false}>Plusieurs réponses possibles</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Annuler</Button>
      <Button 
        onClick={onGenerate} 
        variant="contained" 
        disabled={!aiForm.prompt}
      >
        Générer
      </Button>
    </DialogActions>
  </Dialog>
);

export default function TeacherDashboard() {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [aiForm, setAiForm] = useState({
    prompt: '',
    numberOfQuestions: 5,
    timeLimit: 30,
    singleCorrectAnswer: true
  });
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    questions: [createEmptyQuestion()]
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      // Redirect to login or show error
      return;
    }
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      console.log('Fetching quizzes with token:', token);
      const response = await fetch('http://localhost:8080/api/quizzes/my-quizzes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched quizzes:', data);
        setQuizzes(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch quizzes:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      try {
        const token = localStorage.getItem('token');
        console.log('Delete Request Details:', {
          url: `http://localhost:8080/api/quizzes/${quizId}`,
          method: 'DELETE',
          token: token ? `${token.substring(0, 20)}...` : 'No token',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const response = await fetch(`http://localhost:8080/api/quizzes/${quizId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Delete Response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.ok) {
          const responseText = await response.text();
          console.log('Delete Success Response:', responseText);
          setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        } else {
          const errorText = await response.text();
          console.error('Delete Error Response:', {
            status: response.status,
            statusText: response.statusText,
            errorText,
            headers: Object.fromEntries(response.headers.entries())
          });
        }
      } catch (error) {
        console.error('Error deleting quiz:', {
          message: error.message,
          stack: error.stack
        });
      }
    }
  };

  const handleEditQuiz = (quiz) => {
    console.log('Editing quiz:', quiz);
    setEditingQuiz(quiz);
    const formData = {
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map(q => ({
        text: q.text,
        points: q.points,
        answers: q.answers.map(a => ({
          text: a.text,
          correct: a.correct
        }))
      }))
    };
    console.log('Setting form data:', formData);
    setQuizForm(formData);
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      alert('Please login first');
      return;
    }

    // Log the complete token for debugging
    console.log('Full token:', token);

    const payload = {
      title: quizForm.title,
      description: quizForm.description,
      timeLimit: quizForm.timeLimit,
      questions: quizForm.questions.map(q => ({
        text: q.text,
        points: q.points,
        answers: q.answers.map(a => ({
          text: a.text,
          correct: a.correct
        }))
      }))
    };

    try {
      const url = editingQuiz 
        ? `http://localhost:8080/api/quizzes/${editingQuiz.id}`
        : 'http://localhost:8080/api/quizzes';
      
      // Log the complete request details
      console.log('Request details:', {
        url,
        method: editingQuiz ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: payload
      });
      
      const response = await fetch(url, {
        method: editingQuiz ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // Log the complete response
      console.log('Response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        setOpen(false);
        setEditingQuiz(null);
        fetchQuizzes();
        alert(editingQuiz ? 'Quiz updated successfully!' : 'Quiz created successfully!');
      } else {
        const errorText = await response.text();
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          url: response.url
        });
        throw new Error(`Failed to save quiz: ${errorText}`);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', {
        message: error.message,
        stack: error.stack,
        token: token.substring(0, 20) + '...' // Log part of the token for debugging
      });
      alert('Failed to save quiz. Please try again.');
    }
  };

  const handleCloseModal = () => {
    console.log('Closing modal, current state:', {
      editingQuiz,
      quizForm
    });
    setOpen(false);
    setEditingQuiz(null);
    setQuizForm({
      title: '',
      description: '',
      timeLimit: 30,
      questions: [createEmptyQuestion()]
    });
  };

  const handlePointsChange = (qIdx, value) => {
    const questions = [...quizForm.questions];
    questions[qIdx].points = parseInt(value) || 0;
    setQuizForm({ ...quizForm, questions });
  };

  // Handle form field changes
  const handleQuizChange = (e) => {
    setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
  };

  // Handle question text change
  const handleQuestionChange = (idx, value) => {
    const questions = [...quizForm.questions];
    questions[idx].text = value;
    setQuizForm({ ...quizForm, questions });
  };

  // Handle answer text change
  const handleAnswerChange = (qIdx, aIdx, value) => {
    const questions = [...quizForm.questions];
    questions[qIdx].answers[aIdx].text = value;
    setQuizForm({ ...quizForm, questions });
  };

  // Handle correct checkbox change
  const handleCorrectChange = (qIdx, aIdx, checked) => {
    const questions = quizForm.questions.map((q, i) => {
      if (i !== qIdx) return q;
      const answers = q.answers.map((a, j) =>
        j === aIdx ? { ...a, correct: checked } : a
      );
      return { ...q, answers };
    });
    setQuizForm({ ...quizForm, questions });
  };

  // Add new question
  const addQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, createEmptyQuestion()]
    });
  };

  // Remove question
  const removeQuestion = (idx) => {
    const questions = quizForm.questions.filter((_, i) => i !== idx);
    setQuizForm({ ...quizForm, questions });
  };

  // Add answer to a question
  const addAnswer = (qIdx) => {
    const questions = quizForm.questions.map((q, i) => {
      if (i !== qIdx) return q;
      return { ...q, answers: [...q.answers, createEmptyAnswer()] };
    });
    setQuizForm({ ...quizForm, questions });
  };

  // Remove answer from a question (minimum 2)
  const removeAnswer = (qIdx, aIdx) => {
    const questions = quizForm.questions.map((q, i) => {
      if (i !== qIdx) return q;
      if (q.answers.length <= 2) return q; // Prevent removing if only 2 left
      return { ...q, answers: q.answers.filter((_, j) => j !== aIdx) };
    });
    setQuizForm({ ...quizForm, questions });
  };

  const handleAIGenerate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        alert('Please login first');
        return;
      }

      // Log the request details for debugging
      console.log('Sending request with token:', token.substring(0, 20) + '...');
      console.log('Request payload:', aiForm);

      const response = await fetch('http://localhost:8080/api/quizzes/generate-ai-quiz', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aiForm)
      });

      // Log the response status
      console.log('Response status:', response.status);

      if (response.ok) {
        const generatedQuiz = await response.json();
        console.log('Generated quiz:', generatedQuiz);
        setQuizForm({
          title: generatedQuiz.title,
          description: generatedQuiz.description,
          timeLimit: generatedQuiz.timeLimit,
          questions: generatedQuiz.questions
        });
        setOpenAIDialog(false);
        setOpen(true);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            alert(`Failed to generate quiz: ${errorData.message}`);
          } else {
            alert('Failed to generate quiz. Please try again.');
          }
        } catch (e) {
          alert('Failed to generate quiz. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    }
  };

  // Add error boundary
  if (!quizzes) {
    console.log('Quizzes is null or undefined');
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Tableau de bord Enseignant</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Créez et gérez vos quiz
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SmartToyIcon />}
            sx={{ borderRadius: 2, fontWeight: 600, mr: 2 }}
            onClick={() => setOpenAIDialog(true)}
          >
            Générer avec l'IA
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ borderRadius: 2, fontWeight: 600 }}
            onClick={() => setOpen(true)}
          >
            Nouveau Quiz
          </Button>
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#fafbfc', borderRadius: 2, p: 2, mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          {tabLabels.map((label, idx) => (
            <Tab key={label} label={label} sx={{ fontWeight: 600, minWidth: 120 }} />
          ))}
        </Tabs>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <TextField
            size="small"
            placeholder="Rechercher un quiz..."
            sx={{ width: 300 }}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
        </Box>
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} md={4} key={quiz.id}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>{quiz.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {quiz.description}
                  </Typography>
                  <Box display="flex" gap={3} mb={1}>
                    <Typography variant="body2">
                      <b>Questions</b><br />{quiz.questions.length}
                    </Typography>
                    <Typography variant="body2">
                      <b>Score max</b><br />{quiz.questions.reduce((total, q) => total + (q.points || 0), 0)} points
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Créé le<br /><b>{new Date(quiz.dateOfCreation).toLocaleDateString()}</b>
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-start', p: 2 }}>
                  <Button 
                    startIcon={<EditIcon />} 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleEditQuiz(quiz)}
                  >
                    Modifier
                  </Button>
                 
                  <Button startIcon={<BarChartIcon />} variant="outlined" size="small">
                    Stats
                  </Button>
                  <IconButton 
                    color="error" 
                    size="small"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AddCircleOutlineIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="h6" fontWeight={700}>Créer un nouveau quiz</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Commencez à créer un nouveau quiz pour vos étudiants
                </Typography>
                <Button variant="contained" color="primary" sx={{ borderRadius: 2 }} onClick={() => setOpen(true)}>
                  Créer un Quiz
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuiz ? 'Modifier le quiz' : 'Créer un nouveau quiz'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              label="Titre"
              name="title"
              value={quizForm.title}
              onChange={handleQuizChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              name="description"
              value={quizForm.description}
              onChange={handleQuizChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Limite de temps (minutes)"
              name="timeLimit"
              type="number"
              value={quizForm.timeLimit}
              onChange={handleQuizChange}
              fullWidth
              margin="normal"
              required
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Questions</Typography>
            {quizForm.questions.map((q, qIdx) => (
              <Box key={qIdx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <TextField
                    label={`Question ${qIdx + 1}`}
                    value={q.text}
                    onChange={e => handleQuestionChange(qIdx, e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Points"
                    type="number"
                    value={q.points || 0}
                    onChange={e => handlePointsChange(qIdx, e.target.value)}
                    sx={{ width: '100px', ml: 2 }}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Box>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Réponses</Typography>
                {q.answers.map((a, aIdx) => (
                  <Box key={aIdx} display="flex" alignItems="center" gap={1} mb={1}>
                    <input
                      type="checkbox"
                      checked={a.correct}
                      onChange={e => handleCorrectChange(qIdx, aIdx, e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    <TextField
                      label={`Réponse ${aIdx + 1}`}
                      value={a.text}
                      onChange={e => handleAnswerChange(qIdx, aIdx, e.target.value)}
                      required
                    />
                    <Button
                      color="error"
                      size="small"
                      onClick={() => removeAnswer(qIdx, aIdx)}
                      disabled={q.answers.length <= 2}
                    >
                      Supprimer
                    </Button>
                  </Box>
                ))}
                <Button size="small" onClick={() => addAnswer(qIdx)}>
                  Ajouter une réponse
                </Button>
                {quizForm.questions.length > 1 && (
                  <Button color="error" size="small" onClick={() => removeQuestion(qIdx)}>
                    Supprimer la question
                  </Button>
                )}
              </Box>
            ))}
            <Button onClick={addQuestion} sx={{ mb: 2 }}>Ajouter une question</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingQuiz ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <AIGenerationDialog 
        open={openAIDialog}
        onClose={() => setOpenAIDialog(false)}
        aiForm={aiForm}
        setAiForm={setAiForm}
        onGenerate={handleAIGenerate}
      />
    </Container>
  );
} 