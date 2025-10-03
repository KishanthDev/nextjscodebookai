import { useState } from "react";

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  if (inline) {
    // Inline code: style as usual, no copy button
    return (
      <code className="bg-gray-100 px-1 rounded font-mono text-sm">{children}</code>
    );
  }

  // Block code with copy button
  const code = String(children).replace(/\n$/, "");
  return (
    <div className="relative group">
      <pre className="bg-gray-400 text-white rounded-lg p-3 overflow-x-auto">
        <code className="font-mono text-sm">{code}</code>
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="absolute top-2 right-2 bg-white bg-opacity-80 border rounded px-2 py-1 text-xs text-gray-800 opacity-0 group-hover:opacity-100 transition"
        aria-label="Copy code"
        type="button"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
