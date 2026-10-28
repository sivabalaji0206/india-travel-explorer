import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as AiIcon,
  CheckCircle as UpdatedIcon,
  Person as UserIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { plannerApi } from '../../api/plannerApi';
import { ChatTurn, TripPlanResponse } from '../../api/types';

interface ChatWidgetProps {
  stateId: number;
  currentPlan: TripPlanResponse;
  onPlanUpdated: (newPlan: TripPlanResponse) => void;
  planId?: number | null;
}

const QUICK_PROMPTS = [
  'Make Day 2 more relaxed',
  'Add more authentic vegetarian street food',
  'Swap a museum with a nature trail',
  'Keep total cost strictly under budget',
];

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  stateId,
  currentPlan,
  onPlanUpdated,
  planId,
}) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: 'assistant',
      content: `I've created your grounded itinerary for ${currentPlan.state_name}. You can ask me to swap attractions, adjust the daily pace, suggest specific foods, or re-balance your budget!`,
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [justUpdated, setJustUpdated] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userTurn: ChatTurn = { role: 'user', content: textToSend.trim() };
    const updatedHistory = [...messages, userTurn];
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);
    setJustUpdated(false);

    try {
      const response = await plannerApi.chatFollowUp({
        state_id: stateId,
        message: textToSend.trim(),
        current_plan: currentPlan,
        chat_history: updatedHistory,
        plan_id: planId,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.reply },
      ]);

      if (response.updated_plan) {
        onPlanUpdated(response.updated_plan);
        setJustUpdated(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue updating the itinerary. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 480,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          px: 2,
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <AiIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Conversational Itinerary Refinement
          </Typography>
        </Stack>
        {justUpdated && (
          <Chip
            size="small"
            icon={<UpdatedIcon sx={{ fontSize: '14px !important' }} />}
            label="Plan Refreshed"
            color="success"
            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
          />
        )}
      </Box>

      {/* Messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <Stack
              key={index}
              direction="row"
              spacing={1}
              justifyContent={isUser ? 'flex-end' : 'flex-start'}
            >
              {!isUser && (
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: theme.palette.primary.main,
                    fontSize: 14,
                  }}
                >
                  <AiIcon sx={{ fontSize: 16 }} />
                </Avatar>
              )}

              <Box
                sx={{
                  maxWidth: '80%',
                  p: 1.5,
                  borderRadius: 2.5,
                  borderBottomRightRadius: isUser ? 4 : 16,
                  borderBottomLeftRadius: !isUser ? 4 : 16,
                  backgroundColor: isUser
                    ? theme.palette.primary.main
                    : theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : '#F1F5F9',
                  color: isUser ? '#fff' : theme.palette.text.primary,
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  {msg.content}
                </Typography>
              </Box>

              {isUser && (
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: theme.palette.secondary.main,
                    fontSize: 14,
                  }}
                >
                  <UserIcon sx={{ fontSize: 16 }} />
                </Avatar>
              )}
            </Stack>
          );
        })}

        {loading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main }}>
              <AiIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Paper
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={16} color="primary" />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Grounding changes against tourism database...
              </Typography>
            </Paper>
          </Stack>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Quick Prompts */}
      <Box
        sx={{
          p: 1,
          px: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          display: 'flex',
          gap: 1,
        }}
      >
        {QUICK_PROMPTS.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            size="small"
            clickable
            disabled={loading}
            onClick={() => handleSend(prompt)}
            sx={{
              fontSize: '0.72rem',
              borderRadius: 1.5,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
        ))}
      </Box>

      {/* Input box */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          size="small"
          placeholder="Ask AI to refine places, meals, or budget..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          fullWidth
          InputProps={{
            sx: { borderRadius: 2 },
          }}
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={loading || !input.trim()}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            '&.Mui-disabled': {
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
              color: 'text.disabled',
            },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

