// Import Transformer from `markmap-lib` to process Markdown into mind map data  
// https://markmap.js.org/docs/packages--markmap-view
// Import Markmap rendering functions - SVG Formatting
//  https://markmap.js.org/docs/packages--markmap-lib

import React, { useEffect, useState, useRef } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap, loadCSS, loadJS } from 'markmap-view';

const MindMap = () => {
    const [markdown, setMarkdown] = useState('');
    const [error, setError] = useState(null);
    const markmapRef = useRef(null);

    // // Fetch Markdown data for the mind map from the backend 
// Covers how to use `fetch` for making HTTP requests, including handling headers and JSON responses - https://developer.mozilla.org/docs/Web/API/Fetch_API 
    useEffect(() => {
        const fetchMindMap = async () => {
            const token = localStorage.getItem('token');  

            try {
                const response = await fetch('http://localhost:5000/api/mindmap', {
                    headers: {
                        'Authorization': `Bearer ${token}`,  
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch mind map");
                }
              // Parse JSON response - Describes how `response.json()` converts API responses to usable data.  
                // URL: https://developer.mozilla.org/docs/Web/API/Response/json   
                const data = await response.json();
                setMarkdown(data.markdown);  // Store retrieved Markdown content
            } catch (error) {
                console.error("Fetch error:", error);
                setError(error.message);
            }
        };

        fetchMindMap();
    }, []);


   // Process Markdown and render the mind map  
    // Reference: Markmap Documentation - Transformation with `markmap-lib`  
    // Purpose: Explains how `Transformer` converts Markdown into a structured format. 
    // Assistance: Leveraged ChatGPT to understand and structure the transformation process   
    // URL: https://markmap.js.org/docs/packages--markmap-lib#transformation  
    useEffect(() => {
        if (markdown) {
            const transformer = new Transformer();
            const { root, features } = transformer.transform(markdown);

            // Load required CSS and JS for Markmap visualisation  
            // Reference: Markmap Documentation - `loadCSS` and `loadJS`  
            // https://github.com/markmap/markmap/blob/3b7043680377fc886f0f5d4fabea015c47df0c4e/packages/markmap-lib/src/transform.ts#L35
            // URL: https://markmap.js.org/api/functions/markmap-common.loadCSS.html  
            // URL: https://markmap.js.org/api/functions/markmap-common.loadJS.html  
            if (features) {
            loadCSS(features.styles || []);
                loadJS(features.scripts || [], { getUrl: (item) => item });
            }

        // Clear previous Markmap rendering and create a new visualisation  
      // How to create and update a mind map using `Markmap.create()`.  
    //  https://markmap.js.org/docs/packages--markmap-view  
            if (markmapRef.current) {
                markmapRef.current.innerHTML = '';  // Clear previous Markmap https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML  

                Markmap.create(markmapRef.current, {}, root);
            }
        }
    }, [markdown]);

    if (error) return <p>Error loading mind map: {error}</p>;

// SVG Structure: https://github.com/cwybruce/markmap-1/commit/afc173abb52e6e4052e228d223e0edfcdb6abe6a
    return (
        <div>
            <h2>User Summary Mind Map</h2>
            <svg ref={markmapRef} style={{ width: '100%', height: '500px' }} />
        </div>
    );
};

export default MindMap;

