import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple parser for **bold**, * list items, and `code`
  const lines = content.split('\n');
  
  return (
    <div className="space-y-4 text-gray-300 leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed === '') return <div key={i} className="h-2" />;
        
        // List items
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex items-start ml-4">
              <span className="text-[#478cbf] mr-2 mt-1.5">•</span>
              <span className="flex-1">{parseInline(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Headers (simple)
        if (trimmed.startsWith('### ')) {
            return <h3 key={i} className="text-xl font-bold text-white mt-4">{parseInline(trimmed.substring(4))}</h3>
        }
        if (trimmed.startsWith('**') && !trimmed.includes('**', 2)) {
             // Treat as header if line starts with bold
             return <div key={i} className="font-bold text-white mt-2">{parseInline(trimmed)}</div>
        }

        return <div key={i}>{parseInline(line)}</div>;
      })}
    </div>
  );
};

// Helper to parse inline styles
const parseInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="bg-[#2d3342] text-[#ff7085] px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

export default MarkdownRenderer;