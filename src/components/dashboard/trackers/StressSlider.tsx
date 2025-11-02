import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface StressSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const StressSlider = ({ value, onChange }: StressSliderProps) => {
  const getEmoji = (val: number) => {
    if (val <= 2) return '😌';
    if (val <= 4) return '😊';
    if (val <= 6) return '😐';
    if (val <= 8) return '😟';
    return '😰';
  };

  const getColor = (val: number) => {
    const normalized = 1 - val / 10; // Inverted: 1 to 0
    const hue = normalized * 120; // 120 (green) to 0 (red)
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Stress</Label>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getEmoji(value)}</span>
          <span className="text-sm text-muted-foreground">{value}/10</span>
        </div>
      </div>

      <Slider
        min={0}
        max={10}
        step={1}
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        className="py-4"
        style={{
          ['--slider-color' as any]: getColor(value),
        }}
      />
    </div>
  );
};

export default StressSlider;
