import Observer from './can-observer';

// Unlike the ylem version, this hook is passed a 
//   React instance so it can be used seamlessly
//   by Preact et al.
export default function useObserver(React) {
	const { useEffect, useLayoutEffect, useState, useRef } = React;


  const [, update] = useState();

  const observer = useRef(new Observer(() => update({})));

  observer.current.startRecording();
  useLayoutEffect(() => {
    observer.current.stopRecording();
  });

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      observer.current.teardown();
      observer.current = null;
    };
  }, []);
}
