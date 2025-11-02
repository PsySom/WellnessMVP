import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface Emotion {
  label: string;
  emoji: string;
  category: 'negative' | 'neutral' | 'positive';
}

interface EmotionsSelectorProps {
  selectedEmotions: Array<{ label: string; intensity: number; category: string }>;
  onChange: (emotions: Array<{ label: string; intensity: number; category: string }>) => void;
}

const emotions: Emotion[] = [
  { label: 'Sad', emoji: '😢', category: 'negative' },
  { label: 'Anxious', emoji: '😰', category: 'negative' },
  { label: 'Fearful', emoji: '😨', category: 'negative' },
  { label: 'Angry', emoji: '😠', category: 'negative' },
  { label: 'Shame', emoji: '😳', category: 'negative' },
  { label: 'Guilt', emoji: '😔', category: 'negative' },
  { label: 'Calm', emoji: '😌', category: 'neutral' },
  { label: 'Curious', emoji: '🤔', category: 'neutral' },
  { label: 'Surprised', emoji: '😮', category: 'neutral' },
  { label: 'Joy', emoji: '😊', category: 'positive' },
  { label: 'Happy', emoji: '😄', category: 'positive' },
  { label: 'Inspired', emoji: '✨', category: 'positive' },
  { label: 'Grateful', emoji: '🙏', category: 'positive' },
  { label: 'Content', emoji: '😌', category: 'positive' },
];

const EmotionsSelector = ({ selectedEmotions, onChange }: EmotionsSelectorProps) => {
  const toggleEmotion = (emotion: Emotion) => {
    const existing = selectedEmotions.find((e) => e.label === emotion.label);
    
    if (existing) {
      onChange(selectedEmotions.filter((e) => e.label !== emotion.label));
    } else {
      onChange([
        ...selectedEmotions,
        { label: emotion.label, intensity: 5, category: emotion.category },
      ]);
    }
  };

  const updateIntensity = (label: string, intensity: number) => {
    onChange(
      selectedEmotions.map((e) =>
        e.label === label ? { ...e, intensity } : e
      )
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'negative':
        return 'border-destructive text-destructive bg-destructive/10';
      case 'neutral':
        return 'border-secondary text-secondary bg-secondary/10';
      case 'positive':
        return 'border-accent text-accent bg-accent/10';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Emotions</Label>

      <div className="flex flex-wrap gap-2">
        {emotions.map((emotion) => {
          const isSelected = selectedEmotions.some((e) => e.label === emotion.label);
          return (
            <button
              key={emotion.label}
              onClick={() => toggleEmotion(emotion)}
              className={cn(
                'px-3 py-2 rounded-full border-2 smooth-transition text-sm font-medium',
                'hover:scale-105',
                isSelected
                  ? getCategoryColor(emotion.category)
                  : 'border-border bg-card hover:border-primary/50'
              )}
            >
              <span className="mr-1">{emotion.emoji}</span>
              {emotion.label}
            </button>
          );
        })}
      </div>

      {/* Intensity sliders for selected emotions */}
      {selectedEmotions.length > 0 && (
        <div className="space-y-4 pt-4 border-t">
          {selectedEmotions.map((emotion) => (
            <div key={emotion.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{emotion.label}</span>
                <span className="text-sm text-muted-foreground">
                  Intensity: {emotion.intensity}/10
                </span>
              </div>
              <Slider
                min={0}
                max={10}
                step={1}
                value={[emotion.intensity]}
                onValueChange={([val]) => updateIntensity(emotion.label, val)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmotionsSelector;
