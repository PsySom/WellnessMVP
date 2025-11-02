import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import BasicInfoScreen from '@/components/onboarding/BasicInfoScreen';
import GoalsScreen from '@/components/onboarding/GoalsScreen';
import RemindersScreen from '@/components/onboarding/RemindersScreen';
import ReadyScreen from '@/components/onboarding/ReadyScreen';

export interface OnboardingData {
  fullName: string;
  age: number | null;
  gender: string;
  goals: string[];
  trackerFrequency: number;
  trackerTimes: string[];
  morningReflectionEnabled: boolean;
  morningReflectionTime: string;
  eveningReflectionEnabled: boolean;
  eveningReflectionTime: string;
}

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<OnboardingData>({
    fullName: user?.user_metadata?.full_name || '',
    age: null,
    gender: '',
    goals: [],
    trackerFrequency: 2,
    trackerTimes: ['09:00', '21:00'],
    morningReflectionEnabled: true,
    morningReflectionTime: '08:00',
    eveningReflectionEnabled: true,
    eveningReflectionTime: '22:00',
  });

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const goToNext = () => {
    setDirection('forward');
    setIsAnimating(true);
    setTimeout(() => {
      setStep((prev) => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const goToPrevious = () => {
    setDirection('backward');
    setIsAnimating(true);
    setTimeout(() => {
      setStep((prev) => prev - 1);
      setIsAnimating(false);
    }, 300);
  };

  const skipOnboarding = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          age: data.age,
          gender: data.gender,
          goals: data.goals,
          tracker_frequency: data.trackerFrequency,
          tracker_times: data.trackerTimes,
          morning_reflection_enabled: data.morningReflectionEnabled,
          morning_reflection_time: data.morningReflectionTime,
          evening_reflection_enabled: data.eveningReflectionEnabled,
          evening_reflection_time: data.eveningReflectionTime,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Welcome aboard!',
        description: "You're all set to begin your wellness journey.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const screens = [
    <WelcomeScreen key="welcome" onNext={goToNext} onSkip={skipOnboarding} />,
    <BasicInfoScreen
      key="basic-info"
      data={data}
      onUpdate={updateData}
      onNext={goToNext}
      onBack={goToPrevious}
      step={2}
    />,
    <GoalsScreen
      key="goals"
      data={data}
      onUpdate={updateData}
      onNext={goToNext}
      onBack={goToPrevious}
      step={3}
    />,
    <RemindersScreen
      key="reminders"
      data={data}
      onUpdate={updateData}
      onNext={goToNext}
      onBack={goToPrevious}
      step={4}
    />,
    <ReadyScreen key="ready" onComplete={completeOnboarding} />,
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden">
      <div
        className={`w-full max-w-md transition-all duration-300 ease-in-out ${
          isAnimating
            ? direction === 'forward'
              ? 'opacity-0 -translate-x-8'
              : 'opacity-0 translate-x-8'
            : 'opacity-100 translate-x-0'
        }`}
      >
        {screens[step]}
      </div>
    </div>
  );
};

export default Onboarding;
