import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as AiIcon,
  CheckCircle as StepDoneIcon,
  Close as CloseIcon,
  Person as UserIcon,
  RadioButtonUnchecked as StepPendingIcon,
  Refresh as RestartIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { plannerApi } from '../../api/plannerApi';
import { plansApi } from '../../api/plansApi';
import {
  BudgetLevel,
  ChatRole,
  ChatTurn,
  FoodType,
  PlaceCategory,
  SavedPlanDetail,
  State,
  TripPlanRequest,
  TripPlanResponse,
} from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import { ChatItineraryCard } from './ChatItineraryCard';

interface PlannerModalProps {
  open: boolean;
  onClose: () => void;
  initialStateId?: number | null;
  initialSavedPlan?: SavedPlanDetail | null;
  onPlanSaved?: () => void;
  onPlanGenerated?: (plan: TripPlanResponse) => void;
  states: State[];
  onOpenAuth: () => void;
}

interface ChatMessageItem {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  isItineraryCard?: boolean;
  quickReplies?: string[];
  showGenerateButton?: boolean;
}

interface ReasoningStep {
  label: string;
  detail: string;
  status: 'pending' | 'active' | 'done';
}

const DEFAULT_STARTER_PROMPTS = [
  'Plan a 3-day beach trip to Goa under ₹15,000',
  '4 days in Kerala with backwaters & vegetarian food',
  'Explore Rajasthan forts & heritage for 5 days',
  'Weekend hill station trip to Himachal Pradesh',
];

export const PlannerModal: React.FC<PlannerModalProps> = ({
  open,
  onClose,
  initialStateId,
  initialSavedPlan,
  onPlanSaved,
  onPlanGenerated,
  states,
  onOpenAuth,
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  // Conversational State & Entities
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted Trip Parameters (start null so AI asks naturally step-by-step)
  const [stateId, setStateId] = useState<number | null>(initialStateId || null);
  const [stateName, setStateName] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number | null>(null);
  const [totalBudget, setTotalBudget] = useState<number | null>(null);
  const [budgetTier, setBudgetTier] = useState<BudgetLevel>('medium');
  const [foodPreference, setFoodPreference] = useState<FoodType | null>(null);
  const [travelMonth, setTravelMonth] = useState<string | null>(null);
  const [interests, setInterests] = useState<PlaceCategory[]>([]);
  const [isReadyToGenerate, setIsReadyToGenerate] = useState<boolean>(false);

  // Reasoning Pipeline Steps
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);

  // Generated Plan & Saved State
  const [plan, setPlan] = useState<TripPlanResponse | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, reasoningSteps, isProcessing, isGenerating]);

  // Initialize or Reset the conversation
  const initConversation = (preselectedId?: number | null) => {
    setError(null);
    setToastMessage(null);
    setPlan(null);
    setSavedPlanId(null);
    setUserInput('');
    setIsProcessing(false);
    setIsGenerating(false);
    setReasoningSteps([]);
    setDurationDays(null);
    setTotalBudget(null);
    setBudgetTier('medium');
    setFoodPreference(null);
    setTravelMonth(null);
    setInterests([]);

    const matchedState = preselectedId
      ? states.find((s) => s.id === preselectedId)
      : null;

    if (matchedState) {
      setStateId(matchedState.id);
      setStateName(matchedState.name);
      setIsReadyToGenerate(false);
      setChatMessages([
        {
          id: 'init-greet-state',
          role: 'assistant',
          content: `Namaste! I'm your AI Travel Concierge. I see you want to explore **${matchedState.name}** (${matchedState.place_count} verified attractions & authentic cuisine).\n\nHow many days are you planning for this trip, and what kind of **trip vibe** excites you (e.g., Spiritual & Temples, Beaches & Coastal, Hills & Nature, or Heritage)?`,
          quickReplies: [
            '4 Days • Spiritual & Temples',
            '4 Days • Beaches & Hills',
            '3 Days • Heritage & History',
            '5 Days • All-Round Mix',
          ],
        },
      ]);
    } else {
      setStateId(null);
      setStateName('');
      setIsReadyToGenerate(false);
      setChatMessages([
        {
          id: 'init-greet-general',
          role: 'assistant',
          content:
            "Namaste! I'm your AI Travel Concierge. Tell me where you'd like to travel in India, or describe your dream trip in your own words (e.g. destination, duration, budget, or preferred vibe)!",
          quickReplies: [
            'Goa for 3 days',
            'Kerala backwaters for 4 days',
            'Rajasthan forts for 5 days',
            'Himachal hill stations',
          ],
        },
      ]);
    }
  };

  // Hydrate modal with an existing saved itinerary when opened via "View & Chat"
  const loadSavedPlan = (savedDetail: SavedPlanDetail) => {
    setError(null);
    setToastMessage(null);
    setUserInput('');
    setIsProcessing(false);
    setIsGenerating(false);
    setReasoningSteps([]);
    setIsReadyToGenerate(false);

    const savedTrip = savedDetail.plan_json;
    setPlan(savedTrip);
    setSavedPlanId(savedDetail.id);
    setStateId(savedDetail.state_id);
    setStateName(savedDetail.state_name || savedTrip.state_name);
    setDurationDays(savedTrip.total_days);
    setTotalBudget(Number(savedTrip.total_budget));

    const prefs = savedDetail.preferences || {};
    if (typeof prefs.budget_tier === 'string') {
      setBudgetTier(prefs.budget_tier as BudgetLevel);
    }
    if (typeof prefs.food_preference === 'string') {
      setFoodPreference(prefs.food_preference as FoodType);
    } else {
      setFoodPreference(null);
    }

    let restoredInterests: PlaceCategory[] = [];
    if (Array.isArray(prefs.interests)) {
      restoredInterests = prefs.interests as PlaceCategory[];
    }
    setInterests(restoredInterests);

    const daySummaryLines = savedTrip.days
      .map((d) => {
        const stops = d.places.map((p) => p.place_name).join(', ');
        const dining = d.meals && d.meals.length > 0 ? ` | *Dining: ${d.meals[0].dish_name}*` : '';
        return `• **Day ${d.day_number} – ${d.destination_name} (₹${Math.round(Number(d.day_budget)).toLocaleString()}):** ${stops}${dining}`;
      })
      .join('\n');

    setChatMessages([
      {
        id: `saved-intro-${savedDetail.id}`,
        role: 'assistant',
        content: `Welcome back! Here is your saved itinerary **${savedDetail.title}** for **${savedDetail.state_name || savedTrip.state_name}** (${savedTrip.total_days} Days • Est. Total: **₹${Math.round(Number(savedTrip.budget_breakdown.total_estimated_cost || savedTrip.total_budget)).toLocaleString()}**):\n\n${daySummaryLines}`,
      },
      {
        id: `saved-card-${savedDetail.id}`,
        role: 'assistant',
        content: '',
        isItineraryCard: true,
      },
      {
        id: `saved-fup-${savedDetail.id}`,
        role: 'assistant',
        content:
          "Your saved itinerary is open above! You can switch between **Day Tabs**, view the **Overview**, or ask me to refine anything below (e.g. **'Make Day 2 more relaxed'**, **'Show another regional circuit'**, or **'Keep cost under budget'**).",
        quickReplies: getDynamicFollowUpChips(restoredInterests),
      },
    ]);
  };

  useEffect(() => {
    if (open) {
      if (initialSavedPlan) {
        loadSavedPlan(initialSavedPlan);
      } else if (states.length > 0) {
        initConversation(initialStateId);
      }
    }
  }, [open, initialStateId, initialSavedPlan, states.length]);

  // Conversational message handler using /planner/converse
  const handleUserMessage = async (messageText: string) => {
    const text = messageText.trim();
    if (!text || isProcessing || isGenerating) return;

    setUserInput('');
    setError(null);

    // If an itinerary already exists, treat as follow-up refinement
    if (plan) {
      await handleFollowUpChat(text);
      return;
    }

    // Append user message to chat stream
    const userMsg: ChatMessageItem = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setIsProcessing(true);

    // Build chat history turns
    const historyTurns: ChatTurn[] = updatedMessages
      .filter((m) => !m.isItineraryCard)
      .map((m) => ({
        role: m.role as ChatRole,
        content: m.content,
      }));

    try {
      const assistantRes = await plannerApi.converse({
        message: text,
        chat_history: historyTurns,
        state_id: stateId,
        duration_days: durationDays,
        total_budget: totalBudget,
        budget_tier: budgetTier,
        food_preference: foodPreference,
        travel_month: travelMonth,
        interests: interests,
      });

      // Update extracted entities
      if (assistantRes.state_id) {
        setStateId(assistantRes.state_id);
      }
      if (assistantRes.state_name) {
        setStateName(assistantRes.state_name);
      }
      if (assistantRes.duration_days) {
        setDurationDays(assistantRes.duration_days);
      }
      if (assistantRes.total_budget) {
        setTotalBudget(Number(assistantRes.total_budget));
      }
      if (assistantRes.budget_tier) {
        setBudgetTier(assistantRes.budget_tier);
      }
      // Preserve null when user chooses Mixed (both Veg & Non-Veg)
      setFoodPreference(assistantRes.food_preference ?? null);
      if (assistantRes.travel_month) {
        setTravelMonth(assistantRes.travel_month);
      }
      if (assistantRes.interests && assistantRes.interests.length > 0) {
        setInterests(assistantRes.interests);
      }

      const ready = Boolean(assistantRes.is_ready_to_generate && assistantRes.state_id);
      setIsReadyToGenerate(ready);

      const cleanedReplies = (assistantRes.suggested_quick_replies || []).filter(
        (q) => !(ready && q.toLowerCase().includes('generate itinerary'))
      );

      // Append bot response
      setChatMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'assistant',
          content: assistantRes.reply,
          quickReplies: cleanedReplies,
          showGenerateButton: ready,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `b-err-${Date.now()}`,
          role: 'assistant',
          content: "I'm having trouble processing that right now. Please tell me your destination state and number of days!",
          quickReplies: ['Kerala', 'Goa', 'Rajasthan', 'Andhra Pradesh'],
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDynamicFollowUpChips = (activeInterests: PlaceCategory[]): string[] => {
    const chips: string[] = ['Show another regional circuit'];
    const isTemple = activeInterests.includes('temple') && activeInterests.length <= 2;
    const isBeach = activeInterests.includes('beach') && activeInterests.length <= 2;
    const isHills =
      (activeInterests.includes('hill_station') || activeInterests.includes('nature')) &&
      activeInterests.length <= 2;

    if (isTemple) {
      chips.push('Switch to Hills & Nature circuit', 'Switch to Beaches & Coastal circuit');
    } else if (isBeach) {
      chips.push('Switch to Hills & Nature circuit', 'Switch to Spiritual & Temple circuit');
    } else if (isHills) {
      chips.push('Switch to Spiritual & Temple circuit', 'Switch to Beaches & Coastal circuit');
    } else {
      chips.push('Switch to Spiritual & Temple circuit', 'Switch to Hills & Nature circuit');
    }
    chips.push('Make Day 2 more relaxed', 'Keep cost under budget');
    return chips.slice(0, 4);
  };

  // Follow-up chat refinement handler
  const handleFollowUpChat = async (messageText: string) => {
    if (!plan) return;
    setIsProcessing(true);

    const userMsg: ChatMessageItem = {
      id: `u-fup-${Date.now()}`,
      role: 'user',
      content: messageText,
    };
    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);

    const chatTurns: ChatTurn[] = updatedHistory
      .filter((m) => !m.isItineraryCard)
      .map((m) => ({ role: m.role as ChatRole, content: m.content }));

    try {
      const response = await plannerApi.chatFollowUp({
        state_id: plan.state_id,
        message: messageText,
        current_plan: plan,
        chat_history: chatTurns,
        plan_id: savedPlanId,
      });

      const msgLower = messageText.toLowerCase();
      let nextInterests = interests;
      if (msgLower.includes('temple') || msgLower.includes('spiritual')) {
        nextInterests = ['temple'];
        setInterests(nextInterests);
      } else if (msgLower.includes('hill') || msgLower.includes('nature')) {
        nextInterests = ['hill_station', 'nature'];
        setInterests(nextInterests);
      } else if (msgLower.includes('beach') || msgLower.includes('coast')) {
        nextInterests = ['beach'];
        setInterests(nextInterests);
      }

      if (response.updated_plan) {
        setPlan(response.updated_plan);
        setSavedPlanId(null);
        setChatMessages((prev) => [
          ...prev.filter((m) => !m.isItineraryCard),
          {
            id: `b-card-${Date.now()}`,
            role: 'assistant',
            content: '',
            isItineraryCard: true,
          },
          {
            id: `b-fup-${Date.now() + 1}`,
            role: 'assistant',
            content: response.reply,
            quickReplies: getDynamicFollowUpChips(nextInterests),
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `b-fup-${Date.now()}`,
            role: 'assistant',
            content: response.reply,
            quickReplies: getDynamicFollowUpChips(nextInterests),
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `b-fup-err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue updating the itinerary. Please try again.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Plan Generation with Visual Agent Reasoning Pipeline
  const handleGeneratePlan = async () => {
    const finalStateId = stateId || states[0]?.id || 1;
    const finalStateObj = states.find((s) => s.id === finalStateId);
    const targetStateLabel = stateName || finalStateObj?.name || 'India';
    const resolvedDays = durationDays || 3;
    const resolvedBudget = totalBudget || resolvedDays * 4500;

    setIsGenerating(true);
    setError(null);

    // Initialize Reasoning Steps
    const steps: ReasoningStep[] = [
      {
        label: 'Verified Landmarks Lookup',
        detail: `Finding curated attractions and hidden gems across ${targetStateLabel}...`,
        status: 'active',
      },
      {
        label: 'Smart Route Clustering',
        detail: 'Grouping nearby sights into realistic daily travel circuits...',
        status: 'pending',
      },
      {
        label: 'Ticket Fees & Regional Dining',
        detail: 'Matching official entry fees and authentic local specialties...',
        status: 'pending',
      },
      {
        label: 'Itinerary & Budget Curation',
        detail: `Crafting your ${resolvedDays}-day schedule within ₹${resolvedBudget.toLocaleString()}...`,
        status: 'pending',
      },
    ];
    setReasoningSteps(steps);

    // Progressive step animations
    const stepTimer1 = setTimeout(() => {
      setReasoningSteps((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, status: 'done' } : i === 1 ? { ...s, status: 'active' } : s
        )
      );
    }, 700);

    const stepTimer2 = setTimeout(() => {
      setReasoningSteps((prev) =>
        prev.map((s, i) =>
          i <= 1 ? { ...s, status: 'done' } : i === 2 ? { ...s, status: 'active' } : s
        )
      );
    }, 1500);

    const stepTimer3 = setTimeout(() => {
      setReasoningSteps((prev) =>
        prev.map((s, i) =>
          i <= 2 ? { ...s, status: 'done' } : i === 3 ? { ...s, status: 'active' } : s
        )
      );
    }, 2200);

    const payload: TripPlanRequest = {
      state_id: Number(finalStateId),
      duration_days: resolvedDays,
      total_budget: resolvedBudget,
      budget_tier: budgetTier,
      food_preference: foodPreference,
      travel_month: travelMonth,
      interests: interests.length > 0 ? interests : undefined,
    };

    try {
      const generated = await plannerApi.generatePlan(payload);

      // Finish all steps
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setReasoningSteps((prev) => prev.map((s) => ({ ...s, status: 'done' })));

      setTimeout(() => {
        setPlan(generated);
        setIsGenerating(false);
        setReasoningSteps([]);

        if (onPlanGenerated) {
          onClose();
          onPlanGenerated(generated);
          return;
        }

        // Append generated Itinerary Card directly into chat stream
        setChatMessages((prev) => [
          ...prev,
          {
            id: `b-card-${Date.now()}`,
            role: 'assistant',
            content: '',
            isItineraryCard: true,
          },
          {
            id: `b-fup-prompt-${Date.now() + 1}`,
            role: 'assistant',
            content:
              "Your personalized itinerary is ready above! You can explore the **Day Tabs** or view the full **Overview**. Feel free to ask me any changes, like **'Make Day 2 more relaxed'**, **'Show another regional circuit'**, or **'Keep total cost strictly under budget'**.",
            quickReplies: getDynamicFollowUpChips(interests),
          },
        ]);
      }, 500);
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsGenerating(false);
      setReasoningSteps([]);
      const msg = err instanceof Error ? err.message : 'Failed to generate trip plan. Please try again.';
      setError(msg);
    }
  };

  const handleSavePlan = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (!plan) return;

    setSaving(true);
    try {
      const saved = await plansApi.savePlan({
        state_id: plan.state_id,
        title: plan.trip_title,
        preferences: {
          duration_days: durationDays || plan.total_days,
          budget_tier: budgetTier,
          food_preference: foodPreference,
          interests,
        },
        plan_json: plan,
      });
      setSavedPlanId(saved.id);
      setToastMessage('Itinerary successfully saved to My Plans!');
      onPlanSaved?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setToastMessage(`Failed to save: ${err.message}`);
      } else {
        setToastMessage('Failed to save itinerary.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Helper for bold markdown formatting
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <Typography
          key={lineIdx}
          variant="body2"
          sx={{ lineHeight: 1.6, mb: lineIdx < text.split('\n').length - 1 ? 0.75 : 0 }}
        >
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <Box component="span" key={i} sx={{ fontWeight: 800 }}>
                  {part.slice(2, -2)}
                </Box>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <Box component="span" key={i} sx={{ fontStyle: 'italic', fontWeight: 600 }}>
                  {part.slice(1, -1)}
                </Box>
              );
            }
            return part;
          })}
        </Typography>
      );
    });
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          height: '86vh',
          maxHeight: 900,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* 1. Header */}
      <DialogTitle
        sx={{
          py: 1.75,
          px: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(224, 93, 56, 0.3)',
            }}
          >
            <AiIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              AI Travel Concierge
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {stateName
                ? `Exploring ${stateName} • 468+ Verified Attractions & Authentic Dining`
                : 'Intelligent Conversational Travel Planner across India'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          {stateName && (
            <Chip
              size="small"
              label={`📍 ${stateName}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, display: { xs: 'none', sm: 'flex' } }}
            />
          )}

          <IconButton
            size="small"
            title="Start New Conversation"
            onClick={() => initConversation(null)}
            disabled={isProcessing || isGenerating}
          >
            <RestartIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* 2. Chat Stream */}
      <DialogContent
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {chatMessages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isLatest = idx === chatMessages.length - 1;

          // Render Itinerary Card
          if (msg.isItineraryCard && plan) {
            return (
              <Box key={msg.id} sx={{ my: 1 }}>
                <ChatItineraryCard
                  plan={plan}
                  savedPlanId={savedPlanId}
                  saving={saving}
                  onSavePlan={handleSavePlan}
                  onResetPlan={() => initConversation(null)}
                />
              </Box>
            );
          }

          return (
            <Box key={msg.id}>
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent={isUser ? 'flex-end' : 'flex-start'}
                alignItems="flex-start"
              >
                {!isUser && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.primary.main,
                      mt: 0.5,
                    }}
                  >
                    <AiIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}

                <Box
                  sx={{
                    maxWidth: { xs: '88%', sm: '80%' },
                    p: 1.85,
                    px: 2.25,
                    borderRadius: 3,
                    borderTopLeftRadius: !isUser ? 4 : 18,
                    borderTopRightRadius: isUser ? 4 : 18,
                    backgroundColor: isUser
                      ? theme.palette.primary.main
                      : theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.06)'
                      : '#F1F5F9',
                    color: isUser ? '#fff' : theme.palette.text.primary,
                    boxShadow: isUser ? '0 4px 12px rgba(224, 93, 56, 0.25)' : 'none',
                  }}
                >
                  {renderFormattedText(msg.content)}
                </Box>

                {isUser && (
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: theme.palette.secondary.main,
                      mt: 0.5,
                    }}
                  >
                    <UserIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
              </Stack>

              {/* Action Buttons & Quick Reply Chips under Latest Bot Message */}
              {isLatest && !isProcessing && !isGenerating && !plan && (
                <Box sx={{ pl: { xs: 0, sm: 6 }, mt: 1.5 }}>
                  <Stack spacing={1.5}>
                    {msg.showGenerateButton && (
                      <Box>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AiIcon />}
                          onClick={handleGeneratePlan}
                          sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 2.5,
                            fontWeight: 800,
                            boxShadow: '0 6px 18px rgba(224, 93, 56, 0.35)',
                          }}
                        >
                          Generate Custom Itinerary for {stateName || 'Trip'}
                        </Button>
                      </Box>
                    )}

                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                        {msg.quickReplies.map((reply, rIdx) => (
                          <Chip
                            key={rIdx}
                            label={reply}
                            onClick={() => {
                              if (reply.toLowerCase().includes('generate itinerary')) {
                                handleGeneratePlan();
                              } else {
                                handleUserMessage(reply);
                              }
                            }}
                            clickable
                            color="primary"
                            variant="outlined"
                            sx={{
                              borderRadius: 2,
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              '&:hover': {
                                backgroundColor: `${theme.palette.primary.main}15`,
                              },
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Box>
              )}

              {/* Follow-up quick replies under prompt */}
              {isLatest && !isProcessing && !isGenerating && plan && msg.quickReplies && (
                <Box sx={{ pl: { xs: 0, sm: 6 }, mt: 1.25 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    {msg.quickReplies.map((reply, rIdx) => (
                      <Chip
                        key={rIdx}
                        label={reply}
                        onClick={() => handleUserMessage(reply)}
                        clickable
                        size="small"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          );
        })}

        {/* 3. Visual Agent Reasoning Progress Box */}
        {isGenerating && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
              border: `1.5px solid ${theme.palette.primary.main}40`,
              boxShadow: '0 6px 20px rgba(224, 93, 56, 0.1)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <CircularProgress size={20} color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                AI Travel Agent Reasoning Pipeline Active
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              {reasoningSteps.map((step, sIdx) => {
                const isDone = step.status === 'done';
                const isActive = step.status === 'active';

                return (
                  <Stack key={sIdx} direction="row" spacing={1.5} alignItems="flex-start">
                    {isDone ? (
                      <StepDoneIcon color="success" sx={{ fontSize: 18, mt: 0.2 }} />
                    ) : isActive ? (
                      <CircularProgress size={16} color="primary" sx={{ mt: 0.3 }} />
                    ) : (
                      <StepPendingIcon sx={{ fontSize: 18, color: 'text.disabled', mt: 0.2 }} />
                    )}

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive || isDone ? 700 : 500,
                          color: isDone ? 'text.primary' : isActive ? theme.palette.primary.main : 'text.disabled',
                        }}
                      >
                        {step.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {step.detail}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        )}

        {/* Assistant Thinking Spinner */}
        {isProcessing && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              <AiIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Paper
              sx={{
                p: 1.5,
                px: 2,
                borderRadius: 2.5,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CircularProgress size={16} color="primary" />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Thinking...
              </Typography>
            </Paper>
          </Stack>
        )}

        <div ref={chatEndRef} />
      </DialogContent>

      {/* 4. Sticky Bottom Chat Input Bar */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleUserMessage(userInput);
        }}
        sx={{
          p: 1.75,
          px: 2.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          fullWidth
          disabled={isProcessing || isGenerating}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={
            plan
              ? 'Ask to refine places, meals, or budget (e.g. "make Day 2 more relaxed")...'
              : stateName
              ? `Tell me duration, budget, or dining preferences for ${stateName}...`
              : 'Tell me your dream trip (e.g. "4 days in Kerala with nature under 20k")...'
          }
          InputProps={{
            sx: {
              borderRadius: 2.5,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={isProcessing || isGenerating || !userInput.trim()}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            '&:hover': { backgroundColor: theme.palette.primary.dark },
            '&.Mui-disabled': {
              backgroundColor: theme.palette.action.disabledBackground,
            },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Dialog>
  );
};
