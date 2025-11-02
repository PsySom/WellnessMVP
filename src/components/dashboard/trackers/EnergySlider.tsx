import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface EnergySliderProps {
  value: number;
  onChange: (value: number) => void;
}

const EnergySlider = ({ value, onChange }: EnergySliderProps) => {
  const getEmoji = (val: number) => {
    if (val <= -3) return '😴';
    if (val <= -1) return '😪';
    if (val <= 1) return '😐';
    if (val <= 3) return '😊';
    return '⚡';
  };

  const getLabel = (val: number) => {
    if (val <= -3) return 'Very tired';
    if (val <= -1) return 'Tired';
    if (val <= 1) return 'Neutral';
    if (val <= 3) return 'Energetic';
    return 'Very energetic';
  };

  const getColor = (val: number) => {
    const normalized = (val + 5) / 10;
    const hue = normalized * 120;
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Energy</Label>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getEmoji(value)}</span>
          <span className="text-sm text-muted-foreground">{getLabel(value)}</span>
        </div>
      </div>

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
        <span>Very tired</span>
        <span>Neutral</span>
        <span>Very energetic</span>
      </div>
    </div>
  );
};

export default EnergySlider;
