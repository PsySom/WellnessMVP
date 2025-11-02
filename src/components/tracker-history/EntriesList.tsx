import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrackerEntry } from '@/pages/TrackerHistory';
import { format } from 'date-fns';
import EntryDetailsModal from './EntryDetailsModal';

interface EntriesListProps {
  entries: TrackerEntry[];
  onEntryDeleted: () => void;
}

const EntriesList = ({ entries, onEntryDeleted }: EntriesListProps) => {
  const [selectedEntry, setSelectedEntry] = useState<TrackerEntry | null>(null);

  const getMoodEmoji = (score: number | null) => {
    if (score === null) return '😐';
    if (score >= 3) return '😄';
    if (score >= 1) return '🙂';
    if (score >= -1) return '😐';
    if (score >= -3) return '😟';
    return '😢';
  };

  const getStressColor = (level: number | null) => {
    if (level === null) return 'bg-muted';
    if (level <= 3) return 'bg-accent';
    if (level <= 7) return 'bg-warning';
    return 'bg-destructive';
  };

  // Sort entries by date and time, most recent first
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(`${a.entry_date}T${a.entry_time}`);
    const dateB = new Date(`${b.entry_date}T${b.entry_time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <>
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-foreground">All Entries</h3>

        <div className="space-y-3">
          {sortedEntries.map((entry) => {
            const date = new Date(`${entry.entry_date}T${entry.entry_time}`);
            const topEmotions = entry.emotions?.slice(0, 3) || [];

            return (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="w-full p-4 rounded-lg bg-muted/50 hover:bg-muted smooth-transition text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Mood */}
                    <div className="text-3xl">{getMoodEmoji(entry.mood_score)}</div>

                    <div className="flex-1 space-y-2">
                      {/* Date and time */}
                      <div>
                        <p className="font-medium text-foreground">
                          {format(date, 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(date, 'h:mm a')}
                        </p>
                      </div>

                      {/* Top emotions */}
                      {topEmotions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {topEmotions.map((emotion, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-card border"
                            >
                              {emotion.emotion_label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stress/Anxiety indicators */}
                  <div className="flex gap-2">
                    {entry.stress_level !== null && (
                      <div className="flex flex-col items-center gap-1">
                        <div className={`h-8 w-2 rounded ${getStressColor(entry.stress_level)}`} />
                        <span className="text-xs text-muted-foreground">S</span>
                      </div>
                    )}
                    {entry.anxiety_level !== null && (
                      <div className="flex flex-col items-center gap-1">
                        <div className={`h-8 w-2 rounded ${getStressColor(entry.anxiety_level)}`} />
                        <span className="text-xs text-muted-foreground">A</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {selectedEntry && (
        <EntryDetailsModal
          entry={selectedEntry}
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onDeleted={() => {
            setSelectedEntry(null);
            onEntryDeleted();
          }}
        />
      )}
    </>
  );
};

export default EntriesList;
