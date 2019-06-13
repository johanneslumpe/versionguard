#!/usr/bin/env node
import chalk from 'chalk';
import yargs from 'yargs/yargs';

import { configMiddleware } from './middleware/config';
import { error, success } from './logger';
import { ArgvWithGlobalOptions, ArgumentsWithConfig } from './types';
import { pipeCommands, deferred } from './utils';
import { addGroupCommands } from './commands/groups/index';
import { addDependencyCommands } from './commands/dependencies';
import { versionCheckCommand } from './commands/version-check';
import { addApplicationCommands } from './commands/applications';

export async function executeCli(
  args: string[],
  exitProcessOnError: boolean = true,
): Promise<ArgumentsWithConfig> {
  const deferredPromise = deferred();
  const cli = yargs(args)
    .scriptName(chalk.bold.green('versionguard'))
    .version('0.1.0')
    .option('verbose', {
      type: 'boolean',
      default: false,
      description: 'Show verbose output when available',
    })
    .option('config-path', {
      type: 'string',
      description: 'Path to config file',
    }) as ArgvWithGlobalOptions;

  function handleError(msg: string): void {
    error(msg);
    // nasty string checking but required in order to show help in case
    // an unknown argument/command is passed due to custom error handling
    if (msg.toLowerCase().includes('unknown argument')) {
      cli.showHelp();
    }

    if (exitProcessOnError) {
      process.exit(1);
    }
  }

  function isPromise(x: any): x is Promise<any> {
    return !!x.then;
  }

  // not using `commandDir` to ensure type-checking works as expected
  // within builders and handlers
  // we have to `await` the result because some commands return promises
  const argv = await pipeCommands(
    addGroupCommands,
    addApplicationCommands,
    addDependencyCommands,
    versionCheckCommand,
  )(cli)
    .middleware(configMiddleware)
    .recommendCommands()
    .strict()
    .wrap(Math.min(cli.terminalWidth(), 150))
    .fail((msg, err) => {
      console.log('fail');
      return handleError(msg || err.message);
    })
    .parse(
      args,
      async (
        err: Error,
        argv: Promise<ArgumentsWithConfig>,
        output?: string,
      ) => {
        // custom parser to enable waiting for handlers to complete.
        // this is required because yargs right now does not properly wait
        // for async handlers internally.
        // relevant issue: https://github.com/yargs/yargs/issues/1069
        // mainly used to facilitate testing and to ensure that
        // all messages are logged prior to `executeCli` returning

        // if yargs has output ready for us, log it as is
        if (output) {
          console.log(output);
        }

        try {
          const result = await argv;
          if (result._asyncResult) {
            if (isPromise(result._asyncResult)) {
              await result._asyncResult;
              deferredPromise.resolve();
            } else {
              result._asyncResult
                .map(x =>
                  x.then(x => success(x.data)).then(deferredPromise.resolve),
                )
                .mapLeft(x =>
                  x.then(x => handleError(x.data)).then(deferredPromise.reject),
                );
            }
          }
        } catch (e) {
          console.log('THERE');
          handleError(e.message);
          deferredPromise.reject(e);
        }
      },
    );

  // this line exists only for interfacing with tests
  // there is no need to catch any errors because when using
  // when executing in cli-mode this will never be hit since errors will force the process to be exited immediately
  await deferredPromise.promise;

  // show help at top level because commands will only show scoped help
  if (!argv._[0]) {
    cli.showHelp();
  }

  return argv;
}

if (!module.parent) {
  executeCli(process.argv.slice(2));
}
