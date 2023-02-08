import { IconDefinition } from "@fortawesome/pro-solid-svg-icons";

export const prefix = "trh";
export const iconName = "spiral";
export const width = 576;
export const height = 512;
export const aliases: string[] = [];
export const unicode = "f112";
export const svgPathData = `
M331.2,481.8c-103.7,0-188-84.3-188-188c0-92.1,74.9-167.1,167.1-167.1c82,0,148.7,66.7,148.7,148.7
c0,73.2-59.6,132.8-132.8,132.8c-65.5,0-118.8-53.3-118.8-118.8c0-58.8,47.8-106.6,106.6-106.6c52.9,0,95.9,43,95.9,95.9
c0,12.4-10.1,22.5-22.5,22.5S365,291.2,365,278.8c0-28.1-22.9-50.9-50.9-50.9c-34,0-61.6,27.6-61.6,61.6c0,40.7,33.1,73.8,73.8,73.8
c48.4,0,87.8-39.4,87.8-87.8c0-57.2-46.5-103.7-103.7-103.7c-67.3,0-122.1,54.8-122.1,122.1c0,78.9,64.2,143,143,143
c92.1,0,167-74.9,167-167c0-107.3-87.3-194.5-194.5-194.5c-124.6,0-226,101.4-226,226c0,12.4-10.1,22.5-22.5,22.5
s-22.5-10.1-22.5-22.5c0-72.4,28.2-140.4,79.4-191.6c51.2-51.2,119.2-79.4,191.6-79.4c64,0,124.1,24.9,169.4,70.2
c45.2,45.2,70.2,105.4,70.2,169.4C543.3,386.7,448.1,481.8,331.2,481.8z
`;

export const definition = {
   prefix: prefix,
   iconName: iconName,
   icon: [width, height, aliases, unicode, svgPathData],
};

export const faSpiral = definition;

export default faSpiral as IconDefinition;
