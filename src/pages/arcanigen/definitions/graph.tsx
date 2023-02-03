import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useSyncExternalStore } from "react";
import { IArcaneGraph, INodeDefinition, INodeHelper, INodeInstance, LinkTypes, NodeTypes, SocketTypes } from "./types";
import { v4 as uuid } from "uuid";
import ObjHelper from "!/utility/objHelper";
import fp from "lodash/fp";
import lodash from "lodash";
import { getNodeHelper } from ".";

const initialState: IArcaneGraph = {
   nodes: {
      ROOT: {
         nodeId: "ROOT",
         canvasColor: { r: 1, g: 1, b: 1, a: 1 },
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

   const set = useCallback(<T,>(lens: string) => {
      return (arg: T | ((previous: T) => T)) => {
         const prev = lodash.get(graphStore.current, lens) as T;
         graphStore.current = fp.set<IArcaneGraph>(lens, typeof arg === "function" ? (arg as (v: T) => T)(prev) : arg, graphStore.current);
         graphListeners.current.forEach((callback) => callback());
      };
   }, []);

   const setPartial = useCallback(<T,>(lens: string) => {
      return (arg: Partial<T> | ((previous: T) => T)) => {
         const prev = lodash.get(graphStore.current, lens) as T;
         graphStore.current = fp.set<IArcaneGraph>(lens, typeof arg === "function" ? (arg as (v: T) => T)(prev) : { ...prev, ...arg }, graphStore.current);
         graphListeners.current.forEach((callback) => callback());
      };
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
         set,
         setPartial,
      }),
      [addNode, connect, disconnect, getGraph, getPositions, removeNode, set, setPartial, setPosition, subToGraph, subToPos]
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
      return useSyncExternalStore(store.subToGraph, () => getNodeInput<T, K>(store.getGraph(), nodeId, socket));
   };

   const useInputNodeId = <K extends keyof T["inputs"]>(nodeId: string, socket: K) => {
      const store = useContext(StoreContext)!;
      return useSyncExternalStore(store.subToGraph, () => {
         const graph = store.getGraph();
         const linkId = (graph.nodes?.[nodeId] as INodeInstance<T>)?.in?.[socket];
         if (linkId) {
            return graph.links?.[linkId]?.fromNode;
         }
      });
   };

   const useCoalesce = <K extends keyof T["inputs"], J extends keyof T["values"]>(nodeId: string, socket: K, key: J) => {
      const store = useContext(StoreContext)!;

      return useSyncExternalStore(store.subToGraph, () => {
         const graph = store.getGraph();
         return getNodeInput<T, K>(graph, nodeId, socket) ?? getNodeValue<T, J>(graph, nodeId, key);
      });
   };

   const useValueState = <K extends keyof T["values"]>(nodeId: string, slot: K) => {
      const store = useContext(StoreContext)!;
      const state = useSyncExternalStore(store.subToGraph, () => {
         const graph = store.getGraph();
         return (graph.nodes[nodeId] as INodeInstance<T>)[slot] as T["values"][K];
      });

      const set = useMemo(() => {
         return store.set<T["values"][K]>(`nodes.${nodeId}.${slot as string}`);
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

   return {
      useValue,
      useValueState,
      useHasLink,
      useInput,
      useInputNodeId,
      useCoalesce,
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

   return useSyncExternalStore(store.subToGraph, () => {
      const graph = store.getGraph();
      const fN = graph.nodes[fromNode]?.out;
      const tN = graph.nodes[toNode]?.in;
      return [fN, tN] as [typeof fN, typeof tN];
   });
};

const ArcaneGraph = {
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
            return (getNodeHelper(type) as INodeHelper<any>).getOutput(graph, fromNode, fromSocket) as T["inputs"][K];
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

      return {
         ...graph,
         nodes: {
            ...graph.nodes,
            ...(prevLink
               ? ObjHelper.modify(graph.nodes, fromNode, (prev) => {
                    const s = graph.links[prevLink!].fromSocket;
                    return {
                       ...prev,
                       out: {
                          ...prev.out,
                          [s]: prev.out[s].filter((l) => l !== prevLink),
                       },
                    };
                 })
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
