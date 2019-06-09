declare module "mock-stdin" {
  interface MockStdin {
    send: (value: string | string[] | Buffer | null, encoding?: string) => MockStdin
    end: () => void
    restore: () => MockStdin
    reset: (removeListeners: boolean) => MockStdin
  }
  interface MockStdinModule {
    stdin: () => MockStdin;
    restore: () => void;
  }
  const mod: MockStdinModule;
  export default mod;
}

