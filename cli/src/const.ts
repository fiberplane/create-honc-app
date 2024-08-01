import { fileURLToPath } from "node:url";
import path from "node:path";

export const HONC_TITLE = `
 __  __     ______     __   __     ______    
/\\ \\_\\ \\   /\\  __ \\   /\\ "-.\\ \\   /\\  ___\\   
\\ \\  __ \\  \\ \\ \\/\\ \\  \\ \\ \\-.  \\  \\ \\ \\____  
 \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\\\"\\_\\  \\ \\_____\\ 
  \\/_/\\/_/   \\/_____/   \\/_/ \\/_/   \\/_____/ 
                                             
`;

export const NEON_BRANCH_NAME = "dev";

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../../");
