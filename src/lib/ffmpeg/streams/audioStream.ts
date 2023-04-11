
import { TRenderItems } from "../../../types/irender";
import FfmpegStream from "../ffmpegStream";

class AudioStream extends FfmpegStream {
  constructor(renderItem: TRenderItems) {
    super();
  }
}

export default AudioStream;