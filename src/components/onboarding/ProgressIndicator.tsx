interface ProgressIndicatorProps {
  current: number;
  total: number;
}

const ProgressIndicator = ({ current, total }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`h-1.5 rounded-full smooth-transition ${
            index + 1 === current
              ? 'w-8 bg-primary'
              : index + 1 < current
              ? 'w-1.5 bg-primary/50'
              : 'w-1.5 bg-muted'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-2">
        {current}/{total}
      </span>
    </div>
  );
};

export default ProgressIndicator;
