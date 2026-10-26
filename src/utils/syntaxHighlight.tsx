import React from 'react';

interface SyntaxHighlightProps {
  code: string;
  language?: string;
  className?: string;
}

export function SyntaxHighlight({ code, language = 'c', className = '' }: SyntaxHighlightProps) {
  const lines = code.split('\n');

  // Tokenize a single line based on language
  const renderTokens = (line: string) => {
    if (language === 'diff') {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        return <span className="text-emerald-400 font-semibold">{line}</span>;
      }
      if (line.startsWith('-') && !line.startsWith('---')) {
        return <span className="text-rose-400 font-semibold">{line}</span>;
      }
      if (line.startsWith('@@')) {
        return <span className="text-cyan-400 italic font-mono">{line}</span>;
      }
      if (line.startsWith('---') || line.startsWith('+++')) {
        return <span className="text-slate-400 font-bold">{line}</span>;
      }
    }

    if (language === 'ini') {
      if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
        return <span className="text-amber-300 font-semibold">{line}</span>;
      }
      if (line.trim().startsWith('#') || line.trim().startsWith(';')) {
        return <span className="text-slate-500 italic">{line}</span>;
      }
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        return (
          <>
            <span className="text-sky-300 font-medium">{line.slice(0, eqIdx)}</span>
            <span className="text-slate-500">=</span>
            <span className="text-emerald-300">{line.slice(eqIdx + 1)}</span>
          </>
        );
      }
    }

    // Comment check
    const trimmed = line.trimStart();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return <span className="text-slate-500 italic">{line}</span>;
    }
    if (trimmed.startsWith('#include') || trimmed.startsWith('#define') || trimmed.startsWith('#pragma') || trimmed.startsWith('#if')) {
      return <span className="text-pink-400 font-medium">{line}</span>;
    }

    // General code tokenization with regex
    const regex = /(\b(?:int|char|float|double|void|return|if|else|while|for|switch|case|break|continue|class|struct|union|public|private|protected|static|const|volatile|typedef|enum|namespace|using|unsafe|byte|ushort|uint|ulong|bool|true|false|new|ref|out|this|base|null|uint8_t|uint16_t|uint32_t|far|near|MOV|INT|PUSH|POP|CALL|RET|JMP|JZ|JNZ|ADD|SUB|CMP|XOR|AND|OR|SHL|SHR|NOP|HLT|outp|inp|inportb|outportb|delay)\b)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b0x[0-9a-fA-F]+|\b[0-9]+[L|U|UL|f]?\b)|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|([{}()[\],;])|([+\-*/%&=<>!~|^]+)/g;

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        elements.push(
          <span key={lastIdx} className="text-slate-200">
            {line.substring(lastIdx, match.index)}
          </span>
        );
      }

      const [full, keyword, stringLit, numberLit, comment, punctuation, operator] = match;

      if (keyword) {
        elements.push(
          <span key={match.index} className="text-amber-400 font-medium">
            {keyword}
          </span>
        );
      } else if (stringLit) {
        elements.push(
          <span key={match.index} className="text-emerald-300">
            {stringLit}
          </span>
        );
      } else if (numberLit) {
        elements.push(
          <span key={match.index} className="text-cyan-300 font-mono">
            {numberLit}
          </span>
        );
      } else if (comment) {
        elements.push(
          <span key={match.index} className="text-slate-500 italic">
            {comment}
          </span>
        );
      } else if (punctuation) {
        elements.push(
          <span key={match.index} className="text-slate-400">
            {punctuation}
          </span>
        );
      } else if (operator) {
        elements.push(
          <span key={match.index} className="text-purple-300">
            {operator}
          </span>
        );
      }

      lastIdx = regex.lastIndex;
    }

    if (lastIdx < line.length) {
      elements.push(
        <span key={lastIdx} className="text-slate-200">
          {line.substring(lastIdx)}
        </span>
      );
    }

    return elements.length > 0 ? elements : line;
  };

  return (
    <pre className={`font-mono text-xs leading-relaxed overflow-x-auto tab-size-4 ${className}`}>
      <code>
        {lines.map((line, index) => (
          <div key={index} className="table-row">
            <span className="table-cell select-none pr-4 text-right text-slate-600 tabular-nums w-8">
              {index + 1}
            </span>
            <span className="table-cell whitespace-pre">{renderTokens(line)}</span>
          </div>
        ))}
      </code>
    </pre>
  );
}
