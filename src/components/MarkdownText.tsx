import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownTextProps { content: string; }

const MarkdownText: React.FC<MarkdownTextProps> = ({ content }) => {
  return (
    <div className="prose-legal text-sm md:text-base leading-relaxed">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownText;