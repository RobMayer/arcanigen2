import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useSyncExternalStore } from "react";
import { IArcaneGraph, INodeDefinition, INodeHelper, INodeInstance, LinkTypes, NodeRenderer, NodeTypes, SocketTypes } from "./types";
import { v4 as uuid } from "uuid";
import ObjHelper from "!/utility/objHelper";
import fp from "lodash/fp";
import lodash from "lodash";
import { getNodeHelper } from ".";
import useWhyDidYouUpdate from "!/utility/hooks/useWhyDidYouUpdate";

const initialState: IArcaneGraph = {
   nodes: {
      ROOT: {
         nodeId: "ROOT",
         canvasColor: { r: 1, g: 1, b: 1, a: 1 },
         canvasWidth: { value: 800, unit: "px" },
         canvasHeight: { value: 800, unit: "px" },
         type: NodeTypes.RESULT,
         in: {
            result: null,
            canvasColor: null,
         },
         out: {},
      } as INodeInstance<INodeDefinition>,
   },
   links: {},
};

type IArcanePos = { [key: string]: { x: number; y: number } };

const initialPos: IArcanePos = {
   ROOT: { x: 0, y: 0 },
};

const useStoreData = () => {
   const graphStore = useRef<IArcaneGraph>(initialState);
   const posStore = useRef<IArcanePos>(initialPos);
   const getGraph = useCallback(() => graphStore.current, []);
   const getPositions = useCallback(() => posStore.current, []);

   const graphListeners = useRef(new Set<() => void>());
   const positionListeners = useRef(new Set<() => void>());

   const subToGraph = useCallback((cb: () => void) => {
      graphListeners.current.add(cb);
      return () => graphListeners.current.delete(cb);
   }, []);

   const subToPos = useCallback((cb: () => void) => {
      positionListeners.current.add(cb);
      return () => positionListeners.current.delete(cb);
   }, []);

   const setPosition = useCallback((nodeId: string, pos: { x: number; y: number }) => {
      posStore.current = {
         ...posStore.current,
         [nodeId]: pos,
      };
      positionListeners.current.forEach((callback) => callback());
   }, []);

   const connect = useCallback((fromNode: string, fromSocket: string, toNode: string, toSocket: string, type: LinkTypes) => {
      graphStore.current = GraphHelper.connect(graphStore.current, uuid(), fromNode, fromSocket, toNode, toSocket, type);
      graphListeners.current.forEach((callback) => callback());
   }, []);

   const disconnect = useCallback((linkId: string) => {
      graphStore.current = GraphHelper.disconnect(graphStore.current, linkId);
      graphListeners.current.forEach((callback) => callback());
   }, []);

   const addNode = useCallback((type: NodeTypes, at?: { x: number; y: number }) => {
      const nodeId = uuid();
      graphStore.current = GraphHelper.append(graphStore.current, nodeId, type, getNodeHelper(type).initialize());
      posStore.current = { ...posStore.current, [nodeId]: at ?? { x: 0, y: 0 } };
      graphListeners.current.forEach((callback) => callback());
      positionListeners.current.forEach((callback) => callback());
   }, []);

   const removeNode = useCallback((nodeId: string) => {
      graphStore.current = GraphHelper.remove(graphStore.current, nodeId);
      posStore.current = ObjHelper.remove(posStore.current, nodeId);
      graphListeners.current.forEach((callback) => callback());
      positionListeners.current.forEach((callback) => callback());
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

   return useMemo(
      () => ({
         getGraph,
         subToGraph,

         getPositions,
         setPosition,
         subToPos,

         graphMethods: {
            connect,
            disconnect,
            addNode,
            removeNode,
         },
         setGraph,
         setLensed,
         setPartialLens,
      }),
      [addNode, connect, disconnect, getGraph, getPositions, removeNode, setLensed, setPartialLens, setPosition, subToGraph, subToPos, setGraph]
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

   const useInput = <K extends keyof T["inputs"]>(nodeId: string, socket: K) => {
      const store = useContext(StoreContext)!;

      const linkId = useSyncExternalStore(store.subToGraph, () => store.getGraph().nodes[nodeId]?.in?.[socket as string]) ?? "";
      const { fromNode, fromSocket } = useSyncExternalStore(store.subToGraph, () => store.getGraph().links[linkId]) ?? {};
      const { type, nodeId: otherNode } = useSyncExternalStore(store.subToGraph, () => store.getGraph().nodes[fromNode]) ?? {};

      if (type && otherNode) {
         return (getNodeHelper(type) as INodeHelper<any>).getOutput(store.getGraph(), otherNode, fromSocket);
      }
   };

   const useInputNode = <K extends keyof T["inputs"]>(nodeId: string, socket: K): [NodeRenderer, string] | [null, null] => {
      const store = useContext(StoreContext)!;

      const linkId = useSyncExternalStore(store.subToGraph, () => store.getGraph().nodes[nodeId]?.in?.[socket as string]) ?? "";
      const { fromNode, fromSocket } = useSyncExternalStore(store.subToGraph, () => store.getGraph().links[linkId]) ?? {};
      const { type, nodeId: otherNode } = useSyncExternalStore(store.subToGraph, () => store.getGraph().nodes[fromNode]) ?? {};

      if (type && otherNode) {
         const res = (getNodeHelper(type) as INodeHelper<any>).getOutput(store.getGraph(), otherNode, fromSocket);
         return [res, otherNode];
      }
      return [null, null];
   };

   const useCoalesce = <K extends keyof T["inputs"], J extends keyof T["values"]>(nodeId: string, socket: K, key: J) => {
      const input = useInput<K>(nodeId, socket);
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

   const getInput = <K extends keyof T["inputs"]>(graph: IArcaneGraph, nodeId: string, socket: K) => {
      return getNodeInput<T, K>(graph, nodeId, socket);
   };

   const hasInput = <K extends keyof T["inputs"]>(graph: IArcaneGraph, nodeId: string, socket: K) => {
      return !!(graph.nodes?.[nodeId] as INodeInstance<T>)?.in?.[socket];
   };

   const coalesce = <K extends keyof T["inputs"], J extends keyof T["values"]>(graph: IArcaneGraph, nodeId: string, socket: K, key: J) => {
      return getNodeInput<T, K>(graph, nodeId, socket) ?? getNodeValue<T, J>(graph, nodeId, key);
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

const useLinkWatcher = (fromNode: string, toNode: string) => {
   const store = useContext(StoreContext)!;

   const fromNodeOut = useSyncExternalStore(store.subToGraph, () => {
      return store.getGraph().nodes[fromNode]?.out;
   });

   const toNodeIn = useSyncExternalStore(store.subToGraph, () => {
      return store.getGraph().nodes[toNode]?.in;
   });

   useWhyDidYouUpdate("useLinkWatcher", { fromNodeOut, toNodeIn });

   return [fromNodeOut, toNodeIn] as [typeof fromNodeOut, typeof toNodeIn];
};

const ArcaneGraph = {
   nodeMethods,
   nodeHooks,
   useGraph,
   useNodelist,
   useLinklist,
   useLinkWatcher,
};
export default ArcaneGraph;

/* Utility Functions */

const getNodeValue = <T extends INodeDefinition, K extends keyof T["values"]>(graph: IArcaneGraph, nodeId: string, key: K) => {
   return (graph.nodes?.[nodeId] as INodeInstance<T>)?.[key];
};

const getNodeInput = <T extends INodeDefinition, K extends keyof T["inputs"]>(graph: IArcaneGraph, nodeId: string, socket: K) => {
   const linkId = (graph.nodes?.[nodeId] as INodeInstance<T>)?.in?.[socket];
   if (linkId) {
      const { fromSocket, fromNode } = graph.links?.[linkId] ?? {};
      if (fromSocket && fromNode) {
         const { type } = graph.nodes?.[fromNode] ?? {};
         if (type) {
            const result = (getNodeHelper(type) as INodeHelper<any>).getOutput(graph, fromNode, fromSocket) as T["inputs"][K];
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

const GraphHelper = {
   connect: (graph: IArcaneGraph, linkId: string, fromNode: string, fromSocket: string, toNode: string, toSocket: string, type: LinkTypes): IArcaneGraph => {
      const prevLink = graph.nodes?.[toNode].in?.[toSocket] ?? undefined;

      if (prevLink) {
         console.log(graph.nodes[graph.links[prevLink].fromNode].out, fromSocket);
      }

      return {
         ...graph,
         nodes: {
            ...graph.nodes,
            ...(prevLink
               ? {
                    [graph.nodes[graph.links[prevLink].fromNode].nodeId]: {
                       ...graph.nodes[graph.links[prevLink].fromNode],
                       out: {
                          ...graph.nodes[graph.links[prevLink].fromNode].out,
                          [graph.links[prevLink].fromSocket]: graph.nodes[graph.links[prevLink].fromNode].out[graph.links[prevLink].fromSocket].filter(
                             (l) => l !== prevLink
                          ),
                       },
                    },
                 }
               : {}),
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
            ...ObjHelper.remove(graph.links, prevLink),
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
         links: ObjHelper.remove(graph.links, linkId),
      };
   },

   remove: (graph: IArcaneGraph, nodeId: string): IArcaneGraph => {
      const links = Object.values(graph.nodes[nodeId].out).reduce((acc, each) => {
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
         nodes: ObjHelper.remove(p.nodes, nodeId),
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
               in: {},
               out: {},
               ...data,
               type,
               nodeId,
            },
         },
      };
   },
};
