import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Dumbbell, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminUserStats } from './AdminUserStats';
import { AdminExercises } from './AdminExercises';
import { AdminTests } from './AdminTests';

export const AdminPanel = () => {
  const { t } = useTranslation();

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          {t('admin.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('admin.tabs.stats')}</span>
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">{t('admin.tabs.exercises')}</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">{t('admin.tabs.tests')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <AdminUserStats />
          </TabsContent>

          <TabsContent value="exercises">
            <AdminExercises />
          </TabsContent>

          <TabsContent value="tests">
            <AdminTests />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
