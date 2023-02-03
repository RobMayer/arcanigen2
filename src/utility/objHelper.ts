const ObjHelper = {
   remove: (obj: Record<string, any>, ...keys: (string | undefined)[]) => {
      return keys.reduce((acc, k) => {
         if (k && k in acc) {
            const { [k]: toRem, ...rest } = acc;
            return rest;
         }
         return acc;
      }, obj);
   },
   modify: <T extends Record<string, any>>(obj: T, key: keyof T | undefined, cb: (val: T[keyof T]) => T[keyof T]) => {
      if (key && key in obj) {
         return { [key]: cb(obj[key]) };
      } else {
         return {};
      }
   },
};

export default ObjHelper;
