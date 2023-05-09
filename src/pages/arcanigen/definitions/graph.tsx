import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { Globals, IArcaneGraph, IArcanePos, IArcaneToggle, INodeDefinition, INodeHelper, INodeInstance, LinkTypes, NodeTypes, SocketTypes } from "./types";
import { v4 as uuid } from "uuid";
import fp from "lodash/fp";
import lodash from "lodash";
import { getNodeHelper } from ".";
import migrateLoadedFile, { SAVE_VERSION } from "./migration";
import { getStartScene } from "./startScene";

const resetGraphState = () => {
   return {
      nodes: {
         ROOT: {
            nodeId: "ROOT",
            canvasColor: { r: 1, g: 1, b: 1, a: 1 },
            canvasWidth: { value: 800, unit: "px" },
            canvasHeight: { value: 800, unit: "px" },
            type: NodeTypes.META_RESULT,
            in: {
               result: null,
               canvasColor: null,
            },
            out: {},
         } as INodeInstance<INodeDefinition>,
      },
      links: {},
   };
};

const resetPosState = () => {
   return {
      ROOT: { x: 0, y: 0 },
   };
};

const resetToggleState = () => {
   return {
      ROOT: {
         node: true,
      },
   };
};

const useStoreData = () => {
   const graphStore = useRef<IArcaneGraph>(resetGraphState());
   const posStore = useRef<IArcanePos>(resetPosState());
   const toggleStore = useRef<IArcaneToggle>(resetToggleState());
   const getGraph = useCallback(() => graphStore.current, []);
   const getPositions = useCallback(() => posStore.current, []);
   const getToggles = useCallback(() => toggleStore.current, []);

   const graphListeners = useRef(new Set<() => void>());
   const positionListeners = useRef(new Set<() => void>());
   const toggleListeners = useRef(new Set<() => void>());

   const subToGraph = useCallback((cb: () => void) => {
      graphListeners.current.add(cb);
      return () => graphListeners.current.delete(cb);
   }, []);

   const subToPos = useCallback((cb: () => void) => {
      positionListeners.current.add(cb);
      return () => positionListeners.current.delete(cb);
   }, []);

   const subToToggle = useCallback((cb: () => void) => {
      toggleListeners.current.add(cb);
      return () => toggleListeners.current.delete(cb);
   }, []);

   const setPosition = useCallback((nodeId: string, pos: { x: number; y: number }) => {
      posStore.current = {
         ...posStore.current,
         [nodeId]: pos,
      };
      positionListeners.current.forEach((callback) => callback());
   }, []);

   const setNodeToggle = useCallback((nodeId: string, state: boolean | ((p: boolean) => boolean)) => {
      const prev = toggleStore.current?.[nodeId]?.node ?? true;
      toggleStore.current = {
         ...toggleStore.current,
         [nodeId]: {
            ...(toggleStore.current[nodeId] ?? {}),
            node: typeof state === "function" ? state(prev) : state,
         },
      };
      toggleListeners.current.forEach((callback) => callback());
   }, []);

   const setNodePanelToggle = useCallback((nodeId: string, panel: string, state: boolean | ((p: boolean) => boolean), def: boolean) => {
      const prev = toggleStore.current?.[nodeId]?.[panel] ?? def;
      toggleStore.current = {
         ...toggleStore.current,
         [nodeId]: {
            ...(toggleStore.current[nodeId] ?? {}),
            [panel]: typeof state === "function" ? state(prev) : state,
         },
      };
      toggleListeners.current.forEach((callback) => callback());
   }, []);

   const connect = useCallback((fromNode: string, fromSocket: string, toNode: string, toSocket: string, type: LinkTypes) => {
      graphStore.current = GraphHelper.connect(graphStore.current, uuid(), fromNode, fromSocket, toNode, toSocket, type);
      graphListeners.current.forEach((callback) => callback());
   }, []);

   const disconnect = useCallback((linkId: string) => {
      graphStore.current = GraphHelper.disconnect(graphStore.current, linkId);
      graphListeners.current.forEach((callback) => callback());
   }, []);

   const debug = useCallback(() => {
      console.log({
         nodes: graphStore.current.nodes,
         links: graphStore.current.links,
         positions: posStore.current,
      });
   }, []);

   const reset = useCallback(() => {
      graphStore.current = resetGraphState();
      posStore.current = resetPosState();
      toggleStore.current = resetToggleState();
      graphListeners.current.forEach((callback) => callback());
      positionListeners.current.forEach((callback) => callback());
      toggleListeners.current.forEach((callback) => callback());
   }, []);

   const save = useCallback(() => {
      return {
         version: SAVE_VERSION,
         nodes: graphStore.current.nodes,
         links: graphStore.current.links,
         positions: posStore.current,
         toggles: toggleStore.current,
      };
   }, []);

   const load = useCallback(({ version, ...data }: IArcaneGraph & { positions: IArcanePos } & { toggles: IArcaneToggle } & { version: string }) => {
      data = migrateLoadedFile(version, data);
      const { nodes, links, positions, toggles } = data;
      graphStore.current = { nodes, links };
      posStore.current = positions ?? {};
      toggleStore.current = toggles ?? {};
      graphListeners.current.forEach((callback) => callback());
      positionListeners.current.forEach((callback) => callback());
      toggleListeners.current.forEach((callback) => callback());
   }, []);

   const addNode = useCallback((type: NodeTypes, at?: { x: number; y: number }) => {
      const nodeId = uuid();
      graphStore.current = GraphHelper.append(graphStore.current, nodeId, type, { ...getNodeHelper(type).initialize(), name: "" });
      posStore.current = { ...posStore.current, [nodeId]: at ?? { x: 0, y: 0 } };
      toggleStore.current = { ...toggleStore.current, [nodeId]: { node: true } };
      graphListeners.current.forEach((callback) => callback());
      positionListeners.current.forEach((callback) => callback());
      toggleListeners.current.forEach((callback) => callback());
   }, []);

   const duplicateNode = useCallback((nodeId: string, at?: { x: number; y: number }) => {
      const newNodeId = uuid();
      const { nodeId: extantId, in: extantIn, out: extantOut, type: extantType, ...extantValues } = graphStore.current.nodes[nodeId];
      const extantPos = posStore.current[nodeId];
      graphStore.current = GraphHelper.append(graphStore.current, newNodeId, extantType, {
         ...getNodeHelper(extantType).initialize(),
         ...extantValues,
         name: "",
      });
      posStore.current = { ...posStore.current, [newNodeId]: at ?? { x: (extantPos?.x ?? 0) + 30, y: (extantPos?.y ?? 0) + 30 } };
      console.log(posStore.current);
      toggleStore.current = { ...toggleStore.current, [newNodeId]: { node: true } };
      graphListeners.current.forEach((callback) => callback());
      positionListeners.current.forEach((callback) => callback());
      toggleListeners.current.forEach((callback) => callback());
   }, []);

   const removeNode = useCallback((nodeId: string) => {
      graphStore.current = GraphHelper.remove(graphStore.current, nodeId);
      posStore.current = Object.entries(posStore.current).reduce((acc, [k, v]) => {
         if (k !== nodeId) {
            acc[k] = v;
         }
         return acc;
      }, {} as IArcanePos);
      toggleStore.current = Object.entries(toggleStore.current).reduce((acc, [k, v]) => {
         if (k !== nodeId) {
            acc[k] = v;
         }
         return acc;
      }, {} as IArcaneToggle);
      graphListeners.current.forEach((callback) => callback());
      positionListeners.current.forEach((callback) => callback());
      toggleListeners.current.forEach((callback) => callback());
   }, []);

   const setLensed = useCallback(<T,>(lens: string) => {
      return (arg: T | ((previous: T) => T)) => {
         const prev = lodash.get(graphStore.current, lens) as T;
         graphStore.current = fp.set<IArcaneGraph>(lens, typeof arg === "function" ? (arg as (v: T) => T)(prev) : arg, graphStore.current);
         graphListeners.current.forEach((callback) => callback());
      };
   }, []);

   const setPartialLens = useCallback(<T,>(lens: string) => {
      return (arg: Partial<T> | ((previous: T) => T)) => {
         const prev = lodash.get(graphStore.current, lens) as T;
         graphStore.current = fp.set<IArcaneGraph>(lens, typeof arg === "function" ? (arg as (v: T) => T)(prev) : { ...prev, ...arg }, graphStore.current);
         graphListeners.current.forEach((callback) => callback());
      };
   }, []);

   const setGraph = useCallback((arg: Partial<IArcaneGraph> | ((v: IArcaneGraph) => IArcaneGraph)) => {
      const prev = graphStore.current;
      graphStore.current = typeof arg === "function" ? arg(prev) : { ...graphStore.current, ...arg };
      graphListeners.current.forEach((callback) => callback());
   }, []);

   useEffect(() => {
      load({ version: SAVE_VERSION, ...getStartScene() });
   }, [load]);

   return useMemo(
      () => ({
         getGraph,
         subToGraph,

         getPositions,
         setPosition,
         subToPos,

         subToToggle,
         getToggles,
         setNodeToggle,
         setNodePanelToggle,

         graphMethods: {
            connect,
            disconnect,
            addNode,
            removeNode,
            duplicateNode,
            debug,
            save,
            load,
            reset,
         },
         setGraph,
         setLensed,
         setPartialLens,
      }),
      [
         getGraph,
         subToGraph,
         getPositions,
         setPosition,
         subToPos,
         subToToggle,
         getToggles,
         setNodeToggle,
         setNodePanelToggle,
         connect,
         disconnect,
         duplicateNode,
         addNode,
         removeNode,
         debug,
         save,
         load,
         reset,
         setGraph,
         setLensed,
         setPartialLens,
      ]
   );
};

const StoreContext = createContext<ReturnType<typeof useStoreData> | null>(null);

export const ArcaneGraphProvider = ({ children }: { children: ReactNode }) => {
   const s = useStoreData();
   return <StoreContext.Provider value={s}>{children}</StoreContext.Provider>;
};

const nodeHooks = <T extends INodeDefinition>() => {
   const useValue = <K extends keyof T["values"]>(nodeId: string, key: K) => {
      const store = useContext(StoreContext)!;
      return useSyncExternalStore(store.subToGraph, () => getNodeValue<T, K>(store.getGraph(), nodeId, key));
   };

   const useInput = <K extends keyof T["inputs"]>(nodeId: string, socket: K, globals: Globals) => {
      const store = useContext(StoreContext)!;

      const graph = useSyncExternalStore(store.subToGraph, () => store.getGraph());

      // TODO: FIX MY RETURN - Needs to handle undefined possibility...
      return useMemo(() => {
         return getNodeInput<T, K>(graph, nodeId, socket, globals);
      }, [graph, nodeId, socket, globals]) as T["inputs"][K];
   };

   const useInputNode = <K extends keyof T["inputs"]>(nodeId: string, socket: K, globals: Globals): [T["inputs"][K], string] | [null, null] => {
      const store = useContext(StoreContext)!;

      const graph = useSyncExternalStore(store.subToGraph, () => store.getGraph());

      // TODO: FIX MY RETURN - Needs to handle undefined possibility...
      const value = useMemo(() => {
         return getNodeInput<T, K>(graph, nodeId, socket, globals);
      }, [graph, nodeId, socket, globals]) as T["inputs"][K];

      const otherNode = useMemo(() => {
         const linkId = graph.nodes[nodeId]?.in?.[socket as string];
         if (linkId) {
            return graph.links[linkId].fromNode;
         }
      }, [graph, nodeId, socket]);

      return [value, otherNode ?? null];
   };

   const useCoalesce = <K extends keyof T["inputs"], J extends keyof T["values"]>(nodeId: string, socket: K, key: J, globals: Globals) => {
      const input = useInput<K>(nodeId, socket, globals);
      const value = useValue<J>(nodeId, key);

      return input ?? value;
   };

   const useValueState = <K extends keyof T["values"]>(nodeId: string, slot: K) => {
      const store = useContext(StoreContext)!;
      const state = useSyncExternalStore(store.subToGraph, () => {
         const graph = store.getGraph();
         return (graph.nodes[nodeId] as INodeInstance<T>)[slot] as T["values"][K];
      });

      const set = useMemo(() => {
         return store.setLensed<T["values"][K]>(`nodes.${nodeId}.${slot as string}`);
      }, [store, nodeId, slot]);

      return [state, set] as [typeof state, typeof set];
   };

   const useHasLink = <K extends keyof T["inputs"]>(nodeId: string, socket: K) => {
      const store = useContext(StoreContext)!;

      return useSyncExternalStore(store.subToGraph, () => {
         const graph = store.getGraph();
         return !!(graph.nodes?.[nodeId] as INodeInstance<T>)?.in?.[socket];
      });
   };

   const useAlterNode = (nodeId: string) => {
      const store = useContext(StoreContext)!;

      const node = useSyncExternalStore(store.subToGraph, () => store.getGraph().nodes[nodeId]);

      const setNode = useMemo(() => {
         return store.setPartialLens<INodeInstance<T>>(`nodes.${nodeId}`);
      }, [store, nodeId]);

      return [node, setNode, store.setGraph] as [INodeInstance<T>, typeof setNode, typeof store.setGraph];
   };

   return {
      useValue,
      useValueState,
      useHasLink,
      useInput,
      useInputNode,
      useCoalesce,
      useAlterNode,
   };
};

const nodeMethods = <T extends INodeDefinition>() => {
   const getValue = <K extends keyof T["values"]>(graph: IArcaneGraph, nodeId: string, key: K) => {
      return getNodeValue<T, K>(graph, nodeId, key);
   };

   const getInput = <K extends keyof T["inputs"]>(graph: IArcaneGraph, nodeId: string, socket: K, globals: Globals) => {
      return getNodeInput<T, K>(graph, nodeId, socket, globals);
   };

   const hasInput = <K extends keyof T["inputs"]>(graph: IArcaneGraph, nodeId: string, socket: K) => {
      return !!(graph.nodes?.[nodeId] as INodeInstance<T>)?.in?.[socket];
   };

   const coalesce = <K extends keyof T["inputs"], J extends keyof T["values"]>(graph: IArcaneGraph, nodeId: string, socket: K, key: J, globals: Globals) => {
      return getNodeInput<T, K>(graph, nodeId, socket, globals) ?? getNodeValue<T, J>(graph, nodeId, key);
   };

   return {
      getValue,
      getInput,
      hasInput,
      coalesce,
   };
};

const useGraph = () => {
   return useContext(StoreContext)!.graphMethods;
};

const useNodelist = () => {
   const store = useContext(StoreContext)!;

   return useSyncExternalStore(store.subToGraph, () => {
      const { nodes } = store.getGraph();
      return nodes;
   });
};

const useLinklist = () => {
   const store = useContext(StoreContext)!;

   return useSyncExternalStore(store.subToGraph, () => {
      const { links } = store.getGraph();
      return links;
   });
};

const ArcaneGraph = {
   nodeMethods,
   nodeHooks,
   useGraph,
   useNodelist,
   useLinklist,
};
export default ArcaneGraph;

/* Utility Functions */

const getNodeValue = <T extends INodeDefinition, K extends keyof T["values"]>(graph: IArcaneGraph, nodeId: string, key: K) => {
   return (graph.nodes?.[nodeId] as INodeInstance<T>)?.[key];
};

const getNodeInput = <T extends INodeDefinition, K extends keyof T["inputs"]>(graph: IArcaneGraph, nodeId: string, socket: K, globals: Globals) => {
   const linkId = (graph.nodes?.[nodeId] as INodeInstance<T>)?.in?.[socket];
   if (linkId) {
      const { fromSocket, fromNode } = graph.links?.[linkId] ?? {};
      if (fromSocket && fromNode) {
         const { type } = graph.nodes?.[fromNode] ?? {};
         if (type) {
            const result = (getNodeHelper(type) as INodeHelper<any>).getOutput(graph, fromNode, fromSocket, globals) as T["inputs"][K];
            return result;
         }
      }
   }
};

export const areSocketsCompatible = (a: SocketTypes, b: SocketTypes) => {
   return (a & b) > 0;
};

export const useNodePosition = (nodeId: string) => {
   const store = useContext(StoreContext)!;

   const state = useSyncExternalStore(store.subToPos, () => store.getPositions()[nodeId]);

   const set = useCallback(
      (position: { x: number; y: number }) => {
         return store.setPosition(nodeId, position);
      },
      [store, nodeId]
   );

   return [state, set] as [typeof state, typeof set];
};

export const useNodeToggle = (nodeId: string) => {
   const store = useContext(StoreContext)!;

   const state = useSyncExternalStore(store.subToToggle, () => store.getToggles()?.[nodeId]?.node);

   const set = useCallback((val: boolean | ((p: boolean) => boolean)) => store.setNodeToggle(nodeId, val), [store, nodeId]);

   return [state ?? true, set] as [typeof state, typeof set];
};

export const useNodePanelToggle = (nodeId: string, panel: string, def: boolean) => {
   const store = useContext(StoreContext)!;

   const state = useSyncExternalStore(store.subToToggle, () => store.getToggles()?.[nodeId]?.[panel]);

   const set = useCallback((val: boolean | ((p: boolean) => boolean)) => store.setNodePanelToggle(nodeId, panel, val, def), [store, nodeId, panel, def]);

   return [state ?? def, set] as [typeof state, typeof set];
};

const GraphHelper = {
   connect: (graph: IArcaneGraph, linkId: string, fromNode: string, fromSocket: string, toNode: string, toSocket: string, type: LinkTypes): IArcaneGraph => {
      const prevLink = graph.nodes?.[toNode].in?.[toSocket];

      if (prevLink) {
         graph = GraphHelper.disconnect(graph, prevLink);
      }

      return {
         ...graph,
         nodes: {
            ...graph.nodes,
            [toNode]: {
               ...graph.nodes[toNode],
               in: {
                  ...graph.nodes[toNode].in,
                  [toSocket]: linkId,
               },
            },
            [fromNode]: {
               ...graph.nodes[fromNode],
               out: {
                  ...graph.nodes[fromNode].out,
                  [fromSocket]: [...(graph.nodes[fromNode].out?.[fromSocket] ?? []), linkId],
               },
            },
         },
         links: {
            ...graph.links,
            [linkId]: {
               linkId,
               fromNode,
               fromSocket,
               toNode,
               toSocket,
               type,
            },
         },
      };
   },
   disconnect: (graph: IArcaneGraph, linkId: string): IArcaneGraph => {
      const { fromNode, toNode, fromSocket, toSocket } = graph.links[linkId];

      return {
         ...graph,
         nodes: {
            ...graph.nodes,
            [toNode]: {
               ...graph.nodes[toNode],
               in: {
                  ...graph.nodes[toNode].in,
                  [toSocket]: null,
               },
            },
            [fromNode]: {
               ...graph.nodes[fromNode],
               out: {
                  ...graph.nodes[fromNode].out,
                  [fromSocket]: (graph.nodes[fromNode].out?.[fromSocket] ?? []).filter((l) => l !== linkId),
               },
            },
         },
         links: Object.entries(graph.links).reduce((acc, [k, v]) => {
            if (k !== linkId) {
               acc[k] = v;
            }
            return acc;
         }, {} as IArcaneGraph["links"]),
      };
   },

   remove: (graph: IArcaneGraph, nodeId: string): IArcaneGraph => {
      const links = Object.values(graph.nodes[nodeId].out).reduce((acc, each) => {
         if (!each) {
            console.warn("null or empty id found on", nodeId);
         }
         return [...acc, ...each];
      }, Object.values(graph.nodes[nodeId].in));

      const p = links.reduce((res, l) => {
         if (l) {
            return GraphHelper.disconnect(res, l);
         }
         return res;
      }, graph);

      return {
         ...p,
         nodes: Object.entries(p.nodes).reduce((acc, [k, v]) => {
            if (k !== nodeId) {
               acc[k] = v;
            }
            return acc;
         }, {} as IArcaneGraph["nodes"]),
      };
   },

   append: <T extends INodeInstance<any>>(
      graph: IArcaneGraph,
      nodeId: string,
      type: NodeTypes,
      data: Partial<Omit<INodeInstance<any>, "type" | "nodeId">> & Omit<T, keyof INodeInstance<any>>
   ): IArcaneGraph => {
      return {
         ...graph,
         nodes: {
            ...graph.nodes,
            [nodeId]: {
               ...data,
               in: {},
               out: {},
               type,
               nodeId,
            },
         },
      };
   },
};
