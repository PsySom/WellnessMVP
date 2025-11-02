import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';
import ProgressIndicator from './ProgressIndicator';

interface RemindersScreenProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
}

const RemindersScreen = ({ data, onUpdate, onNext, onBack, step }: RemindersScreenProps) => {
  const updateTrackerTime = (index: number, time: string) => {
    const newTimes = [...data.trackerTimes];
    newTimes[index] = time;
    onUpdate({ trackerTimes: newTimes });
  };

  const updateFrequency = (frequency: number) => {
    const currentTimes = data.trackerTimes;
    const defaultTimes = ['09:00', '21:00', '13:00', '17:00'];
    const newTimes = defaultTimes.slice(0, frequency);
    
    // Preserve existing times
    for (let i = 0; i < Math.min(currentTimes.length, frequency); i++) {
      newTimes[i] = currentTimes[i];
    }
    
    onUpdate({ trackerFrequency: frequency, trackerTimes: newTimes });
  };

  return (
    <Card className="p-8 space-y-6 animate-fade-in max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="pl-0">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Set up reminders</h2>
          <p className="text-muted-foreground">We'll help you stay consistent</p>
          <ProgressIndicator current={step} total={5} />
        </div>
      </div>

      {/* Mood Trackers Section */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground mb-2">Mood Trackers</h3>
          <Label htmlFor="frequency" className="text-sm text-muted-foreground">
            How often per day?
          </Label>
        </div>

        <Select
          value={data.trackerFrequency.toString()}
          onValueChange={(value) => updateFrequency(parseInt(value))}
        >
          <SelectTrigger id="frequency" className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            <SelectItem value="1">1 time</SelectItem>
            <SelectItem value="2">2 times</SelectItem>
            <SelectItem value="3">3 times</SelectItem>
            <SelectItem value="4">4+ times</SelectItem>
          </SelectContent>
        </Select>

        {/* Time Pickers */}
        <div className="space-y-3">
          {data.trackerTimes.map((time, index) => (
            <div key={index} className="flex items-center gap-3">
              <Label className="w-20 text-sm">
                {index === 0 ? 'Morning' : index === 1 ? 'Evening' : index === 2 ? 'Afternoon' : `Time ${index + 1}`}
              </Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => updateTrackerTime(index, e.target.value)}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reflection Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-foreground">Reflection</h3>

        {/* Morning Reflection */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="space-y-1 flex-1">
            <Label htmlFor="morning-reflection" className="cursor-pointer">
              Morning reflection
            </Label>
            {data.morningReflectionEnabled && (
              <Input
                type="time"
                value={data.morningReflectionTime}
                onChange={(e) => onUpdate({ morningReflectionTime: e.target.value })}
                className="w-32 mt-2"
              />
            )}
          </div>
          <Switch
            id="morning-reflection"
            checked={data.morningReflectionEnabled}
            onCheckedChange={(checked) => onUpdate({ morningReflectionEnabled: checked })}
          />
        </div>

        {/* Evening Reflection */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="space-y-1 flex-1">
            <Label htmlFor="evening-reflection" className="cursor-pointer">
              Evening reflection
            </Label>
            {data.eveningReflectionEnabled && (
              <Input
                type="time"
                value={data.eveningReflectionTime}
                onChange={(e) => onUpdate({ eveningReflectionTime: e.target.value })}
                className="w-32 mt-2"
              />
            )}
          </div>
          <Switch
            id="evening-reflection"
            checked={data.eveningReflectionEnabled}
            onCheckedChange={(checked) => onUpdate({ eveningReflectionEnabled: checked })}
          />
        </div>
      </div>

      {/* Action */}
      <Button onClick={onNext} className="w-full" size="lg">
        Continue
      </Button>
    </Card>
  );
};

export default RemindersScreen;
