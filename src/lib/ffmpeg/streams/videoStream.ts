
import { TRenderItems,IRenderItemVideo } from "../../../types/irender";
import FfmpegStream from "../ffmpegStream";

class VideoStream extends FfmpegStream {
  size =  {
    width: 0,
    height: 0,
  };

  framerate: number = 30;

  type: string = '';

  position =  {
    x: 0,
    y: 0,
  };

  frame = {
    start: 0, 
    end: 0,
  };

  inout = {
    in: 0,
    out: 0,
  };

  scale = 1;

  alpha = 1;

  color: string = 'black';

  duration: number = 0; 

  assetframe = {
    in: 0,
    out: 0,
  }

  constructor(renderItem: TRenderItems) {
    super();
    if (renderItem.framerate) {
      this.framerate = renderItem.framerate;
    }

    console.log('renderItem> ', renderItem);

    // if ((renderItem as IRenderItemVideo).assetframe) {
    //   this.assetframe.in = Number((renderItem as IRenderItemVideo).assetframe?.in);
    //   this.assetframe.out = Number((renderItem as IRenderItemVideo).assetframe?.out);
    // }

    Object.assign(this, renderItem);
  }
  
}

export default VideoStream;