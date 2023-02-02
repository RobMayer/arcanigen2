import { IconDefinition } from "@fortawesome/pro-solid-svg-icons";

export const prefix = "trh";
export const iconName = "small-circle";
export const width = 320;
export const height = 512;
export const aliases: string[] = [];
export const unicode = "f111";
export const svgPathData = "M160,360c57.4,0,104-46.6,104-104s-46.6-104-104-104S56,198.6,56,256S102.6,360,160,360z";

export const definition = {
   prefix: prefix,
   iconName: iconName,
   icon: [width, height, aliases, unicode, svgPathData],
};

export const faCircleSmall = definition;

export default faCircleSmall as IconDefinition;
