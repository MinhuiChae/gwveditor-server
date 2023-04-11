import child_process from 'child_process';

const spawn = child_process.spawn;

const runCommand = (cmd: string, args: string[], onData: any, onFinish: any, onError: any) => {
  //const argsArr =  args.replace(/ +/gi, ' ').split(' ');
  const proc = spawn(cmd, args);
  proc.stdout.on('data', onData);
  proc.stderr.setEncoding("utf8");
  proc.on('error', err => onError(err));
  proc.on('close', onFinish);
}

export default runCommand;