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

export default LaTeX;
