import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const LaTeX = ({ children, block = false }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            try {
                katex.render(children, containerRef.current, {
                    throwOnError: false,
                    displayMode: block
                });
            } catch (error) {
                console.error("KaTeX Error:", error);
                containerRef.current.innerText = children;
            }
        }
    }, [children, block]);

    return <span ref={containerRef} />;
};

// Named exports for convenience
export const BlockMath = ({ math, children }) => <LaTeX block={true}>{math || children}</LaTeX>;
export const InlineMath = ({ math, children }) => <LaTeX block={false}>{math || children}</LaTeX>;

export default LaTeX;
