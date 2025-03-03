import React, { useEffect, useState, useRef } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap, loadCSS, loadJS } from 'markmap-view';

const MindMap = () => {
    const [markdown, setMarkdown] = useState('');
    const [error, setError] = useState(null);
    const markmapRef = useRef(null);

    useEffect(() => {
        const fetchMindMap = async () => {
            const token = localStorage.getItem('token');  // ✅ Ensure token is used

            try {
                const response = await fetch('http://localhost:5000/api/mindmap', {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // ✅ Authenticate request
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch mind map");
                }

                const data = await response.json();
                setMarkdown(data.markdown);  // ✅ Use correct response field
            } catch (error) {
                console.error("🔥 Fetch error:", error);
                setError(error.message);
            }
        };

        fetchMindMap();
    }, []);

    useEffect(() => {
        if (markdown) {
            const transformer = new Transformer();
            const { root, features } = transformer.transform(markdown);

            if (features) {
                loadCSS(features.styles || []);
                loadJS(features.scripts || [], { getUrl: (item) => item });
            }

            if (markmapRef.current) {
                markmapRef.current.innerHTML = '';  // Clear previous Markmap
                Markmap.create(markmapRef.current, {}, root);
            }
        }
    }, [markdown]);

    if (error) return <p>Error loading mind map: {error}</p>;

    return (
        <div>
            <h2>User Summary Mind Map</h2>
            <svg ref={markmapRef} style={{ width: '100%', height: '500px' }} />
        </div>
    );
};

export default MindMap;

