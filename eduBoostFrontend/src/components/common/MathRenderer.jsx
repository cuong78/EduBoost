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
    if (/\$/.test(content)) return content;
    if (LATEX_COMMANDS.test(content)) {
        return `$${content}$`;
    }
    return content;
};

/**
 * Sanitize SVG: strip script tags, on* event handlers, and external refs.
 */
const sanitizeSvg = (svgString) => {
    return svgString
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/xlink:href\s*=\s*["'](?!#)[^"']*["']/gi, '');
};

/**
 * Split content by SVG blocks → [{type:'text'|'svg', content}]
 */
const splitBySvg = (content) => {
    if (!content) return [{ type: 'text', content: '' }];
    const svgRegex = /<svg[\s\S]*?<\/svg>/gi;
    const parts = [];
    let lastIdx = 0;
    let match;
    while ((match = svgRegex.exec(content)) !== null) {
        if (match.index > lastIdx) {
            parts.push({ type: 'text', content: content.slice(lastIdx, match.index) });
        }
        parts.push({ type: 'svg', content: sanitizeSvg(match[0]) });
        lastIdx = match.index + match[0].length;
    }
    if (lastIdx < content.length) {
        parts.push({ type: 'text', content: content.slice(lastIdx) });
    }
    return parts.length > 0 ? parts : [{ type: 'text', content }];
};

/**
 * Process a plain-text segment through KaTeX rendering.
 * Returns an HTML string.
 */
function processTextForMath(text) {
    if (!text) return '';

    let processedContent = autoWrapLatex(text);

    // Block formulas: $$...$$
    const blockRegex = /\$\$([^$]+)\$\$/g;
    let blockMatch;
    while ((blockMatch = blockRegex.exec(processedContent)) !== null) {
        const formula = blockMatch[1];
        const span = document.createElement('span');
        try {
            katex.render(formula, span, { displayMode: true, throwOnError: false });
            processedContent = processedContent.replace(blockMatch[0], span.outerHTML);
        } catch (e) {
            console.error('KaTeX block error:', e);
        }
    }

    // Inline formulas: $...$
    const inlineRegex = /(?<!\$)\$([^$\n]+?)\$(?!\$)/g;
    let inlineMatch;
    const parts = [];
    let lastIndex = 0;

    while ((inlineMatch = inlineRegex.exec(processedContent)) !== null) {
        if (inlineMatch.index > lastIndex) {
            parts.push(processedContent.substring(lastIndex, inlineMatch.index));
        }
        const formula = inlineMatch[1];
        const span = document.createElement('span');
        try {
            katex.render(formula, span, { displayMode: false, throwOnError: false });
            parts.push(span.outerHTML);
        } catch (e) {
            parts.push(inlineMatch[0]);
        }
        lastIndex = inlineMatch.index + inlineMatch[0].length;
    }

    if (lastIndex < processedContent.length) {
        parts.push(processedContent.substring(lastIndex));
    }

    return parts.length > 0 ? parts.join('') : processedContent;
}

const MathRenderer = ({ content, className = '' }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !content) {
            if (containerRef.current) containerRef.current.innerHTML = content || '';
            return;
        }

        const container = containerRef.current;

        // 1. Split by SVG blocks
        const segments = splitBySvg(content);

        // 2. Assemble HTML
        let assembled = '';
        for (const seg of segments) {
            if (seg.type === 'svg') {
                assembled += `<span class="svg-diagram" style="display:block;text-align:center;margin:0.75rem 0;overflow-x:auto;">${seg.content}</span>`;
            } else {
                assembled += processTextForMath(seg.content);
            }
        }

        // 3. Handle [IMG:key] placeholders
        const finalContent = assembled.replace(/\[IMG:([^\]]+)\]/g, (_, objectKey) => {
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
