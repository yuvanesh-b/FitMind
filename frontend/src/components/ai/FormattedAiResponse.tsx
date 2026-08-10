import React from 'react';

interface FormattedAiResponseProps {
  content: string;
  className?: string;
}

// Helper to parse inline markdown like **bold**, __bold__, *italic*, _italic_, `code`
const parseInlineMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];

  // Match markdown inline patterns: **bold**, __bold__, `code`, *italic*, _italic_
  const inlineRegex = /(\*\*.*?\*\*|__.*?__|`.*?`|\*.*?\*|_.*?_)/g;
  const parts = text.split(inlineRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold: **text** or __text__
    if (
      (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
      (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
    ) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold text-[var(--text-primary)]">
          {inner}
        </strong>
      );
    }

    // Code: `text`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code key={idx} className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono">
          {inner}
        </code>
      );
    }

    // Italic: *text* or _text_
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
    ) {
      const inner = part.slice(1, -1);
      return (
        <em key={idx} className="italic">
          {inner}
        </em>
      );
    }

    // Normal text: clean any orphan ** or __ or # symbols
    const cleanPart = part
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/#/g, '');

    return <React.Fragment key={idx}>{cleanPart}</React.Fragment>;
  });
};

// Helper to parse cells from a table row
const parseCellsFromTableRow = (line: string): string[] => {
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  return trimmed.split('|').map((cell) => cell.trim());
};

const isTableRowLine = (line: string): boolean => {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) return false;
  const cells = parseCellsFromTableRow(line);
  return cells.length >= 2;
};

const isSeparatorRow = (cells: string[]): boolean => {
  if (!cells || cells.length === 0) return false;
  return cells.every((cell) => /^:?-+:?$/.test(cell));
};

const genericHeaderWords = new Set([
  'field', 'fields', 'value', 'values', 'key', 'keys',
  'property', 'properties', 'detail', 'details', 'metric', 'metrics',
  'attribute', 'attributes', 'parameter', 'parameters', 'item', 'items',
  'profile', 'info', 'information', 'header', 'title', 'column', 'data',
  'name', 'type', 'setting', 'settings', 'description'
]);

const isGenericHeaderRow = (cells: string[]): boolean => {
  if (!cells || cells.length === 0) return false;
  return cells.every((c) => {
    const clean = c.replace(/\*+/g, '').replace(/_+/g, '').trim().toLowerCase();
    return genericHeaderWords.has(clean);
  });
};

const convertTableBlockToText = (rows: string[][]): string[] => {
  const converted: string[] = [];

  const nonSepRows = rows.filter((r) => !isSeparatorRow(r));
  if (nonSepRows.length === 0) return [];

  let startIdx = 0;
  if (isGenericHeaderRow(nonSepRows[0])) {
    startIdx = 1;
  }

  for (let i = startIdx; i < nonSepRows.length; i++) {
    const cells = nonSepRows[i];
    if (cells.length === 0) continue;

    const cleanedCells = cells.filter((c) => c.length > 0);
    if (cleanedCells.length === 0) continue;

    if (cleanedCells.length === 1) {
      converted.push(cleanedCells[0]);
    } else if (cleanedCells.length === 2) {
      let key = cleanedCells[0].trim();
      let val = cleanedCells[1].trim();

      const cleanKeyName = key.replace(/^\*\*(.*?)\*\*$/, '$1').replace(/^__(.*?)__$/, '$1').trim();

      if (cleanKeyName.endsWith(':')) {
        converted.push(`${cleanKeyName} ${val}`);
      } else {
        converted.push(`${cleanKeyName}: ${val}`);
      }
    } else {
      let key = cleanedCells[0].trim();
      const cleanKeyName = key.replace(/^\*\*(.*?)\*\*$/, '$1').replace(/^__(.*?)__$/, '$1').trim();
      const rest = cleanedCells.slice(1).join(' - ');

      if (cleanKeyName.endsWith(':')) {
        converted.push(`${cleanKeyName} ${rest}`);
      } else {
        converted.push(`${cleanKeyName}: ${rest}`);
      }
    }
  }

  return converted;
};

const processMarkdownTables = (text: string): string => {
  if (!text || !text.includes('|')) return text;

  const lines = text.split('\n');
  const resultLines: string[] = [];
  let idx = 0;

  while (idx < lines.length) {
    const line = lines[idx];

    if (isTableRowLine(line)) {
      const tableBlockLines: string[] = [];
      let tableIdx = idx;
      while (tableIdx < lines.length && isTableRowLine(lines[tableIdx])) {
        tableBlockLines.push(lines[tableIdx]);
        tableIdx++;
      }

      const parsedRows = tableBlockLines.map(parseCellsFromTableRow);
      const hasSeparator = parsedRows.some(isSeparatorRow);

      if (hasSeparator || parsedRows.length >= 2) {
        const convertedLines = convertTableBlockToText(parsedRows);
        resultLines.push(...convertedLines);
        idx = tableIdx;
        continue;
      }
    }

    resultLines.push(line);
    idx++;
  }

  return resultLines.join('\n');
};

export const FormattedAiResponse: React.FC<FormattedAiResponseProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Clean JSON code blocks if present
  let rawText = content
    .replace(/```json[\s\S]*?```/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim();

  if (!rawText) return null;

  // Convert raw Markdown tables into clean chat-style label-value pairs
  rawText = processMarkdownTables(rawText);

  const lines = rawText.split('\n');

  return (
    <div className={`space-y-1 leading-relaxed text-sm ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Empty line -> section spacing
        if (!trimmed) {
          return <div key={lineIdx} className="h-2" />;
        }

        // Heading lines: # Heading, ## Heading, ### Heading
        if (/^#+\s+/.test(trimmed)) {
          const headingText = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/__/g, '').trim();
          return (
            <div key={lineIdx} className="font-bold text-base text-[var(--text-primary)] mt-3 mb-1">
              {headingText}
            </div>
          );
        }

        // Full-line bold title: **Your Fitness Profile** or **Your Fitness Profile:**
        const fullLineBoldMatch = trimmed.match(/^\s*(\*\*|__)(.*?)\1:?\s*$/);
        if (fullLineBoldMatch && fullLineBoldMatch[2]) {
          const titleText = fullLineBoldMatch[2].trim();
          if (!trimmed.includes(':') || trimmed.endsWith(':') || trimmed.endsWith('**') || trimmed.endsWith('__')) {
            return (
              <div key={lineIdx} className="font-bold text-base text-[var(--text-primary)] mt-3 mb-1">
                {titleText}
              </div>
            );
          }
        }

        // Strip bullet markers (- , * , + ) at start of line
        let processedLine = trimmed;
        if (/^[-*+]\s+/.test(processedLine)) {
          processedLine = processedLine.replace(/^[-*+]\s+/, '');
        }

        // Check for numbered list: e.g. "1. **Bench Press:** 4 sets" or "1. Bench Press: 4 sets"
        const numListMatch = processedLine.match(/^(\d+\.)\s+(.*)$/);
        if (numListMatch) {
          const num = numListMatch[1];
          const rest = numListMatch[2];
          return (
            <div key={lineIdx} className="flex items-start gap-2 py-0.5">
              <span className="font-semibold text-[var(--text-primary)] flex-shrink-0">{num}</span>
              <div>{parseInlineMarkdown(rest)}</div>
            </div>
          );
        }

        // Key-value pair without explicit bolding, e.g. "Name: jean" or "Age: 27 years"
        const kvMatch = processedLine.match(/^([A-Za-z0-9\s/()%,.&'-]+:)\s*(.+)$/);
        if (kvMatch && !processedLine.includes('**') && !processedLine.includes('__')) {
          const keyName = kvMatch[1];
          const valText = kvMatch[2];
          return (
            <div key={lineIdx} className="py-0.5">
              <strong className="font-semibold text-[var(--text-primary)]">{keyName} </strong>
              <span>{valText}</span>
            </div>
          );
        }

        // Standard text line
        return (
          <div key={lineIdx} className="py-0.5">
            {parseInlineMarkdown(processedLine)}
          </div>
        );
      })}
    </div>
  );
};

