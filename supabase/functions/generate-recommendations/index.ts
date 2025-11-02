import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriggerCondition {
  type: 'tracker_threshold' | 'activity_deficit' | 'activity_absence';
  metric?: string;
  operator?: string;
  value?: number;
  occurrences?: number;
  period_hours?: number;
  category?: string;
  target_hours?: number;
  period_days?: number;
}

interface Rule {
  id: string;
  trigger_condition: TriggerCondition;
  activity_template_ids: string[];
  priority: number;
  enabled: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log('Generating recommendations for user:', user.id);

    // Fetch recent tracker entries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: trackerEntries, error: trackerError } = await supabaseClient
      .from('tracker_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('entry_date', { ascending: false });

    if (trackerError) {
      console.error('Error fetching tracker entries:', trackerError);
      throw trackerError;
    }

    // Fetch recent activities (last 7 days)
    const { data: activities, error: activitiesError } = await supabaseClient
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      throw activitiesError;
    }

    // Fetch active rules
    const { data: rules, error: rulesError } = await supabaseClient
      .from('recommendation_rules')
      .select('*')
      .eq('enabled', true);

    if (rulesError) {
      console.error('Error fetching rules:', rulesError);
      throw rulesError;
    }

    console.log(`Found ${rules?.length || 0} active rules`);

    // Evaluate rules and generate recommendations
    const triggeredRules: Rule[] = [];

    for (const rule of rules || []) {
      if (evaluateRule(rule, trackerEntries || [], activities || [])) {
        console.log('Rule triggered:', rule.trigger_condition.type);
        triggeredRules.push(rule);
      }
    }

    console.log(`${triggeredRules.length} rules triggered`);

    // Delete existing active recommendations
    await supabaseClient
      .from('user_recommendations')
      .delete()
      .eq('user_id', user.id)
      .is('accepted', null)
      .eq('dismissed', false);

    // Create new recommendations
    const recommendations = [];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    for (const rule of triggeredRules) {
      for (const templateId of rule.activity_template_ids) {
        recommendations.push({
          user_id: user.id,
          activity_template_id: templateId,
          reason: generateReason(rule.trigger_condition),
          priority: rule.priority,
          accepted: null,
          dismissed: false,
          expires_at: expiresAt.toISOString(),
        });
      }
    }

    if (recommendations.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('user_recommendations')
        .insert(recommendations);

      if (insertError) {
        console.error('Error inserting recommendations:', insertError);
        throw insertError;
      }

      console.log(`Created ${recommendations.length} recommendations`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: recommendations.length,
        recommendations,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function evaluateRule(
  rule: Rule,
  trackerEntries: any[],
  activities: any[]
): boolean {
  const condition = rule.trigger_condition;

  if (condition.type === 'tracker_threshold') {
    return evaluateTrackerThreshold(condition, trackerEntries);
  } else if (condition.type === 'activity_deficit') {
    return evaluateActivityDeficit(condition, activities);
  } else if (condition.type === 'activity_absence') {
    return evaluateActivityAbsence(condition, activities);
  }

  return false;
}

function evaluateTrackerThreshold(
  condition: TriggerCondition,
  trackerEntries: any[]
): boolean {
  const { metric, operator, value, occurrences, period_hours } = condition;

  if (!metric || !operator || value === undefined || !occurrences || !period_hours) {
    return false;
  }

  // Filter entries within the time period
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - period_hours);

  const recentEntries = trackerEntries.filter((entry) => {
    const entryDate = new Date(`${entry.entry_date}T${entry.entry_time}`);
    return entryDate >= cutoffTime && entry[metric] !== null;
  });

  // Count occurrences that meet the condition
  let count = 0;
  for (const entry of recentEntries) {
    const metricValue = entry[metric];
    if (operator === '>' && metricValue > value) count++;
    else if (operator === '<' && metricValue < value) count++;
    else if (operator === '>=' && metricValue >= value) count++;
    else if (operator === '<=' && metricValue <= value) count++;
    else if (operator === '=' && metricValue === value) count++;
  }

  return count >= occurrences;
}

function evaluateActivityDeficit(
  condition: TriggerCondition,
  activities: any[]
): boolean {
  const { category, target_hours, period_days } = condition;

  if (!category || !target_hours || !period_days) {
    return false;
  }

  // Filter activities by category and period
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - period_days);

  const relevantActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.date);
    return (
      activity.category === category &&
      activityDate >= cutoffDate &&
      activity.status === 'completed'
    );
  });

  // Sum up total hours
  const totalMinutes = relevantActivities.reduce((sum, activity) => {
    return sum + (activity.duration_minutes || 0);
  }, 0);

  const totalHours = totalMinutes / 60;
  const targetTotalHours = target_hours * period_days;

  return totalHours < targetTotalHours;
}

function evaluateActivityAbsence(
  condition: TriggerCondition,
  activities: any[]
): boolean {
  const { category, period_days } = condition;

  if (!category || !period_days) {
    return false;
  }

  // Check if there are any completed activities in this category within the period
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - period_days);

  const hasActivity = activities.some((activity) => {
    const activityDate = new Date(activity.date);
    return (
      activity.category === category &&
      activityDate >= cutoffDate &&
      activity.status === 'completed'
    );
  });

  return !hasActivity;
}

function generateReason(condition: TriggerCondition): string {
  switch (condition.type) {
    case 'tracker_threshold':
      if (condition.metric === 'stress_level') return 'To help reduce stress';
      if (condition.metric === 'anxiety_level') return 'To calm anxiety';
      if (condition.metric === 'energy_level') return 'To boost your energy';
      if (condition.metric === 'mood_score') return 'To lift your mood';
      return 'For overall wellbeing';
    case 'activity_deficit':
      if (condition.category === 'sleep') return 'You need more rest';
      return 'To maintain balance';
    case 'activity_absence':
      if (condition.category === 'exercise') return 'To stay active';
      if (condition.category === 'hydration') return 'Stay hydrated';
      return 'To maintain your routine';
    default:
      return 'For overall wellbeing';
  }
}
