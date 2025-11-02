import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Target, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfileInfoProps {
  profile: any;
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const { t } = useTranslation();

  const languageNames: Record<string, string> = {
    en: t('settings.language.en'),
    ru: t('settings.language.ru'),
    fr: t('settings.language.fr'),
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">{t('profile.info.title')}</h2>
      
      <div className="space-y-4">
        {profile.age && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t('profile.info.age')}</p>
              <p className="text-foreground">{profile.age} years old</p>
            </div>
          </div>
        )}

        {profile.gender && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t('profile.info.gender')}</p>
              <p className="text-foreground capitalize">{profile.gender}</p>
            </div>
          </div>
        )}

        {profile.goals && profile.goals.length > 0 && (
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">{t('profile.info.goals')}</p>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goal: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">{t('profile.info.language')}</p>
            <p className="text-foreground">{languageNames[profile.language] || languageNames.en}</p>
          </div>
        </div>

        {profile.bio && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">{t('profile.info.bio')}</p>
            <p className="text-foreground">{profile.bio}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
