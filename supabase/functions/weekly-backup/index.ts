import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all user tables data
    const [
      { data: profiles },
      { data: activities },
      { data: trackerEntries },
      { data: trackerEmotions },
      { data: journalSessions },
      { data: journalMessages },
      { data: exerciseSessions },
      { data: testResults },
      { data: userPresets },
      { data: userRecommendations },
    ] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("activities").select("*"),
      supabase.from("tracker_entries").select("*"),
      supabase.from("tracker_emotions").select("*"),
      supabase.from("journal_sessions").select("*"),
      supabase.from("journal_messages").select("*"),
      supabase.from("exercise_sessions").select("*"),
      supabase.from("test_results").select("*"),
      supabase.from("user_presets").select("*"),
      supabase.from("user_recommendations").select("*"),
    ]);

    const backup = {
      created_at: new Date().toISOString(),
      version: "1.0",
      tables: {
        profiles: profiles || [],
        activities: activities || [],
        tracker_entries: trackerEntries || [],
        tracker_emotions: trackerEmotions || [],
        journal_sessions: journalSessions || [],
        journal_messages: journalMessages || [],
        exercise_sessions: exerciseSessions || [],
        test_results: testResults || [],
        user_presets: userPresets || [],
        user_recommendations: userRecommendations || [],
      },
      stats: {
        profiles_count: profiles?.length || 0,
        activities_count: activities?.length || 0,
        tracker_entries_count: trackerEntries?.length || 0,
        journal_sessions_count: journalSessions?.length || 0,
        test_results_count: testResults?.length || 0,
      },
    };

    const backupJson = JSON.stringify(backup, null, 2);
    const fileName = `backup_${new Date().toISOString().split("T")[0]}.json`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("backups")
      .upload(fileName, backupJson, {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Clean up old backups (keep last 4 weeks)
    const { data: files } = await supabase.storage.from("backups").list();
    if (files && files.length > 4) {
      const oldFiles = files
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, files.length - 4);
      
      for (const file of oldFiles) {
        await supabase.storage.from("backups").remove([file.name]);
      }
    }

    console.log(`Backup created: ${fileName}, Stats:`, backup.stats);

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileName, 
        stats: backup.stats,
        message: "Weekly backup completed successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Backup error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
