import { c, Props, useEffect, useRef, useState } from "atomico";
import { useRender } from "@atomico/hooks/use-render";
import { useSlot } from "@atomico/hooks/use-slot";
import { loadModuleFactory, loadScript } from "./loaders";

componentContainer.props = {
    componentName: {
      type: String,
      value: "",
    },
    url: {
      type: String,
      value: "",
    },
    data: {
      type: Object,
    },
    exportName: {
      type: String,
      value: "",
    },
    fn: {
      type: String,
    },
    integrity: {
      type: String,
    },
    class: {
      type: String,
    },
  };
  

function componentContainer({
  componentName,
  url,
  integrity,
  exportName,
  fn,
  data,
}: Props<typeof componentContainer>) {
  const ref = useRef();
  const slotContent = useSlot(ref);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loadedModule, setLoadedModule] = useState({});

  useEffect(() => {
    let missingProps = false;
    if (
      componentName?.length == 0 ||
      url?.length == 0 ||
      exportName?.length == 0
    ) {
      setReady(false);
      setFailed(true);
      missingProps = true;
      console.error(
        "Please ensure the following properties are defined with a non-null value: module-name, url, export-name"
      );
    }
    let federate = async (missingProps: boolean) => {
      if (
        !ready &&
        slotContent &&
        (slotContent.length == 0 ||
          (slotContent[0] as Element).innerHTML.length == 0) &&
        !missingProps
      ) {
        setReady(false);
        setFailed(false);

        loadScript(url as string, componentName as string, integrity as string, () => {
            setReady(true);
            setFailed(false);
          }, (onerror = () => {
            setReady(false);
            setFailed(true);
          }));
      } else if (
        ready &&
        slotContent &&
        (slotContent.length == 0 ||
          (slotContent[0] as Element).innerHTML.length == 0) &&
        !missingProps
      ) {
        let mod = await loadModuleFactory(componentName || "", exportName || "");

        if (mod.isErr) {
          setFailed(true);
          console.error(mod.error);
        } else {
          let m = mod.unwrap();

          setLoadedModule(Object.assign({}, m));

          if (fn && !Object.keys(m).includes(fn)) {
            console.error(
              `A function with name ${fn} not found in the federated module`
            );
            setFailed(true);
            return;
          }

          if (fn) {
            m[fn](componentName as string, data);
          }
        }
      }
    };

    federate(missingProps);
  }, [url, module, componentName, ref, ready]);

  useEffect(() => () => {
      (window as any)[componentName || ""] = undefined;
  }, []);

  useRender(() => <div slot="internal" id={componentName}></div>);

  return (
    <host shadowDom {...loadedModule}>
      {failed ? <slot name="failure"></slot> : null}
      {!ready && !failed ? <slot name="loading"></slot> : null}
      <slot name="internal" ref={ref}></slot>
    </host>
  );
}


export const ComponentContainer = c(componentContainer);

customElements.define("comp-container", ComponentContainer);
