import { IconDefinition } from "@fortawesome/pro-solid-svg-icons";

export const prefix = "trh";
export const iconName = "triangle-ring";
export const width = 512;
export const height = 512;
export const aliases: string[] = [];
export const unicode = "f112";
export const svgPathData = `M506.5,419.8l-216-368C283.3,39.5,270.2,32,256,32s-27.3,7.5-34.5,19.8l-216,368c-7.3,12.3-7.3,27.6-0.2,40.1 C12.4,472.3,25.7,480,40,480h432c14.3,0,27.6-7.7,34.7-20.1C513.8,447.4,513.8,432.1,506.5,419.8z M54,432L256,87.8L458,432H54z M233.4,209.2l-87.5,149c-4.8,8.1-4.8,18.1-0.1,26.3c4.7,8.1,13.4,13.2,22.7,13.2h175c9.4,0,18.1-5,22.7-13.2 c4.7-8.2,4.6-18.3-0.2-26.2l-87.5-149.1c-4.7-8-13.3-12.9-22.6-12.9C246.8,196.3,238.1,201.2,233.4,209.2z M320.3,358.3H191.6 L256,248.6L320.3,358.3z`;

export const definition = {
   prefix: prefix,
   iconName: iconName,
   icon: [width, height, aliases, unicode, svgPathData],
};

export const faTriangleRing = definition;

export default faTriangleRing as IconDefinition;
