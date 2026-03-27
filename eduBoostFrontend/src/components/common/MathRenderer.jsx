import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { API } from '../../constants/api';

// LaTeX commands that indicate math content even without $ delimiters
const LATEX_COMMANDS = /\\(frac|sqrt|sum|int|prod|lim|log|ln|sin|cos|tan|cot|sec|csc|infty|alpha|beta|gamma|delta|theta|pi|sigma|omega|mu|nu|lambda|cdot|times|div|pm|mp|leq|geq|neq|approx|equiv|subset|supset|cup|cap|in|notin|vec|hat|bar|dot|ddot|partial|nabla|binom|text|left|right|begin|end|overline|underline)[^a-zA-Z]/;

/**
 * Wraps content with bare LaTeX commands in $...$ for MathRenderer to process.
 * Only wraps if NOT already inside $...$ or $$...$$
 */
const autoWrapLatex = (content) => {
    if (!content) return content;
    // If already has $...$ delimiters, skip
    if (/\$/.test(content)) return content;
    // If content contains LaTeX commands, wrap the whole thing
    if (LATEX_COMMANDS.test(content)) {
        return `$${content}$`;
    }
    return content;
};

const MathRenderer = ({ content, className = '' }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !content) {
            if (containerRef.current) {
                containerRef.current.innerHTML = content || '';
            }
            return;
        }

        const container = containerRef.current;
        // Auto-wrap bare LaTeX before processing
        let processedContent = autoWrapLatex(content);

        // Process block formulas: $$...$$
        const blockRegex = /\$\$([^$]+)\$\$/g;
        let blockMatch;
        while ((blockMatch = blockRegex.exec(processedContent)) !== null) {
            const formula = blockMatch[1];
            const mathSpan = document.createElement('span');
            try {
                katex.render(formula, mathSpan, { displayMode: true, throwOnError: false });
                processedContent = processedContent.replace(blockMatch[0], mathSpan.outerHTML);
            } catch (e) {
                console.error('KaTeX render error:', e);
            }
        }

        // Process inline formulas: $...$ (but not $$...$$)
        const inlineRegex = /(?<!\$)\$([^$\n]+?)\$(?!\$)/g;
        let inlineMatch;
        const processedParts = [];
        let lastIndex = 0;

        while ((inlineMatch = inlineRegex.exec(processedContent)) !== null) {
            if (inlineMatch.index > lastIndex) {
                processedParts.push(processedContent.substring(lastIndex, inlineMatch.index));
            }
            const formula = inlineMatch[1];
            const mathSpan = document.createElement('span');
            try {
                katex.render(formula, mathSpan, { displayMode: false, throwOnError: false });
                processedParts.push(mathSpan.outerHTML);
            } catch (e) {
                console.error('KaTeX render error:', e);
                processedParts.push(inlineMatch[0]);
            }
            lastIndex = inlineMatch.index + inlineMatch[0].length;
        }

        if (lastIndex < processedContent.length) {
            processedParts.push(processedContent.substring(lastIndex));
        }

        // Process [IMG:objectKey] placeholders
        const imgProcessed = processedParts.length > 0 ? processedParts.join('') : processedContent;
        const finalContent = imgProcessed.replace(/\[IMG:([^\]]+)\]/g, (match, objectKey) => {
            const imgUrl = `${API.BASE}/files/${objectKey}`;
            return `<img src="${imgUrl}" alt="Hình ảnh câu hỏi" style="max-width:100%;border-radius:8px;margin:8px 0" onerror="this.style.display='none'" />`;
        });

        container.innerHTML = finalContent;
    }, [content]);

    return (
        <div 
            ref={containerRef} 
            className={`math-renderer ${className}`}
        />
    );
};

export default MathRenderer;
