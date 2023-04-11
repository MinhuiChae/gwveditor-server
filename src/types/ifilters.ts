interface IFfiltersStream {
  video?: string | null,
  audio?: string | null,
}

interface IFfiltersOutStream {
  stream: IFfiltersStream[],
  command: string,
}

export {
  IFfiltersStream,
  IFfiltersOutStream,
}