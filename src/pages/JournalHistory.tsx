import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Filter, Download, MessageSquare } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

type FilterType = 'all' | 'morning' | 'evening' | 'free';
type DateRangeType = 'all' | 'today' | 'week' | 'month' | 'custom';

const JournalHistory = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dateRange, setDateRange] = useState<DateRangeType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, sessions, filterType, dateRange]);

  const applyFilters = () => {
    let filtered = [...sessions];

    // Apply session type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(session => session.session_type === filterType);
    }

    // Apply date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateRange === 'today') {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.started_at);
        return sessionDate >= today;
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(session => new Date(session.started_at) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(session => new Date(session.started_at) >= monthAgo);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (session) =>
          session.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.session_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  };

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

  const continueConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create new session referencing the old one
    const { error } = await supabase
      .from('journal_sessions')
      .insert({
        user_id: user.id,
        session_type: 'free',
      });

    if (error) {
      toast({ title: 'Error continuing conversation', variant: 'destructive' });
      return;
    }

    toast({ title: 'New conversation started' });
    setSelectedSession(null);
    navigate('/journal');
  };

  const exportAsText = () => {
    const text = sessions.map(session => {
      const date = new Date(session.started_at).toLocaleString();
      const type = getSessionLabel(session.session_type);
      return `\n=== ${type} Session - ${date} ===\n\n${session.preview}\n`;
    }).join('\n---\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export completed' });
    setShowExport(false);
  };

  const exportAsJSON = () => {
    const data = JSON.stringify(sessions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export completed' });
    setShowExport(false);
  };

  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('journal_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      toast({ title: 'Error deleting session', variant: 'destructive' });
      return;
    }

    toast({ title: 'Session deleted' });
    setSelectedSession(null);
    loadSessions();
  };

  const groupSessionsByDate = (sessions: Session[]) => {
    const groups: { [key: string]: Session[] } = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    sessions.forEach((session) => {
      const date = new Date(session.started_at);
      const sessionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      let dateKey: string;
      if (sessionDate.getTime() === today.getTime()) {
        dateKey = 'Today';
      } else if (sessionDate.getTime() === yesterday.getTime()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

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
          <h1 className="text-2xl font-bold text-foreground flex-1">Journal History</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExport(true)}
          >
            <Download className="h-5 w-5" />
          </Button>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : filteredSessions.length === 0 ? (
            <p className="text-center text-muted-foreground">No journal entries found</p>
          ) : (
            Object.entries(groupedSessions).map(([date, dateSessions]) => (
              <Collapsible key={date} defaultOpen className="space-y-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-lg smooth-transition">
                  <h3 className="text-sm font-semibold text-foreground">
                    {date}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {dateSessions.length} sessions
                    </Badge>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
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
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </div>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Journal Session</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
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
          <div className="flex gap-2 p-4 border-t border-border">
            <Button
              variant="default"
              className="flex-1"
              onClick={continueConversation}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Continue Conversation
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedSession && deleteSession(selectedSession)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Filter your journal entries
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 pt-6">
            <div className="space-y-3">
              <Label>Session Type</Label>
              <RadioGroup value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">All</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="morning" id="morning" />
                  <Label htmlFor="morning">🌅 Morning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evening" id="evening" />
                  <Label htmlFor="evening">🌙 Evening</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free">💬 Free</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Date Range</Label>
              <RadioGroup value={dateRange} onValueChange={(value) => setDateRange(value as DateRangeType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="date-all" />
                  <Label htmlFor="date-all">All Time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="today" id="today" />
                  <Label htmlFor="today">Today</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="week" id="week" />
                  <Label htmlFor="week">Last 7 Days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="month" />
                  <Label htmlFor="month">Last 30 Days</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              className="w-full" 
              onClick={() => {
                setShowFilters(false);
                toast({ title: 'Filters applied' });
              }}
            >
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Journal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Card className="p-4 space-y-2">
              <h3 className="font-semibold">Export as Text</h3>
              <p className="text-sm text-muted-foreground">
                Creates a readable .txt file with all your journal entries
              </p>
              <Button onClick={exportAsText} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Text File
              </Button>
            </Card>

            <Card className="p-4 space-y-2">
              <h3 className="font-semibold">Export as JSON</h3>
              <p className="text-sm text-muted-foreground">
                Full data export with metadata for backup purposes
              </p>
              <Button onClick={exportAsJSON} variant="secondary" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download JSON File
              </Button>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default JournalHistory;
