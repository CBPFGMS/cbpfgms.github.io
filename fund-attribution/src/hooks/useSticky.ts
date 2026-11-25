import { useEffect, useRef, useState, type RefObject } from "react";

export const useSticky = <T extends HTMLElement>(): [
	RefObject<T | null>,
	boolean,
] => {
	const [isSticky, setIsSticky] = useState<boolean>(false);
	const ref = useRef<T>(null);

	useEffect(() => {
		const cachedRef = ref.current;

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsSticky(!entry.isIntersecting);
			},
			{
				threshold: [1],
				rootMargin: "-1px 0px 0px 0px",
			},
		);

		if (cachedRef) {
			observer.observe(cachedRef);
		}

		return () => {
			if (cachedRef) {
				observer.unobserve(cachedRef);
			}
		};
	}, []);

	return [ref, isSticky];
};
