import chalk from 'chalk';
import logSymbols from 'log-symbols';

export function success(msg: string, log = console.log): void {
  log(chalk.green(`${logSymbols.success} ${msg}`));
}

export function error(msg: string, log = console.log): void {
  log(chalk.red(`${logSymbols.error} ${msg}`));
}

export function warning(msg: string, log = console.log): void {
  log(chalk.yellow(`${logSymbols.warning} ${msg}`));
}

export function info(msg: string, log = console.log): void {
  log(chalk.blue(`${logSymbols.info} ${msg}`));
}
