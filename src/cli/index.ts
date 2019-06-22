#!/usr/bin/env node
import chalk from 'chalk';
import yargs from 'yargs/yargs';
import { log } from 'fp-ts/lib/Console';
import { rightIO } from 'fp-ts/lib/TaskEither';
import { IO } from 'fp-ts/lib/IO';

import { configMiddleware } from './middleware/config';
import { error } from './logging';
import {
  ArgvWithGlobalOptions,
  ArgumentsWithConfig,
  ArgumentsWithConfigAndGlobalOptions,
} from './types';
import { pipeCommands, deferred } from './utils';
import { addGroupCommands } from './commands/groups/index';
import { addDependencyCommands } from './commands/dependencies';
import { versionCheckCommand } from './commands/versionCheck';
import { addApplicationCommands } from './commands/applications';
import { Logger } from './Logger';

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

  function handleError(err: Error | string): IO<void> {
    return new IO(() => {
      const message = err instanceof Error ? err.message : err;
      error(message);
      // nasty string checking but required in order to show help in case
      // an unknown argument/command is passed due to custom error handling
      if (message.toLowerCase().includes('unknown argument')) {
        cli.showHelp();
      }

      if (exitProcessOnError) {
        // push process exiting into next tick to
        // ensure output gets logged prior to exiting
        setTimeout(() => process.exit(1), 0);
      } else {
        deferredPromise.reject(new Error(message));
      }
    });
  }

  const logger = Logger.create();
  // not using `commandDir` to ensure type-checking works as expected
  // within builders and handlers
  // we have to `await` the result because some commands return promises
  const argv = await pipeCommands(
    addGroupCommands,
    addApplicationCommands,
    addDependencyCommands,
    versionCheckCommand,
  )({ cli, logger })
    .middleware(configMiddleware)
    .recommendCommands()
    .strict()
    .wrap(Math.min(cli.terminalWidth(), 150))
    .fail((msg, err) => handleError(msg || err.message).run())
    .parse(
      args,
      async (
        err: Error,
        argv: Promise<ArgumentsWithConfigAndGlobalOptions>,
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
          logger.verbose = result.verbose;
          if (result._asyncResult) {
            // TODO swap out with fluid api below
            // once type error is resolved
            // await pipe(
            //   result._asyncResult,
            //   chain(result => rightIO(log(result.message))),
            //   chain(() => rightIO(new IO(() => deferredPromise.resolve()))),
            //   orElse(err => rightIO(handleError(err))),
            // ).run();
            await result._asyncResult
              .chain(handlerResult => rightIO(log(handlerResult.message)))
              .chain(() => rightIO(new IO(deferredPromise.resolve)))
              .orElse(err => rightIO(handleError(err)))
              .run();
          } else {
            // resolve deferred promise for default case with not arguments
            // this is required for help output to show
            deferredPromise.resolve();
          }
        } catch (e) {
          handleError(e).run();
        }
      },
    );

  // this line exists only for interfacing with tests.
  // there is no need to catch any errors because when executing
  // in cli-mode errors will force the process to be exited immediately
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
