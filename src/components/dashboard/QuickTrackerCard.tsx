import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { TrackerData } from '@/pages/Dashboard';
import MoodSlider from './trackers/MoodSlider';
import EmotionsSelector from './trackers/EmotionsSelector';
import StressSlider from './trackers/StressSlider';
import AnxietySlider from './trackers/AnxietySlider';
import EnergySlider from './trackers/EnergySlider';
import SatisfactionSliders from './trackers/SatisfactionSliders';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface QuickTrackerCardProps {
  onEntrySaved: () => void;
}

const QuickTrackerCard = ({ onEntrySaved }: QuickTrackerCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
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
        title: t('trackers.toasts.saved'),
        description: t('trackers.toasts.savedDescription'),
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
        title: t('trackers.toasts.errorSaving'),
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-lg">
        <h2 className="text-xl font-bold text-foreground mb-6">{t('trackers.title')}</h2>
        
        <Accordion type="multiple" className="space-y-4">
          {/* Секция 1: Настроение и Эмоции */}
          <AccordionItem value="mood-emotions" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="text-base font-semibold">{t('trackers.sections.moodEmotions')}</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <MoodSlider 
                value={trackerData.moodScore} 
                onChange={(value) => updateTrackerData({ moodScore: value })} 
              />
              <EmotionsSelector
                selectedEmotions={trackerData.selectedEmotions}
                onChange={(emotions) => updateTrackerData({ selectedEmotions: emotions })}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Секция 2: Состояние */}
          <AccordionItem value="state" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="text-base font-semibold">{t('trackers.sections.state')}</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
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
            </AccordionContent>
          </AccordionItem>

          {/* Секция 3: Удовлетворенность */}
          <AccordionItem value="satisfaction" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="text-base font-semibold">{t('trackers.sections.satisfaction')}</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <SatisfactionSliders
                processValue={trackerData.processSatisfaction}
                resultValue={trackerData.resultSatisfaction}
                onProcessChange={(value) => updateTrackerData({ processSatisfaction: value })}
                onResultChange={(value) => updateTrackerData({ resultSatisfaction: value })}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button 
          onClick={handleSaveEntry} 
          className="w-full mt-6 medium-transition spring-bounce hover:scale-[1.02]" 
          size="lg"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('trackers.saving')}
            </>
          ) : (
            t('trackers.save')
          )}
        </Button>
      </div>
    </Card>
  );
};

export default QuickTrackerCard;
