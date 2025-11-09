import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import TemplateCard from '@/components/activity-templates/TemplateCard';
import CategoryFilter from '@/components/activity-templates/CategoryFilter';
import TemplateDetailModal from '@/components/activity-templates/TemplateDetailModal';

interface ActivityTemplate {
  id: string;
  name: string;
  name_en: string;
  name_fr: string;
  description: string | null;
  category: string;
  impact_type: string;
  default_duration_minutes: number | null;
  emoji: string;
  is_system: boolean;
}

const ActivityTemplates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['activity-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('name_en', { ascending: true });
      
      if (error) throw error;
      return data as ActivityTemplate[];
    },
  });

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        <div className="space-y-md lg:space-y-lg">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">Activity Templates</h1>
          
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <div>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No templates found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => setSelectedTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>

        <TemplateDetailModal
          template={selectedTemplate}
          open={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      </div>
    </AppLayout>
  );
};

export default ActivityTemplates;
