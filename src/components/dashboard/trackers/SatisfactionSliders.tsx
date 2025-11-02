import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SatisfactionSlidersProps {
  processValue: number;
  resultValue: number;
  onProcessChange: (value: number) => void;
  onResultChange: (value: number) => void;
}

const SatisfactionSliders = ({
  processValue,
  resultValue,
  onProcessChange,
  onResultChange,
}: SatisfactionSlidersProps) => {
  const getEmoji = (val: number) => {
    if (val <= 2) return '😔';
    if (val <= 4) return '😐';
    if (val <= 6) return '🙂';
    if (val <= 8) return '😊';
    return '😃';
  };

  return (
    <div className="space-y-6">
      {/* Process Satisfaction */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Process Satisfaction</Label>
          <p className="text-xs text-muted-foreground mt-1">How was the process?</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl">{getEmoji(processValue)}</span>
          <span className="text-sm text-muted-foreground">{processValue}/10</span>
        </div>

        <Slider
          min={0}
          max={10}
          step={1}
          value={[processValue]}
          onValueChange={([val]) => onProcessChange(val)}
          className="py-4"
        />
      </div>

      {/* Result Satisfaction */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Result Satisfaction</Label>
          <p className="text-xs text-muted-foreground mt-1">Happy with results?</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl">{getEmoji(resultValue)}</span>
          <span className="text-sm text-muted-foreground">{resultValue}/10</span>
        </div>

        <Slider
          min={0}
          max={10}
          step={1}
          value={[resultValue]}
          onValueChange={([val]) => onResultChange(val)}
          className="py-4"
        />
      </div>
    </div>
  );
};

export default SatisfactionSliders;
