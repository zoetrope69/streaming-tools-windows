import midi from "midi";

function getPorts(input) {
  const ports = [];
  for (let i = 0; i < input.getPortCount(); ++i) {
    const name = input.getPortName(i);
    ports.push({ port: i, name });
  }
  return ports;
}

function getPortByName({ input, name }) {
  const ports = getPorts(input);
  return ports.find((port) => port.name === name);
}

export function getDeviceByName(name) {
  const input = new midi.Input();
  const output = new midi.Output();

  const device = getPortByName({ input, name });

  if (!device) {
    return {
      input,
      output,
    };
  }

  const { port } = device;

  input.openPort(port);
  output.openPort(port);

  return {
    input,
    output,
  };
}
