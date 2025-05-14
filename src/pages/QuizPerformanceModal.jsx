import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function QuizPerformanceModal({ open, onClose, quizPerformance }) {
  if (!quizPerformance) return null;

  const maxPoints = quizPerformance.questions
    ? quizPerformance.questions.reduce((sum, q) => sum + (q.points || 0), 0)
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Détails de Performance - {quizPerformance.quizTitle}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Résumé</Typography>
          <Box display="flex" gap={3} mb={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">Score Total</Typography>
              <Typography variant="h6">
                {quizPerformance.score} points / {maxPoints}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Date de complétion</Typography>
              <Typography variant="h6">
                {new Date(quizPerformance.completionTime).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Questions</Typography>
        <List>
          {quizPerformance.questions?.map((question, index) => (
            <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ width: '100%', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Question {index + 1}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {question.text}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Points:
                  </Typography>
                  <Typography variant="body2">
                    {question.points} points
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ width: '100%', mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Vos réponses :</Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {question.userAnswers && question.userAnswers.length > 0 ? (
                    question.userAnswers.map((answer, ansIndex) => (
                      <Box key={ansIndex} display="flex" alignItems="center" gap={1}>
                        {question.correctAnswers.includes(answer) ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                        <Typography
                          variant="body2"
                          color={question.correctAnswers.includes(answer) ? "success.main" : "error"}
                        >
                          {answer}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="error">Aucune réponse donnée</Typography>
                  )}
                </Box>
              </Box>

              {!question.isCorrect && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom color="error">
                    Réponses correctes :
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {question.correctAnswers.map((answer, ansIndex) => (
                      <Box key={ansIndex} display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="body2" color="success.main">
                          {answer}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}