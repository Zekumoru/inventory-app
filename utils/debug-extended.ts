import Debug from 'debug'

export const debugColors = {
  "black": "0",
  "red": "1",
  "green": "2",
  "yellow": "3",
  "blue": "4",
  "magenta": "5",
  "cyan": "6",
  "white": "7",
}

interface ExtendedDebugger extends Debug.Debugger {
  error: (formatter: any, ...args: any[]) => void;
};

export default (namespace: string): ExtendedDebugger => {
  const debug: ExtendedDebugger = Debug(namespace) as ExtendedDebugger;

  // Make debugging color default to green instead of red (which is debug's default)
  debug.color = debugColors["green"];

  // Only sets color to red since debug already is using console.error by default
  // That default behaviour can be changed, however, since the ones who created
  // that npm package made it as default, I will leave it be and just set the color 
  debug.error = (formatter: any, ...args: any[]) => {
    const prevColor = debug.color;
    debug.color = debugColors["red"];
    debug(formatter, ...args);
    debug.color = prevColor;
  };

  return debug;
};
