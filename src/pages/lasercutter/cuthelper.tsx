export const drawRect = (w: number, h: number) => {
   return `m ${-(w / 2)},${-(h / 2)} h ${w} v ${h} h ${-w} z m ${w / 2},${h / 2}`;
};

export const cutRect = (w: number, h: number) => {
   return `m ${w / 2},${h / 2} v ${-h} h ${-w} v ${h} z m ${-(w / 2)},${-(h / 2)}`;
};
