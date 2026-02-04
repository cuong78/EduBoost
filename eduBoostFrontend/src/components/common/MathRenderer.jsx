import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
        let processedContent = content;

        // Process block formulas: $$...$$
        const blockRegex = /\$\$([^$]+)\$\$/g;
        let blockMatch;
        while ((blockMatch = blockRegex.exec(content)) !== null) {
            const formula = blockMatch[1];
            const mathSpan = document.createElement('span');
            try {
                katex.render(formula, mathSpan, { displayMode: true });
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
            // Add text before the match
            if (inlineMatch.index > lastIndex) {
                processedParts.push(processedContent.substring(lastIndex, inlineMatch.index));
            }

            // Process the formula
            const formula = inlineMatch[1];
            const mathSpan = document.createElement('span');
            try {
                katex.render(formula, mathSpan, { displayMode: false });
                processedParts.push(mathSpan.outerHTML);
            } catch (e) {
                console.error('KaTeX render error:', e);
                processedParts.push(inlineMatch[0]); // Keep original if render fails
            }

            lastIndex = inlineMatch.index + inlineMatch[0].length;
        }

        // Add remaining text
        if (lastIndex < processedContent.length) {
            processedParts.push(processedContent.substring(lastIndex));
        }

        container.innerHTML = processedParts.length > 0 ? processedParts.join('') : processedContent;
    }, [content]);

    return (
        <div 
            ref={containerRef} 
            className={`math-renderer ${className}`}
        />
    );
};

export default MathRenderer;
