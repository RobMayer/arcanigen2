import natsort from "!/utility/natsort";

export type FONT = keyof typeof FONT_DEFINITIONS;

export const FONT_DEFINITIONS = {
    angerthas: {
        family: "Angerthas",
        url: "/fonts/angerthas.woff2",
        format: "woff2",
    },
    futhark: {
        family: "Futhark",
        url: "/fonts/futhark.woff2",
        format: "woff2",
    },
    anayanka: {
        family: "Anayanka",
        url: "/fonts/anayanka.woff2",
        format: "woff2",
    },
    aurebesh: {
        family: "Aurebesh",
        url: "/fonts/aurebesh.woff2",
        format: "woff2",
    },
    barazhad: {
        family: "Barazhad",
        url: "/fonts/barazhad.woff2",
        format: "woff2",
    },
    cardosan: {
        family: "Cardosan",
        url: "/fonts/cardosan.woff2",
        format: "woff2",
    },
    daedra: {
        family: "Daedra",
        url: "/fonts/daedra.woff2",
        format: "woff2",
    },
    davek: {
        family: "Davek",
        url: "/fonts/davek.woff2",
        format: "woff2",
    },
    dwemer: {
        family: "Dwemer",
        url: "/fonts/dwemer.woff2",
        format: "woff2",
    },
    eladrin: {
        family: "Eladrin",
        url: "/fonts/eladrin.woff2",
        format: "woff2",
    },
    exodite: {
        family: "Exodite",
        url: "/fonts/exodite.woff2",
        format: "woff2",
    },
    falmer: {
        family: "Falmer",
        url: "/fonts/falmer.woff2",
        format: "woff2",
    },
    gargish: {
        family: "Gargish",
        url: "/fonts/gargish.woff2",
        format: "woff2",
    },
    iokharic: {
        family: "Iokharic",
        url: "/fonts/iokharic.woff2",
        format: "woff2",
    },
    kargi: {
        family: "Kargi",
        url: "/fonts/kargi.woff2",
        format: "woff2",
    },
    kehdrai: {
        family: "Kehdrai",
        url: "/fonts/kehdrai.woff2",
        format: "woff2",
    },
    klinzhai: {
        family: "Klinzhai",
        url: "/fonts/klinzhai.woff2",
        format: "woff2",
    },
    mage: {
        family: "Mage",
        url: "/fonts/mage.woff2",
        format: "woff2",
    },
    maraseye: {
        family: "Maraseye",
        url: "/fonts/maraseye.woff2",
        format: "woff2",
    },
    moria: {
        family: "Moria",
        url: "/fonts/moria.woff2",
        format: "woff2",
    },
    qijomi: {
        family: "Qijomi",
        url: "/fonts/qijomi.woff2",
        format: "woff2",
    },
    qonos: {
        family: "Qonos",
        url: "/fonts/qonos.woff2",
        format: "woff2",
    },
    reanaarian: {
        family: "Reanaarian",
        url: "/fonts/reanaarian.woff2",
        format: "woff2",
    },
    rellanic: {
        family: "Rellanic",
        url: "/fonts/rellanic.woff2",
        format: "woff2",
    },
    rhesimol: {
        family: "Rhesimol",
        url: "/fonts/rhesimol.woff2",
        format: "woff2",
    },
    sindarin: {
        family: "Sindarin",
        url: "/fonts/sindarin.woff2",
        format: "woff2",
    },
    quenya: {
        family: "Quenya",
        url: "/fonts/quenya.woff2",
        format: "woff2",
    },
    coremaic: {
        family: "Coremaic",
        url: "/fonts/coremaic.woff2",
        format: "woff2",
    },
    clynese: {
        family: "Clynese",
        url: "/fonts/clynese.woff2",
        format: "woff2",
    },
    kitisakkullian: {
        family: "Kitisakkullian",
        url: "/fonts/kitisakkullian.woff2",
        format: "woff2",
    },
    huttese: {
        family: "Huttese",
        url: "/fonts/huttese.woff2",
        format: "woff2",
    },
    sigali: {
        family: "Sigali",
        url: "/fonts/sigali.woff2",
        format: "woff2",
    },
    warden: {
        family: "Warden",
        url: "/fonts/warden.woff2",
        format: "woff2",
    },
    noldor: {
        family: "Noldor",
        url: "/fonts/noldor.woff2",
        format: "woff2",
    },
    dottage: {
        family: "Dottage",
        url: "/fonts/dottage.woff2",
        format: "woff2",
    },
} as const;

export const FONT_NAMES = Object.entries(FONT_DEFINITIONS)
    .sort((a, b) => natsort(a[1].family, b[1].family))
    .reduce((acc, [k, f]: [FONT, (typeof FONT_DEFINITIONS)[FONT]]) => {
        acc[k] = f.family;
        return acc;
    }, {} as { [key in FONT]: string });
