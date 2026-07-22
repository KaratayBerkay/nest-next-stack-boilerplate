interface EditorPreviewProps {
  title: string;
  tags: string[];
  body: string;
  untitledLabel: string;
}

export function EditorPreview({
  title,
  tags,
  body,
  untitledLabel,
}: EditorPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{title || untitledLabel}</h1>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, i) => (
          <span key={i} className="bg-emphasis text-xxs rounded px-1.5 py-0.5">
            {tag}
          </span>
        ))}
      </div>
      <p className="text-sm whitespace-pre-wrap">{body}</p>
    </div>
  );
}
