import { useRef } from "react";
import { useState, useEffect, useCallback } from 'react';

export const useIntersectionObserver = (callback, options = {}) => {
    const targetRef = useRef(null);

    useEffect(() => {
        const element = targetRef.current;
        console.log('useIntersectionObserver setup:', { element, hasElement: !!element });

        if (!element) {
            console.log('No element found, retrying...');
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            console.log('Intersection detected:', entries);
            entries.forEach(entry => {
                console.log('Entry:', { isIntersecting: entry.isIntersecting, ratio: entry.intersectionRatio });
                if (entry.isIntersecting) {
                    console.log('Triggering callback!');
                    callback();
                    observer.disconnect();
                }
            });
        }, {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '0px'
        });

        observer.observe(element);
        console.log('Observer attached successfully');

        return () => {
            console.log('Cleaning up observer');
            observer.disconnect();
        };
    });

    return targetRef;
};