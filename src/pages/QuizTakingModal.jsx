import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, LinearProgress, Checkbox, FormControlLabel, Pagination
} from '@mui/material';

export default function QuizTakingModal({ quiz, onClose }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(() =>
    quiz.questions.reduce((acc, q) => ({ ...acc, [q.id]: [] }), {})
  );
  const [timer, setTimer] = useState(quiz.timeLimit * 60);
  const [showConfirm, setShowConfirm] = useState(false);

  // Timer logic
  useEffect(() => {
    if (timer <= 0) { handleSubmit(); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [timer]);

  const handleCheck = (qid, aid) => {
    setAnswers(prev => {
      const arr = prev[qid] || [];
      return {
        ...prev,
        [qid]: arr.includes(aid) ? arr.filter(id => id !== aid) : [...arr, aid]
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(answers), 
      });
  
      if (response.ok) {
        alert('Quiz submitted successfully!');
      } else {
        alert('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  
    setShowConfirm(false);
    onClose();
  };

  const handlePageChange = (_, value) => setCurrent(value - 1);

  return (
    <Dialog open fullWidth maxWidth="md" onClose={onClose}>
      <DialogTitle>
        {quiz.title}
        <Box sx={{ float: 'right', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>
            {String(Math.floor(timer / 60)).padStart(2, '0')}:
            {String(timer % 60).padStart(2, '0')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {quiz.description}
        </Typography>
        <Box mb={2}>
          <Typography>
            Question {current + 1} sur {quiz.questions.length}
          </Typography>
          <LinearProgress variant="determinate" value={((current + 1) / quiz.questions.length) * 100} />
        </Box>
        <Box>
          <Typography variant="h6">{quiz.questions[current].text}</Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {quiz.questions[current].answers.map(ans => (
              <FormControlLabel
                key={ans.id}
                control={
                  <Checkbox
                    checked={answers[quiz.questions[current].id].includes(ans.id)}
                    onChange={() => handleCheck(quiz.questions[current].id, ans.id)}
                  />
                }
                label={ans.text}
              />
            ))}
          </Box>
        </Box>
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            count={quiz.questions.length}
            page={current + 1}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        {current > 0 && (
          <Button onClick={() => setCurrent(current - 1)}>Précédent</Button>
        )}
        {current < quiz.questions.length - 1 ? (
          <Button onClick={() => setCurrent(current + 1)}>Suivant</Button>
        ) : (
          <Button variant="contained" color="primary" onClick={() => setShowConfirm(true)}>
            Terminer le test
          </Button>
        )}
      </DialogActions>
      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogTitle>Confirmer la soumission</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir terminer le test ? Vous ne pourrez plus modifier vos réponses.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirm(false)}>Annuler</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
} 