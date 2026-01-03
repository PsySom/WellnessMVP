import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  name_en: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  emoji: string;
}

interface ExerciseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Exercise | null;
  onSuccess: () => void;
}

const categories = ['breathing', 'meditation', 'relaxation', 'mindfulness', 'body'];
const difficulties = ['beginner', 'intermediate', 'advanced'];

export const ExerciseFormModal = ({ open, onOpenChange, exercise, onSuccess }: ExerciseFormModalProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    name_fr: '',
    name_ru: '',
    description: '',
    description_en: '',
    description_fr: '',
    description_ru: '',
    category: 'breathing',
    difficulty: 'beginner',
    duration_minutes: 5,
    emoji: '🧘',
    slug: '',
    effects: [] as string[],
    effects_en: [] as string[],
    effects_fr: [] as string[],
    effects_ru: [] as string[],
    instructions: { steps: [] },
    instructions_en: { steps: [] },
    instructions_fr: { steps: [] },
    instructions_ru: { steps: [] }
  });

  useEffect(() => {
    if (exercise) {
      fetchFullExercise(exercise.id);
    } else {
      resetForm();
    }
  }, [exercise, open]);

  const fetchFullExercise = async (id: string) => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (data && !error) {
      setFormData({
        name: data.name || '',
        name_en: data.name_en || '',
        name_fr: data.name_fr || '',
        name_ru: data.name_ru || '',
        description: data.description || '',
        description_en: data.description_en || '',
        description_fr: data.description_fr || '',
        description_ru: data.description_ru || '',
        category: data.category,
        difficulty: data.difficulty,
        duration_minutes: data.duration_minutes,
        emoji: data.emoji,
        slug: data.slug,
        effects: Array.isArray(data.effects) ? data.effects : [],
        effects_en: Array.isArray(data.effects_en) ? data.effects_en : [],
        effects_fr: Array.isArray(data.effects_fr) ? data.effects_fr : [],
        effects_ru: Array.isArray(data.effects_ru) ? data.effects_ru : [],
        instructions: (data.instructions && typeof data.instructions === 'object') ? data.instructions as { steps: any[] } : { steps: [] },
        instructions_en: (data.instructions_en && typeof data.instructions_en === 'object') ? data.instructions_en as { steps: any[] } : { steps: [] },
        instructions_fr: (data.instructions_fr && typeof data.instructions_fr === 'object') ? data.instructions_fr as { steps: any[] } : { steps: [] },
        instructions_ru: (data.instructions_ru && typeof data.instructions_ru === 'object') ? data.instructions_ru as { steps: any[] } : { steps: [] }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_en: '',
      name_fr: '',
      name_ru: '',
      description: '',
      description_en: '',
      description_fr: '',
      description_ru: '',
      category: 'breathing',
      difficulty: 'beginner',
      duration_minutes: 5,
      emoji: '🧘',
      slug: '',
      effects: [],
      effects_en: [],
      effects_fr: [],
      effects_ru: [],
      instructions: { steps: [] },
      instructions_en: { steps: [] },
      instructions_fr: { steps: [] },
      instructions_ru: { steps: [] }
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = formData.slug || generateSlug(formData.name_en);
      const payload = {
        ...formData,
        slug,
        name: formData.name || formData.name_en,
        effects: formData.effects.length ? formData.effects : formData.effects_en,
        instructions: Object.keys(formData.instructions).length ? formData.instructions : formData.instructions_en
      };

      if (exercise) {
        const { error } = await supabase
          .from('exercises')
          .update(payload)
          .eq('id', exercise.id);

        if (error) throw error;
        toast.success(t('admin.exercises.updated'));
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert(payload);

        if (error) throw error;
        toast.success(t('admin.exercises.created'));
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving exercise:', error);
      toast.error(error.message || t('admin.exercises.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {exercise ? t('admin.exercises.edit') : t('admin.exercises.create')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.exercises.nameEn')} *</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.exercises.nameRu')}</Label>
              <Input
                value={formData.name_ru}
                onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.exercises.nameFr')}</Label>
              <Input
                value={formData.name_fr}
                onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.exercises.emoji')}</Label>
              <Input
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                maxLength={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.exercises.descriptionEn')}</Label>
            <Textarea
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.exercises.category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.exercises.difficulty')}</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.exercises.duration')}</Label>
              <Input
                type="number"
                min={1}
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 5 })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {exercise ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
