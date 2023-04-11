export default {
  getRandomfileName(prefex:string, ext: string): string {
    return `${prefex}-${(Math.random() + 1).toString(36).substring(7)}.${ext}`;
  }
}