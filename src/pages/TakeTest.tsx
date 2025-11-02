import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  text: string;
  options: Array<{
    value: number;
    label: string;
  }>;
}

interface Test {
  id: string;
  name_en: string;
  questions: Question[];
  scoring_info: {
    ranges: Array<{
      min: number;
      max: number;
      category: string;
      label: string;
    }>;
  };
}

const TakeTest = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTest();
  }, [slug]);

  const loadTest = async () => {
    if (!slug) return;

    const { data } = await supabase
      .from('tests')
      .select('*')
      .eq('slug', slug)
      .single();

    if (data) {
      setTest(data as unknown as Test);
    }
  };

  const handleAnswer = (value: number) => {
    if (!test) return;
    
    setAnswers({
      ...answers,
      [test.questions[currentQuestion].id]: value
    });
  };

  const goToNext = () => {
    if (!test) return;
    
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0);
  };

  const getCategory = (score: number) => {
    if (!test) return { category: '', label: '' };

    const range = test.scoring_info.ranges.find(
      r => score >= r.min && score <= r.max
    );

    return range || { category: '', label: '' };
  };

  const submitTest = async () => {
    if (!test) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Please log in to save your results', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const score = calculateScore();
    const maxScore = test.questions.reduce(
      (max, q) => max + Math.max(...q.options.map(o => o.value)),
      0
    );
    const { category } = getCategory(score);

    const { data, error } = await supabase
      .from('test_results')
      .insert({
        user_id: user.id,
        test_id: test.id,
        score,
        max_score: maxScore,
        category,
        answers: answers
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error saving results', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    toast({ title: 'Test completed!' });
    navigate(`/tests/${slug}/results/${data.id}`);
  };

  if (!test) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <p>Loading test...</p>
        </div>
      </AppLayout>
    );
  }

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const isAnswered = answers[question.id] !== undefined;
  const isLastQuestion = currentQuestion === test.questions.length - 1;
  const allAnswered = Object.keys(answers).length === test.questions.length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/tests/${slug}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {test.questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Question Card */}
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1}
              </span>
              <h2 className="text-2xl font-semibold text-foreground mt-2">
                {question.text}
              </h2>
            </div>

            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswer(parseInt(value))}
            >
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 smooth-transition cursor-pointer"
                    onClick={() => handleAnswer(option.value)}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={submitTest}
              disabled={!allAnswered || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          ) : (
            <Button
              onClick={goToNext}
              disabled={!isAnswered}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Help Text */}
        {!isAnswered && (
          <p className="text-sm text-muted-foreground text-center">
            Please select an answer to continue
          </p>
        )}
      </div>
    </AppLayout>
  );
};

export default TakeTest;
