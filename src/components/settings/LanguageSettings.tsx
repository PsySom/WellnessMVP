import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LanguageSettingsProps {
  profile: any;
  onUpdate: (updates: any) => void;
}

export const LanguageSettings = ({
  profile,
  onUpdate,
}: LanguageSettingsProps) => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Update i18n
      await i18n.changeLanguage(languageCode);

      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({ language: languageCode })
        .eq('id', profile.id);

      if (error) throw error;

      onUpdate({ language: languageCode });
      toast.success(t('common.success'));
    } catch (error: any) {
      console.error('Error changing language:', error);
      toast.error(t('common.error'));
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t('settings.language.title')}
      </h3>
      <Label className="mb-4 block">{t('settings.language.select')}</Label>
      <RadioGroup
        value={i18n.language}
        onValueChange={handleLanguageChange}
        className="space-y-3"
      >
        {languages.map((lang) => (
          <div
            key={lang.code}
            className="flex items-center space-x-3 p-3 rounded-lg border-2 transition-all hover:border-primary/50"
            style={{
              borderColor:
                i18n.language === lang.code
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--border))',
            }}
          >
            <RadioGroupItem value={lang.code} id={lang.code} />
            <Label
              htmlFor={lang.code}
              className="flex items-center gap-3 flex-1 cursor-pointer"
            >
              <span className="text-3xl">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </Card>
  );
};
