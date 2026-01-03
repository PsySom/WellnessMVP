import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Test {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  total_questions: number;
  duration_minutes: number | null;
}

interface TestFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: Test | null;
  onSuccess: () => void;
}

export const TestFormModal = ({ open, onOpenChange, test, onSuccess }: TestFormModalProps) => {
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
    slug: '',
    duration_minutes: 10,
    total_questions: 10,
    questions: [] as any[],
    questions_en: [] as any[],
    questions_fr: [] as any[],
    questions_ru: [] as any[],
    scoring_info: {},
    scoring_info_fr: {},
    scoring_info_ru: {}
  });

  useEffect(() => {
    if (test) {
      fetchFullTest(test.id);
    } else {
      resetForm();
    }
  }, [test, open]);

  const fetchFullTest = async (id: string) => {
    const { data, error } = await supabase
      .from('tests')
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
        slug: data.slug,
        duration_minutes: data.duration_minutes || 10,
        total_questions: data.total_questions,
        questions: Array.isArray(data.questions) ? data.questions : [],
        questions_en: Array.isArray(data.questions) ? data.questions : [],
        questions_fr: Array.isArray(data.questions_fr) ? data.questions_fr : [],
        questions_ru: Array.isArray(data.questions_ru) ? data.questions_ru : [],
        scoring_info: (data.scoring_info && typeof data.scoring_info === 'object') ? data.scoring_info : {},
        scoring_info_fr: (data.scoring_info_fr && typeof data.scoring_info_fr === 'object') ? data.scoring_info_fr : {},
        scoring_info_ru: (data.scoring_info_ru && typeof data.scoring_info_ru === 'object') ? data.scoring_info_ru : {}
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
      slug: '',
      duration_minutes: 10,
      total_questions: 10,
      questions: [],
      questions_en: [],
      questions_fr: [],
      questions_ru: [],
      scoring_info: {},
      scoring_info_fr: {},
      scoring_info_ru: {}
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
        name: formData.name || formData.name_en,
        name_en: formData.name_en,
        name_fr: formData.name_fr,
        name_ru: formData.name_ru,
        description: formData.description || formData.description_en,
        description_en: formData.description_en,
        description_fr: formData.description_fr,
        description_ru: formData.description_ru,
        slug,
        duration_minutes: formData.duration_minutes,
        total_questions: formData.total_questions,
        questions: formData.questions.length ? formData.questions : formData.questions_en,
        questions_fr: formData.questions_fr,
        questions_ru: formData.questions_ru,
        scoring_info: formData.scoring_info,
        scoring_info_fr: formData.scoring_info_fr,
        scoring_info_ru: formData.scoring_info_ru
      };

      if (test) {
        const { error } = await supabase
          .from('tests')
          .update(payload)
          .eq('id', test.id);

        if (error) throw error;
        toast.success(t('admin.tests.updated'));
      } else {
        const { error } = await supabase
          .from('tests')
          .insert(payload);

        if (error) throw error;
        toast.success(t('admin.tests.created'));
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving test:', error);
      toast.error(error.message || t('admin.tests.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {test ? t('admin.tests.edit') : t('admin.tests.create')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.tests.nameEn')} *</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.tests.nameRu')}</Label>
              <Input
                value={formData.name_ru}
                onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.tests.nameFr')}</Label>
              <Input
                value={formData.name_fr}
                onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.tests.slug')}</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.tests.descriptionEn')}</Label>
            <Textarea
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.tests.totalQuestions')}</Label>
              <Input
                type="number"
                min={1}
                value={formData.total_questions}
                onChange={(e) => setFormData({ ...formData, total_questions: parseInt(e.target.value) || 10 })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.tests.duration')}</Label>
              <Input
                type="number"
                min={1}
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 10 })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {test ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
