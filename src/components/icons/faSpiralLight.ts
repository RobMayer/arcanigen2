import { IconDefinition } from "@fortawesome/pro-solid-svg-icons";

export const prefix = "trh";
export const iconName = "spiral";
export const width = 576;
export const height = 512;
export const aliases: string[] = [];
export const unicode = "f112";
export const svgPathData = `
M337.6,506.6c-114.3,0-207.3-93-207.3-207.3c0-101,82.2-183.2,183.2-183.2c89.4,0,162.2,72.8,162.2,162.2
		c0,79.3-64.5,143.8-143.8,143.8c-70.5,0-127.8-57.3-127.8-127.8c0-62.7,51-113.8,113.8-113.8c56,0,101.6,45.6,101.6,101.6
		c0,9.5-7.7,17.2-17.2,17.2s-17.2-7.7-17.2-17.2c0-37-30.1-67.1-67.1-67.1c-43.7,0-79.3,35.6-79.3,79.3c0,51.5,41.9,93.3,93.3,93.3
		c60.3,0,109.4-49.1,109.4-109.4c0-70.4-57.3-127.7-127.7-127.7c-82,0-148.8,66.7-148.8,148.8c0,95.3,77.5,172.8,172.8,172.8
		c110.5,0,200.4-89.9,200.4-200.4c0-127.9-104.1-232-232-232c-147.8,0-268.1,120.3-268.1,268.1c0,9.5-7.7,17.2-17.2,17.2
		s-17.2-7.7-17.2-17.2c0-80.8,31.5-156.8,88.6-214c57.1-57.1,133.1-88.6,214-88.6c71.2,0,138.1,27.7,188.4,78
		c50.3,50.3,78,117.2,78,188.4C572.5,401.3,467.1,506.6,337.6,506.6z
`;

export const definition = {
   prefix: prefix,
   iconName: iconName,
   icon: [width, height, aliases, unicode, svgPathData],
};

export const faSpiralLight = definition;

export default faSpiralLight as IconDefinition;
