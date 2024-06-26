import { Interpolator } from "!/pages/arcanigen/definitions/types";
import { AngleLerpMode, AngleLerpModes, PositionMode, PositionModes, RoundingMode, RoundingModes } from "!/utility/enums";
import lodash from "lodash";
import ColorConvert, { ColorFields } from "./colorconvert";
import { Length, Color } from "./types/units";

export const deg2rad = (deg: number) => deg * (Math.PI / 180);
export const rad2deg = (rad: number) => (180 * rad) / Math.PI;

export const DEFUALT_INTERPOLATOR: Interpolator = (n: number) => n;

export const seededRandom = (seed: number) => {
    let _seed = seed % 2147483647;
    if (_seed <= 0) {
        _seed = _seed + 2147483647;
    }

    const get = () => {
        _seed = (_seed * 16807) % 2147483647;
        return (_seed - 1) / 2147483646;
    };

    get.between = (a: number, b: number) => {
        return lerp(get(), a, b);
    };

    get.pick = <T>(thing: T[], count: number) => {
        if (count >= thing.length) {
            return [...thing];
        }
        const n = [...thing];
        const res = [] as T[];

        lodash.range(count).forEach(() => {
            const idx = Math.round(lerp(get(), 0, n.length - 1));
            res.push(n[idx]);
            n.splice(idx, 1);
        });
        return res;
    };

    return get;
};

// const CURVE_HANDLERS: { [keys in CurvePreset]: (t: number) => number } = {
//    linear: (t: number) => t,
//    semiquadratic: (t: number) => Math.pow(t, 1.5),
//    quadratic: (t: number) => Math.pow(t, 2),
//    cubic: (t: number) => Math.pow(t, 3),
//    exponential: (t: number) => Math.pow(2, t) - 1,
//    sinusoidal: (t: number) => Math.sin(t * (Math.PI / 2)),
//    rootic: (t: number) => Math.sqrt(t),
//    circular: (t: number) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
// };

// const handleCurve = (e: EasingMode, func: (t: number) => number) => {
//    switch (e) {
//       case "in":
//          return (a: number) => func(a);
//       case "out":
//          return (a: number) => 1 - func(1 - a);
//       case "inout":
//          return (a: number) => (a < 0.5 ? func(a * 2) / 2 : a > 0.5 ? 1 - func(a * -2 + 2) / 2 : 0.5);
//       case "outin":
//          return (a: number) => (a < 0.5 ? 0.5 - func(1 - a * 2) / 2 : a > 0.5 ? 0.5 + func(a * 2 - 1) / 2 : 0.5);
//    }
// };

export const lerp = (t: number, a: number, b: number, interpolator: Interpolator = DEFUALT_INTERPOLATOR) => {
    return a + interpolator(t) * (b - a);
};

export const delerp = (d: number, start: number, end: number) => {
    return end - start === 0 ? 0 : (d - start) / (end - start);
};

export const mod = (a: number, n: number) => {
    return ((a % n) + n) % n;
};

export const lengthToPx = (length: Length): number => {
    switch (length.unit) {
        case "px":
            return length.value;
        case "pt":
            return (length.value / 72) * 96;
        case "in":
            return length.value * 96;
        case "mm":
            return (length.value * 96) / 25.4;
        case "cm":
            return (length.value * 96) / 2.54;
    }
};

export const angleLerp = (t: number, a: number, b: number, mode: AngleLerpMode, interpolator: Interpolator = DEFUALT_INTERPOLATOR) => {
    const cw = mod(lerp(t, a, b + (a > b ? 1 : 0), interpolator), 1);
    const ccw = mod(lerp(t, a + (a < b ? 1 : 0), b, interpolator), 1);
    switch (mode) {
        case AngleLerpModes.CLOSEST_CW:
            return Math.abs(b - a) > 0.5 ? ccw : cw;
        case AngleLerpModes.CLOSEST_CCW:
            return Math.abs(b - a) >= 0.5 ? ccw : cw;
        case AngleLerpModes.FARTHEST_CW:
            return Math.abs(b - a) >= 0.5 ? cw : ccw;
        case AngleLerpModes.FARTHEST_CCW:
            return Math.abs(b - a) > 0.5 ? cw : ccw;
        case AngleLerpModes.CLOCKWISE:
            return cw;
        case AngleLerpModes.COUNTER:
            return ccw;
    }
};

export const pxToLength = (value: number, unit: Length["unit"] = "px"): Length => {
    switch (unit) {
        case "px":
            return { value, unit };
        case "pt":
            return { value: (value * 72) / 96, unit };
        case "in":
            return { value: value / 96, unit };
        case "mm":
            return { value: (value / 96) * 25.4, unit };
        case "cm":
            return { value: (value / 96) * 2.54, unit };
    }
};

export const convertLength = (value: Length, unit: Length["unit"]): Length => {
    return pxToLength(lengthToPx(value), unit);
};

export const hexToColor = (h: string) => {
    if (h === "") {
        return undefined;
    }
    if (h === "none") {
        return null;
    }

    h = h.slice(1);
    if (h.length === 3) {
        h = h + "f";
    }
    if (h.length === 4) {
        h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    if (h.length === 6) {
        h = h + "ff";
    }
    return {
        r: parseInt(h.slice(0, 2), 16) / 255,
        g: parseInt(h.slice(2, 4), 16) / 255,
        b: parseInt(h.slice(4, 6), 16) / 255,
        a: parseInt(h.slice(6, 8), 16) / 255,
    };
};

export const colorToHex = (color: Color, fallback: string = "") => {
    if (color === undefined) {
        return fallback;
    }
    if (color === null) {
        return "none";
    }
    return `#${Math.round(color.r * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(color.g * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(color.b * 255)
        .toString(16)
        .padStart(2, "0")}${Math.round(color.a * 255)
        .toString(16)
        .padStart(2, "0")}`.toUpperCase();
};

export const colorToHTML = (color: Color, fallback: string = "") => {
    if (color === undefined) {
        return fallback;
    }
    if (color === null) {
        return "transparent";
    }
    return `rgba( ${color.r * 100}%, ${color.g * 100}%, ${color.b * 100}%, ${color.a} )`;
};

export const colorToSVG = (color: Color, fallback: string = "") => {
    if (color === undefined) {
        return fallback;
    }
    if (color === null) {
        return "none";
    }
    return `rgb( ${color.r * 100}%, ${color.g * 100}%, ${color.b * 100}% )`;
};

export const colorToOpacity = (color: Color, fallback: number = 1) => {
    if (color === undefined) {
        return fallback;
    }
    if (color === null) {
        return 0;
    }
    return color.a;
};

export const WHITE = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };
export const BLACK = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };

const getPosition = (mode: PositionMode, x: Length, y: Length, theta: number, r: Length) => {
    if (mode === PositionModes.POLAR) {
        const nX = lengthToPx(r) * Math.cos(((theta - 90) * Math.PI) / 180);
        const nY = lengthToPx(r) * Math.sin(((theta - 90) * Math.PI) / 180);

        return `translate(${nX}, ${nY})`;
    }
    return `translate(${lengthToPx(x)}, ${lengthToPx(y) * -1})`;
};

export const shortestArc = (start: number, stop: number) => {
    const modDiff = mod(stop - start, 360);
    let dist = 180 - Math.abs(Math.abs(modDiff) - 180);
    return (modDiff + 360) % 360 < 180 ? dist : dist * -1;
};

export const shortestQuadrent = (start: number, stop: number) => {
    const modDiff = mod(stop - start, 4);
    let dist = 2 - Math.abs(Math.abs(modDiff) - 2);
    return (modDiff + 4) % 4 < 2 ? dist : dist * -1;
};

export const distance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};

export const distanceSquare = (x1: number, y1: number, x2: number, y2: number) => {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
};

export const clamp = (n: number, a: number, b: number) => {
    return Math.max(a, Math.min(b, n));
};

export const colorLerp = <T extends keyof ColorFields>(
    step: number,
    from: Color,
    to: Color,
    colorSpace: T = "RGB" as T,
    hueMode: AngleLerpMode = AngleLerpModes.CLOSEST_CW,
    distribution: Interpolator = DEFUALT_INTERPOLATOR
) => {
    const a = ColorConvert[`color2${colorSpace}`](from) as ColorFields[T];
    const b = ColorConvert[`color2${colorSpace}`](to) as ColorFields[T];

    const channels = ColorConvert.CHANNELS[colorSpace] as (keyof ColorFields[T])[];

    const color = channels.reduce((acc, channel: keyof ColorFields[T]) => {
        if (channel === "h") {
            const v = angleLerp(step, (a[channel] as number) / 360, (b[channel] as number) / 360, hueMode, distribution);
            acc[channel] = v * 360;
            return acc;
        } else {
            const v = lerp(step, a[channel] as number, b[channel] as number, distribution);
            acc[channel] = v;
            return acc;
        }
    }, {} as { [key in keyof ColorFields[T]]: number });

    return (ColorConvert[`${colorSpace}2color`] as (c: typeof color) => Color)(color);
};

export const round = (t: number, method: RoundingMode) => {
    switch (method) {
        case RoundingModes.NEAREST_UP:
            return Math.round(t);
        case RoundingModes.NEAREST_DOWN:
            return mod(t, 1) === 0.5 ? Math.floor(t) : Math.round(t);
        case RoundingModes.CEILING:
            return Math.ceil(t);
        case RoundingModes.FLOOR:
            return Math.floor(t);
        case RoundingModes.NEAREST_TOWARDS:
            return mod(t, 1) === 0.5 ? (t > 0 ? Math.floor(t) : Math.ceil(t)) : Math.round(t);
        case RoundingModes.NEAREST_AWAY:
            return mod(t, 1) === 0.5 ? (t > 0 ? Math.ceil(t) : Math.floor(t)) : Math.round(t);
        case RoundingModes.TOWARDS:
            return t > 0 ? Math.floor(t) : Math.ceil(t);
        case RoundingModes.AWAY:
            return t > 0 ? Math.ceil(t) : Math.floor(t);
    }
};

const LENGTH_REGEX = /([0-9.]+)(px|mm|in|cm|pt)/;
const UNITS = ["px", "in", "cm", "mm", "pt"];

export const listToLengths = (t: string, sep: string = " ") => {
    const n = t.split(sep);
    return n.filter(Boolean).reduce((acc, each) => {
        const tokens = each.match(LENGTH_REGEX);
        if (tokens && tokens.length === 3) {
            const [, v, u] = tokens;
            const value = Number(v);
            const unit = u.toLowerCase() as "px" | "in" | "cm" | "mm" | "pt";
            if (!isNaN(value) && UNITS.includes(unit)) {
                acc.push({ value, unit });
            }
        }
        return acc;
    }, [] as Length[]);
};

export const gcd = (a: number, b: number) => {
    a = Math.abs(a);
    b = Math.abs(b);

    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }

    return a;
};

export const snap = (value: number, inc: number) => {
    if (inc === 0) {
        return value;
    }
    if (isMultipleOf(value, inc)) {
        return value;
    }
    return value - (value % inc);
};

export const isMultipleOf = (value: number, inc: number) => {
    if (value % inc === 0) {
        return true;
    }

    if ((value + 0.0000001) % inc < 0.0000002) {
        return true;
    }
    return false;
};

export const compare = (a: number, b: number) => (a > b ? 1 : a < b ? -1 : 0);

const LENGTH_LIST_REGEX = /^$|^([0-9.])+(px|mm|in|cm|pt)(?:\s([0-9.])+(px|mm|in|cm|pt))*$/;

const MathHelper = {
    deg2rad,
    rad2deg,
    mod,
    gcd,
    lerp,
    delerp,
    lengthToPx,
    pxToLength,
    colorToHex,
    colorToHTML,
    colorToSVG,
    colorToOpacity,
    hexToColor,
    convertLength,
    getPosition,
    shortestArc,
    shortestQuadrent,
    distance,
    distanceSquare,
    compare,
    clamp,
    angleLerp,
    colorLerp,
    listToLengths,
    round,
    seededRandom,
    WHITE,
    BLACK,
    LENGTH_LIST_REGEX,
    DEFUALT_INTERPOLATOR,
    snap,
    isMultipleOf,
};

export default MathHelper;
