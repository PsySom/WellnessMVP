import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const moods = [
  { value: -5, emoji: '😢', label: 'Very bad' },
  { value: -3, emoji: '😟', label: 'Bad' },
  { value: 0, emoji: '😐', label: 'Neutral' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

const MoodSlider = ({ value, onChange }: MoodSliderProps) => {
  const getColor = (val: number) => {
    const normalized = (val + 5) / 10; // 0 to 1
    const hue = normalized * 120; // 0 (red) to 120 (green)
    return `hsl(${hue}, 70%, 50%)`;
  };

  const currentMood = moods.find((m) => m.value === value) || moods[2];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Mood</Label>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentMood.emoji}</span>
          <span className="text-sm text-muted-foreground">{currentMood.label}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Slider
          min={-5}
          max={5}
          step={1}
          value={[value]}
          onValueChange={([val]) => onChange(val)}
          className="py-4"
          style={{
            ['--slider-color' as any]: getColor(value),
          }}
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => onChange(mood.value)}
              className="flex flex-col items-center gap-1 hover:text-foreground smooth-transition"
            >
              <span className="text-lg">{mood.emoji}</span>
              <span>{mood.value > 0 ? `+${mood.value}` : mood.value}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodSlider;
