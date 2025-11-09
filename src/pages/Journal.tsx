import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Info, History, Send, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  message_type: 'user' | 'app';
  content: string;
  created_at: string;
}

type SessionType = 'morning' | 'evening' | 'free';

const Journal = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<SessionType | null>(null);
  const [scenarioStep, setScenarioStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const QUICK_REPLIES = [
    { emoji: '😔', text: t('journal.quickReplies.bothering') },
    { emoji: '😊', text: t('journal.quickReplies.goodNews') },
    { emoji: '🤔', text: t('journal.quickReplies.thinking') },
    { emoji: '✍️', text: t('journal.quickReplies.freeWriting') }
  ];

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create new free session
    const { data: session, error } = await supabase
      .from('journal_sessions')
      .insert({
        user_id: user.id,
        session_type: 'free'
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating session', variant: 'destructive' });
      return;
    }

    setSessionId(session.id);
    
    // Send initial greeting
    const greeting = {
      session_id: session.id,
      user_id: user.id,
      message_type: 'app' as const,
      content: t('journal.greetings.initial')
    };

    const { data: message } = await supabase
      .from('journal_messages')
      .insert(greeting)
      .select()
      .single();

    if (message) {
      setMessages([message as Message]);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !sessionId || isLoading) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsLoading(true);

    // Add user message
    const userMessage = {
      session_id: sessionId,
      user_id: user.id,
      message_type: 'user' as const,
      content: content.trim()
    };

    const { data: newMessage } = await supabase
      .from('journal_messages')
      .insert(userMessage)
      .select()
      .single();

    if (newMessage) {
      setMessages(prev => [...prev, newMessage as Message]);
      setInputText('');
    }

    // Handle scenario-based responses
    if (currentScenario) {
      await handleScenarioResponse(content);
    } else {
      // Free mode response
      setTimeout(async () => {
        const appMessage = {
          session_id: sessionId,
          user_id: user.id,
          message_type: 'app' as const,
          content: t('journal.greetings.thanks')
        };

        const { data: response } = await supabase
          .from('journal_messages')
          .insert(appMessage)
          .select()
          .single();

        if (response) {
          setMessages(prev => [...prev, response as Message]);
        }
        setIsLoading(false);
      }, 1000);
    }
  };

  const startScenario = async (type: SessionType) => {
    if (!sessionId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentScenario(type);
    setScenarioStep(0);

    const questions = getScenarioQuestions(type);
    
    const appMessage = {
      session_id: sessionId,
      user_id: user.id,
      message_type: 'app' as const,
      content: questions[0]
    };

    const { data: response } = await supabase
      .from('journal_messages')
      .insert(appMessage)
      .select()
      .single();

    if (response) {
      setMessages(prev => [...prev, response as Message]);
    }
  };

  const getScenarioQuestions = (type: SessionType): string[] => {
    if (type === 'morning') {
      return [
        t('journal.morningScenario.greeting'),
        t('journal.morningScenario.plans'),
        t('journal.morningScenario.intention'),
        t('journal.morningScenario.feeling'),
        t('journal.morningScenario.closing')
      ];
    } else if (type === 'evening') {
      return [
        t('journal.eveningScenario.greeting'),
        t('journal.eveningScenario.wentWell'),
        t('journal.eveningScenario.grateful'),
        t('journal.eveningScenario.improve'),
        t('journal.eveningScenario.feeling'),
        t('journal.eveningScenario.closing')
      ];
    }
    return [];
  };

  const handleScenarioResponse = async (content: string) => {
    if (!sessionId || !currentScenario) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const questions = getScenarioQuestions(currentScenario);
    const nextStep = scenarioStep + 1;

    setTimeout(async () => {
      if (nextStep < questions.length) {
        const appMessage = {
          session_id: sessionId,
          user_id: user.id,
          message_type: 'app' as const,
          content: questions[nextStep]
        };

        const { data: response } = await supabase
          .from('journal_messages')
          .insert(appMessage)
          .select()
          .single();

        if (response) {
          setMessages(prev => [...prev, response as Message]);
        }
        setScenarioStep(nextStep);

        // End scenario after final message
        if (nextStep === questions.length - 1) {
          setCurrentScenario(null);
          setScenarioStep(0);
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 lg:p-8 border-b border-border bg-card animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground animate-slide-up">{t('journal.title')}</h1>
          <div className="flex gap-2 md:gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 hover-scale transition-all">
                    <Info className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('journal.tooltipInfo')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/journal/history')}
              className="h-9 w-9 md:h-10 md:w-10 hover-scale transition-all"
            >
              <History className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 bg-background max-w-4xl mx-auto w-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex w-full animate-fade-in',
                message.message_type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] md:max-w-[70%] lg:max-w-[65%] rounded-lg px-4 md:px-5 py-2 md:py-3 shadow-sm transition-all duration-300 hover:shadow-md',
                  message.message_type === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                <p className="text-base whitespace-pre-wrap">{message.content}</p>
                <span className="text-sm opacity-70 mt-1 block">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {/* Quick Reply Chips */}
          {messages.length === 1 && !currentScenario && (
            <div className="flex flex-wrap gap-2 justify-center animate-fade-in">
              {QUICK_REPLIES.map((reply) => (
                <Button
                  key={reply.text}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply.text)}
                  className="rounded-full"
                >
                  <span className="mr-1">{reply.emoji}</span>
                  {reply.text}
                </Button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scenario Starters */}
        {!currentScenario && messages.length > 0 && (
          <div className="flex gap-2 md:gap-3 px-4 md:px-6 lg:px-8 py-2 md:py-3 border-t border-border bg-muted/30 max-w-4xl mx-auto w-full">
            <Button
              variant="secondary"
              size="default"
              onClick={() => startScenario('morning')}
              className="flex-1 hover-scale transition-all text-sm md:text-base"
            >
              🌅 {t('journal.morning')}
            </Button>
            <Button
              variant="secondary"
              size="default"
              onClick={() => startScenario('evening')}
              className="flex-1 hover-scale transition-all text-sm md:text-base"
            >
              🌙 {t('journal.evening')}
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border p-4 md:p-6 lg:p-8 bg-card max-w-4xl mx-auto w-full">
          <div className="flex gap-2 md:gap-3 items-end">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputText);
                }
              }}
              placeholder={t('journal.placeholder')}
              className="min-h-[60px] max-h-[120px] resize-none"
              maxLength={2000}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" disabled>
                      <Mic className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('journal.comingSoon')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                size="icon"
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {inputText.length}/2000 {t('journal.characters')}
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Journal;
