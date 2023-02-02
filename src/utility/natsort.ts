const collator = new Intl.Collator(undefined, {
   numeric: true,
   sensitivity: "base",
});
const natsort = collator.compare;
export default natsort;
