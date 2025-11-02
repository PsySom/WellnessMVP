import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TopEmotionsProps {
  entries: any[];
}

const TopEmotions = ({ entries }: TopEmotionsProps) => {
  const emotionCounts: { [key: string]: number } = {};
  
  entries.forEach((entry) => {
    entry.tracker_emotions?.forEach((emotion: any) => {
      const key = emotion.emotion_label;
      emotionCounts[key] = (emotionCounts[key] || 0) + 1;
    });
  });

  const sortedEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCount = sortedEmotions[0]?.[1] || 1;

  const emotionEmojis: { [key: string]: string } = {
    joy: '😊',
    sadness: '😢',
    anger: '😠',
    fear: '😰',
    surprise: '😲',
    love: '❤️',
    anxiety: '😟',
    calm: '😌',
    excited: '🤩',
    tired: '😴',
  };

  if (sortedEmotions.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Your Top Emotions</h3>
      
      <div className="space-y-4">
        {sortedEmotions.map(([emotion, count], index) => {
          const percentage = Math.round((count / maxCount) * 100);
          
          return (
            <div key={emotion} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{emotionEmojis[emotion] || '💭'}</span>
                  <span className="text-sm font-medium text-foreground capitalize">{emotion}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {count} {count === 1 ? 'time' : 'times'}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TopEmotions;
