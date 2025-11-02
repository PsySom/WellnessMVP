import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { TrackerData } from '@/pages/Dashboard';
import MoodSlider from './trackers/MoodSlider';
import EmotionsSelector from './trackers/EmotionsSelector';
import StressSlider from './trackers/StressSlider';
import AnxietySlider from './trackers/AnxietySlider';
import EnergySlider from './trackers/EnergySlider';
import SatisfactionSliders from './trackers/SatisfactionSliders';
import { cn } from '@/lib/utils';

interface QuickTrackerCardProps {
  onEntrySaved: () => void;
}

const QuickTrackerCard = ({ onEntrySaved }: QuickTrackerCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [trackerData, setTrackerData] = useState<TrackerData>({
    moodScore: 0,
    selectedEmotions: [],
    stressLevel: 5,
    anxietyLevel: 5,
    energyLevel: 0,
    processSatisfaction: 5,
    resultSatisfaction: 5,
  });

  const updateTrackerData = (updates: Partial<TrackerData>) => {
    setTrackerData((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveEntry = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const now = new Date();
      const entryDate = now.toISOString().split('T')[0];
      const entryTime = now.toTimeString().split(' ')[0];

      // Insert tracker entry
      const { data: entry, error: entryError } = await supabase
        .from('tracker_entries')
        .insert({
          user_id: user.id,
          entry_date: entryDate,
          entry_time: entryTime,
          mood_score: trackerData.moodScore,
          stress_level: trackerData.stressLevel,
          anxiety_level: trackerData.anxietyLevel,
          energy_level: trackerData.energyLevel,
          process_satisfaction: trackerData.processSatisfaction,
          result_satisfaction: trackerData.resultSatisfaction,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // Insert emotions if any selected
      if (trackerData.selectedEmotions.length > 0 && entry) {
        const emotions = trackerData.selectedEmotions.map((emotion) => ({
          tracker_entry_id: entry.id,
          emotion_label: emotion.label,
          intensity: emotion.intensity,
          category: emotion.category,
        }));

        const { error: emotionsError } = await supabase
          .from('tracker_emotions')
          .insert(emotions);

        if (emotionsError) throw emotionsError;
      }

      toast({
        title: 'Entry saved!',
        description: 'Your mood has been tracked successfully.',
      });

      // Reset form
      setTrackerData({
        moodScore: 0,
        selectedEmotions: [],
        stressLevel: 5,
        anxietyLevel: 5,
        energyLevel: 0,
        processSatisfaction: 5,
        resultSatisfaction: 5,
      });

      onEntrySaved();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error saving entry',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-muted/50 smooth-transition"
      >
        <div className="text-left">
          <h2 className="text-xl font-bold text-foreground">How are you feeling?</h2>
          <p className="text-sm text-muted-foreground">{currentTime}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <div
        className={cn(
          'overflow-hidden smooth-transition',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-6 pt-0 space-y-8">
          <MoodSlider 
            value={trackerData.moodScore} 
            onChange={(value) => updateTrackerData({ moodScore: value })} 
          />

          <EmotionsSelector
            selectedEmotions={trackerData.selectedEmotions}
            onChange={(emotions) => updateTrackerData({ selectedEmotions: emotions })}
          />

          <StressSlider 
            value={trackerData.stressLevel} 
            onChange={(value) => updateTrackerData({ stressLevel: value })} 
          />

          <AnxietySlider 
            value={trackerData.anxietyLevel} 
            onChange={(value) => updateTrackerData({ anxietyLevel: value })} 
          />

          <EnergySlider 
            value={trackerData.energyLevel} 
            onChange={(value) => updateTrackerData({ energyLevel: value })} 
          />

          <SatisfactionSliders
            processValue={trackerData.processSatisfaction}
            resultValue={trackerData.resultSatisfaction}
            onProcessChange={(value) => updateTrackerData({ processSatisfaction: value })}
            onResultChange={(value) => updateTrackerData({ resultSatisfaction: value })}
          />

          <Button 
            onClick={handleSaveEntry} 
            className="w-full" 
            size="lg"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Entry'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuickTrackerCard;
