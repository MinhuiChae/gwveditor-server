
abstract class FfmpegStream {
  _name: string = '';
  constructor(){}

  set name(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }
}

export default FfmpegStream;