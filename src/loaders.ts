import { Result } from "@badrap/result";

//Webpack Module Federation primitative declarations
declare const __webpack_init_sharing__: (scope: string) => void;
declare const __webpack_share_scopes__: { default: any };

interface Module {
    [fn: string]: (id: string, props: { [key: string]: string; }) => void;
}

interface ModuleContainer {
    init: (scope: any) => void;
    get: (module: string) => () => Module;
}

/**
 * loadScript
 * @param url 
 * @param moduleName 
 * @param integrity 
 * @param onload 
 * @param onerror 
 */
const loadScript = async (url: string, moduleName: string, integrity: string|undefined = undefined, onload: undefined|(() => void) = undefined, onerror: OnErrorEventHandler|undefined = undefined) => {
  const script = document.createElement("script");
  
  script.src = url || "";
  script.type = "text/javascript";
  script.async = true;
  script.id = `${moduleName}_mod` || "";

  if (integrity) {
    script.integrity = integrity;
    script.crossOrigin = "anonymous";
  }

  script.onload = () => {
    document.head.removeChild(script);
    if (onload) {
      onload();
    }
  };
  if (onerror) {
    script.onerror = onerror;
  }

  document.head.appendChild(script);
}

/**
 * loadModuleFactory
 * @param moduleName 
 * @param exportName 
 * @returns 
 */
const loadModuleFactory = async (
  moduleName: string,
  exportName: string
): Promise<Result<Module>> => {
  try {
    await __webpack_init_sharing__("default");
  } catch (e) {
    return Result.err(new Error("Failed to initialize the sharing scope(s)"));
  }
  const container: ModuleContainer | undefined = (window as any)[moduleName];

  if (!container || !Object.keys(container).includes("init")) {
    return Result.err(
      new Error(`Failed to find module container loaded under specified module name: ${moduleName}`)
    );
  }
  await container.init(__webpack_share_scopes__.default);
  try {
    const factory = await container.get(exportName);
    const mod = factory();
    return Result.ok(mod);
  } catch (e) {
    return Result.err(
      new Error(
        `Could not find module of name ${exportName} within the loaded federated container`
      )
    );
  }
};

export {
    loadModuleFactory,
    loadScript
}