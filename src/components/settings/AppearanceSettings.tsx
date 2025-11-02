import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Palette } from 'lucide-react';

interface AppearanceSettingsProps {
  profile: any;
  onUpdate: (updates: any) => void;
}

export const AppearanceSettings = ({
  profile,
  onUpdate,
}: AppearanceSettingsProps) => {
  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto (System)' },
  ];

  const colorSchemes = [
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
  ];

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Theme</h3>
        <RadioGroup
          value={profile.theme}
          onValueChange={(value) => onUpdate({ theme: value })}
        >
          {themes.map((theme) => (
            <div key={theme.value} className="flex items-center space-x-2">
              <RadioGroupItem value={theme.value} id={theme.value} />
              <Label htmlFor={theme.value}>{theme.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Color Scheme
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.value}
              onClick={() => onUpdate({ color_scheme: scheme.value })}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                profile.color_scheme === scheme.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${scheme.color}`} />
              <span className="font-medium">{scheme.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Font Size</h3>
        <RadioGroup
          value={profile.font_size}
          onValueChange={(value) => onUpdate({ font_size: value })}
        >
          {fontSizes.map((size) => (
            <div key={size.value} className="flex items-center space-x-2">
              <RadioGroupItem value={size.value} id={size.value} />
              <Label htmlFor={size.value}>{size.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Accessibility
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>High contrast mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={profile.high_contrast}
              onCheckedChange={(checked) =>
                onUpdate({ high_contrast: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Reduce motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              checked={profile.reduce_motion}
              onCheckedChange={(checked) =>
                onUpdate({ reduce_motion: checked })
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
