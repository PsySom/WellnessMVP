import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';
import ProgressIndicator from './ProgressIndicator';

interface BasicInfoScreenProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
}

const BasicInfoScreen = ({ data, onUpdate, onNext, onBack, step }: BasicInfoScreenProps) => {
  const [errors, setErrors] = useState<{ fullName?: string; age?: string }>({});

  const validate = () => {
    const newErrors: { fullName?: string; age?: string } = {};

    if (!data.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }

    if (data.age !== null && (data.age < 13 || data.age > 100)) {
      newErrors.age = 'Age must be between 13 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <Card className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="pl-0">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Tell us about yourself</h2>
          <ProgressIndicator current={step} total={5} />
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={data.fullName}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
            className={errors.fullName ? 'border-destructive' : ''}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          )}
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="25"
            min={13}
            max={100}
            value={data.age || ''}
            onChange={(e) => onUpdate({ age: e.target.value ? parseInt(e.target.value) : null })}
            className={errors.age ? 'border-destructive' : ''}
          />
          {errors.age && (
            <p className="text-sm text-destructive">{errors.age}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <Label>Gender</Label>
          <RadioGroup value={data.gender} onValueChange={(value) => onUpdate({ gender: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
              <Label htmlFor="prefer_not_to_say" className="font-normal cursor-pointer">
                Prefer not to say
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Action */}
      <Button onClick={handleNext} className="w-full" size="lg">
        Continue
      </Button>
    </Card>
  );
};

export default BasicInfoScreen;
