import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Session {
  id: string;
  session_type: string;
  started_at: string;
  message_count: number;
  preview: string;
}

interface Message {
  id: string;
  message_type: 'user' | 'app';
  content: string;
  created_at: string;
}

const JournalHistory = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = sessions.filter(
        (session) =>
          session.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.session_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSessions(filtered);
    } else {
      setFilteredSessions(sessions);
    }
  }, [searchQuery, sessions]);

  const loadSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsLoading(true);

    // Get all sessions
    const { data: sessionsData } = await supabase
      .from('journal_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!sessionsData) {
      setIsLoading(false);
      return;
    }

    // Get message counts and previews for each session
    const sessionsWithDetails = await Promise.all(
      sessionsData.map(async (session) => {
        const { data: messages } = await supabase
          .from('journal_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true });

        const messageCount = messages?.length || 0;
        const preview = messages && messages.length > 0
          ? messages.find(m => m.message_type === 'user')?.content || messages[0].content
          : 'No messages';

        return {
          id: session.id,
          session_type: session.session_type,
          started_at: session.started_at,
          message_count: messageCount,
          preview: preview.slice(0, 100) + (preview.length > 100 ? '...' : '')
        };
      })
    );

    setSessions(sessionsWithDetails);
    setFilteredSessions(sessionsWithDetails);
    setIsLoading(false);
  };

  const loadSessionMessages = async (sessionId: string) => {
    const { data } = await supabase
      .from('journal_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setSessionMessages(data as Message[]);
      setSelectedSession(sessionId);
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'morning':
        return '🌅';
      case 'evening':
        return '🌙';
      default:
        return '✍️';
    }
  };

  const getSessionLabel = (type: string) => {
    switch (type) {
      case 'morning':
        return 'Morning';
      case 'evening':
        return 'Evening';
      default:
        return 'Free';
    }
  };

  const groupSessionsByDate = (sessions: Session[]) => {
    const groups: { [key: string]: Session[] } = {};

    sessions.forEach((session) => {
      const date = new Date(session.started_at);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate(filteredSessions);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/journal')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Journal History</h1>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : filteredSessions.length === 0 ? (
            <p className="text-center text-muted-foreground">No journal entries found</p>
          ) : (
            Object.entries(groupedSessions).map(([date, dateSessions]) => (
              <div key={date} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background py-2">
                  {date}
                </h3>
                <div className="space-y-2">
                  {dateSessions.map((session) => (
                    <Card
                      key={session.id}
                      className="p-4 cursor-pointer hover:bg-accent/50 smooth-transition"
                      onClick={() => loadSessionMessages(session.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">
                              {getSessionIcon(session.session_type)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {getSessionLabel(session.session_type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(session.started_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {session.preview}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {session.message_count} msgs
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Journal Session</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto space-y-4 p-4">
            {sessionMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex w-full',
                  message.message_type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2',
                    message.message_type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default JournalHistory;
