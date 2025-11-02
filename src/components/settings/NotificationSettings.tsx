import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NotificationSettingsProps {
  profile: any;
  onUpdate: (updates: any) => void;
}

export const NotificationSettings = ({
  profile,
  onUpdate,
}: NotificationSettingsProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Push Notifications
        </h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">Enable notifications</Label>
          <Switch
            id="notifications"
            checked={profile.notifications_enabled}
            onCheckedChange={(checked) =>
              onUpdate({ notifications_enabled: checked })
            }
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Tracker Reminders
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Tracker reminders</Label>
            <Switch
              checked={profile.tracker_frequency > 0}
              onCheckedChange={(checked) =>
                onUpdate({ tracker_frequency: checked ? 2 : 0 })
              }
            />
          </div>

          {profile.tracker_frequency > 0 && (
            <>
              <div>
                <Label>Frequency per day</Label>
                <Select
                  value={profile.tracker_frequency?.toString()}
                  onValueChange={(value) =>
                    onUpdate({ tracker_frequency: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 time</SelectItem>
                    <SelectItem value="2">2 times</SelectItem>
                    <SelectItem value="3">3 times</SelectItem>
                    <SelectItem value="4">4 times</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Reminder times</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {(profile.tracker_times || []).join(', ')}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Reflection Reminders
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Morning reflection</Label>
              <p className="text-sm text-muted-foreground">
                {profile.morning_reflection_time}
              </p>
            </div>
            <Switch
              checked={profile.morning_reflection_enabled}
              onCheckedChange={(checked) =>
                onUpdate({ morning_reflection_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Evening reflection</Label>
              <p className="text-sm text-muted-foreground">
                {profile.evening_reflection_time}
              </p>
            </div>
            <Switch
              checked={profile.evening_reflection_enabled}
              onCheckedChange={(checked) =>
                onUpdate({ evening_reflection_enabled: checked })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Activity Reminders
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable activity reminders</Label>
            <Switch
              checked={profile.activity_reminders_enabled}
              onCheckedChange={(checked) =>
                onUpdate({ activity_reminders_enabled: checked })
              }
            />
          </div>

          {profile.activity_reminders_enabled && (
            <div>
              <Label>Minutes before activity</Label>
              <Select
                value={profile.activity_reminder_minutes?.toString()}
                onValueChange={(value) =>
                  onUpdate({ activity_reminder_minutes: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
