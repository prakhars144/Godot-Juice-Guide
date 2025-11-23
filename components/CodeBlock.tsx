import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'gdscript' }) => {
  const [copied, setCopied] = useState(false);

  // Helper to remove common leading whitespace (dedent)
  const formatCode = (source: string) => {
    const lines = source.split('\n');
    
    // Remove initial empty lines
    while (lines.length > 0 && lines[0].trim() === '') lines.shift();
    // Remove trailing empty lines
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

    // Find minimum indentation
    let minIndent = Infinity;
    lines.forEach(line => {
      if (line.trim().length > 0) {
        const indent = line.search(/\S/);
        if (indent !== -1) minIndent = Math.min(minIndent, indent);
      }
    });

    if (minIndent === Infinity) return lines;

    return lines.map(line => line.length >= minIndent ? line.slice(minIndent) : line);
  };

  const lines = formatCode(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-8 rounded-lg overflow-hidden border border-gray-700 bg-[#191d26] shadow-2xl ring-1 ring-white/5">
      <div className="flex items-center justify-between px-4 py-3 bg-[#202531] border-b border-gray-700">
        <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#478cbf] font-bold tracking-wider uppercase bg-[#478cbf]/10 px-2 py-1 rounded">
                {language}
            </span>
            <span className="text-xs text-gray-500">res://scripts/juice.gd</span>
        </div>
        <button 
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors text-xs font-medium flex items-center gap-1.5"
        >
            {copied ? (
                <>
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                    <span>Copy</span>
                </>
            )}
        </button>
      </div>
      <div className="overflow-x-auto bg-[#14161b]">
        <div className="p-4 min-w-max font-mono text-[13px] md:text-sm leading-6">
            {lines.map((line, i) => (
            <div key={i} className="flex">
                <span className="select-none text-gray-700 text-right pr-4 w-8 flex-shrink-0">{i + 1}</span>
                <span className="whitespace-pre flex-1 text-gray-300">{highlightSyntax(line) || ' '}</span>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Improved regex-based highlighter for GDScript
const highlightSyntax = (line: string) => {
  const keywords = ['func', 'var', 'const', 'extends', 'if', 'elif', 'else', 'return', 'await', 'void', 'shader_type', 'uniform', 'signal', 'emit_signal', 'class_name', 'export', 'match', 'for', 'in', 'while', 'pass', 'break'];
  const builtins = ['Vector2', 'Vector3', 'Tween', 'Input', 'Engine', 'AudioStreamPlayer', 'min', 'max', 'pow', 'randf_range', 'randf', 'create_tween', 'preload', 'print', 'Color', 'get_tree', 'queue_free', 'instantiate', 'lerp', 'sin', 'cos', 'TAU', 'PI'];
  const properties = ['position', 'scale', 'rotation', 'modulate', 'global_position', 'velocity', 'emitting', 'finished', 'texture'];
  
  // Split while keeping delimiters
  let parts = line.split(/(\s+|[(),.:\[\]+\-*/=<>!])/g);
  
  // Basic context tracking (very simple)
  let isString = false;
  let isComment = false;

  return parts.map((part, index) => {
    if (isComment) return <span key={index} className="text-gray-500 italic">{part}</span>;
    if (part.startsWith('#')) {
        isComment = true;
        return <span key={index} className="text-gray-500 italic">{part}</span>;
    }
    
    if (part.startsWith('"') || part.startsWith("'")) {
        // Simple string handling (doesn't handle partial strings across splits well, but sufficient for snippets)
        return <span key={index} className="text-[#ffe366]">{part}</span>;
    }

    if (keywords.includes(part)) return <span key={index} className="text-[#ff7085] font-bold">{part}</span>;
    if (builtins.includes(part)) return <span key={index} className="text-[#478cbf] font-medium">{part}</span>;
    if (properties.includes(part)) return <span key={index} className="text-[#abc9ff]">{part}</span>;
    if (!isNaN(parseFloat(part))) return <span key={index} className="text-[#a5ff90]">{part}</span>;
    
    // Function definition
    if (index > 0 && parts[index-1] === 'func' && parts[index].trim() === '') {
        // skip whitespace
    } else if (part.match(/^[a-zA-Z_]\w*$/) && index < parts.length - 1 && parts[index+1] === '(') {
         return <span key={index} className="text-[#8da6ce] font-bold">{part}</span>;
    }
    
    return <span key={index} className="text-gray-300">{part}</span>;
  });
};

export default CodeBlock;