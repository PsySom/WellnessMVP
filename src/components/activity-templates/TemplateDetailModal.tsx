import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TemplateDetailModalProps {
  template: {
    id: string;
    name: string;
    name_en: string;
    description: string | null;
    category: string;
    impact_type: string;
    default_duration_minutes: number | null;
    emoji: string;
  } | null;
  open: boolean;
  onClose: () => void;
}

const getImpactInfo = (impactType: string) => {
  switch (impactType) {
    case 'restoring':
      return {
        label: 'Restoring',
        description: 'Helps you recover energy',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      };
    case 'depleting':
      return {
        label: 'Depleting',
        description: 'Requires energy',
        color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      };
    case 'neutral':
      return {
        label: 'Neutral',
        description: 'Balanced effect',
        color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      };
    case 'mixed':
      return {
        label: 'Mixed',
        description: 'Challenging but rewarding',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      };
    default:
      return {
        label: 'Neutral',
        description: 'Balanced effect',
        color: 'bg-muted text-muted-foreground border-border',
      };
  }
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    sleep: 'Sleep & Rest',
    nutrition: 'Nutrition',
    hydration: 'Hydration',
    exercise: 'Exercise',
    hobby: 'Hobby',
    work: 'Work',
    social: 'Social',
    practice: 'Practice',
    health: 'Health',
    reflection: 'Reflection',
    leisure: 'Leisure',
  };
  return labels[category] || category;
};

const TemplateDetailModal = ({ template, open, onClose }: TemplateDetailModalProps) => {
  const { user } = useAuth();

  const handleAddToToday = async () => {
    if (!template || !user) return;

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentTime = format(now, 'HH:mm:ss');

    try {
      const { error } = await supabase.from('activities').insert({
        title: template.name_en,
        category: template.category as any,
        impact_type: template.impact_type as any,
        duration_minutes: template.default_duration_minutes,
        date: today,
        start_time: currentTime,
        status: 'planned' as any,
        template_id: template.id,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success('Activity added to today!');
      onClose();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    }
  };

  if (!template) return null;

  const impactInfo = getImpactInfo(template.impact_type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-lg animate-scale-in">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4 md:gap-5">
            <span className="text-5xl md:text-6xl transition-transform hover:scale-110">{template.emoji}</span>
            <div className="flex-1">
              <DialogTitle className="text-xl md:text-2xl">{template.name_en}</DialogTitle>
            </div>
          </div>
          {template.description && (
            <DialogDescription className="text-sm md:text-base leading-relaxed">
              {template.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-5 md:space-y-6">
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            <div className="p-4 md:p-5 rounded-lg bg-muted/50">
              <p className="text-sm md:text-base font-medium text-muted-foreground mb-2">Category</p>
              <Badge variant="outline" className="text-sm md:text-base">{getCategoryLabel(template.category)}</Badge>
            </div>

            <div className="p-4 md:p-5 rounded-lg bg-muted/50">
              <p className="text-sm md:text-base font-medium text-muted-foreground mb-2">Impact Type</p>
              <div className="space-y-2">
                <Badge variant="outline" className={`${impactInfo.color} text-sm md:text-base`}>
                  {impactInfo.label}
                </Badge>
                <p className="text-sm md:text-base text-muted-foreground">{impactInfo.description}</p>
              </div>
            </div>
          </div>

          {template.default_duration_minutes !== null && template.default_duration_minutes > 0 && (
            <div className="p-4 md:p-5 rounded-lg bg-muted/50">
              <p className="text-sm md:text-base font-medium text-muted-foreground mb-3">Default Duration</p>
              <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                <span>{template.default_duration_minutes} minutes</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 md:gap-4 pt-6">
            <Button 
              onClick={handleAddToToday} 
              className="flex-1 gap-2 h-10 md:h-11 text-sm md:text-base hover-scale transition-all"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
              Add to today
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2 h-10 md:h-11 text-sm md:text-base hover-scale transition-all" 
              onClick={onClose}
            >
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDetailModal;
