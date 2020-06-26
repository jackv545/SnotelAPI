/*
 * https://stackoverflow.com/a/42234988
 * Custom hook to provide functionality on only clicks outside component
 */

import { useEffect } from 'react';

const useOutsideAlerter = (ref, fn) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if(ref.current && !ref.current.contains(event.target)) {
                fn();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, fn]);
};

export default useOutsideAlerter;
