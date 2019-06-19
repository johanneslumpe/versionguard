import logSymbols from 'log-symbols';

export function error(msg: string, log = console.log): void {
  log(`${logSymbols.error} ${msg}`);
}
