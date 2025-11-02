import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TodayActivitiesCard = () => {
  const navigate = useNavigate();

  // Mock data - будет заменено на реальные данные из Supabase
  const activities = [
    { id: 1, name: 'Morning meditation', time: '09:00', completed: true, impact: 'restorative' },
    { id: 2, name: 'Workout', time: '10:30', completed: false, impact: 'restorative' },
    { id: 3, name: 'Team meeting', time: '14:00', completed: false, impact: 'draining' },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'restorative':
        return 'bg-accent';
      case 'draining':
        return 'bg-destructive';
      case 'neutral':
        return 'bg-muted';
      case 'mixed':
        return 'bg-warning';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Today's Activities</h3>
        <Button size="sm" variant="ghost" onClick={() => navigate('/calendar')}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No activities planned for today</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/calendar')}>
            Plan Your Day
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted smooth-transition"
            >
              <Checkbox checked={activity.completed} />
              <div
                className={`h-2 w-2 rounded-full ${getImpactColor(activity.impact)}`}
              />
              <div className="flex-1">
                <p className={`font-medium ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {activity.name}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="link"
        className="w-full"
        onClick={() => navigate('/calendar')}
      >
        View all activities
      </Button>
    </Card>
  );
};

export default TodayActivitiesCard;
