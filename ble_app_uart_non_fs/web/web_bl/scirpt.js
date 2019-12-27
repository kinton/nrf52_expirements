const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');const colourPicker = document.getElementById('colourPicker');
// const colourButton = document.getElementById('colourButton');
const ledOn = document.getElementById('ledOn');
const ledOff = document.getElementById('ledOff');
const connect = document.getElementById('connect');

// led controlling
// let primaryServiceUuid = '00001523-1212-efde-1523-785feabcd123';
// let led = '00001525-1212-efde-1523-785feabcd123'
// let dataIn = led

// heart rate demo
let primaryServiceUuid = 0x180D
let dataIn = 0x2A37

let device, sendCharacteristic, receiveCharacteristic;
connectButton.onclick = async () => {
  device = await navigator.bluetooth
             .requestDevice({
                filters: [{
                  services: [primaryServiceUuid]
                }],
                // acceptAllDevices: true
             });
  
  // here functs for rssi, but watchAdvertisements unsupported, event => event.rssi
  // device.watchAdvertisements();
  // device.addEventListener('advertisementreceived', interpretIBeacon);

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(primaryServiceUuid);

  receiveCharacteristic = await service.getCharacteristic(dataIn);
  if (typeof led != "undefined")
    sendCharacteristic = await service.getCharacteristic(led);  
  
  device.ongattserverdisconnected = disconnect;
  listen();

  connected.style.display = 'block';
//   connectButton.style.display = 'none';
//   disconnectButton.style.display = 'initial';
};

const disconnect = () => {
    device = null;
    receiveCharacteristic = null;
    sendCharacteristic = null;
    connected.style.display = 'none';
    // connectButton.style.display = 'initial';
    // disconnectButton.style.display = 'none';
  };

  disconnectButton.onclick = async () => {
    await device.gatt.disconnect();
    disconnect();
  };

  // const hexToRgb = (hex) => {
  //   const r = parseInt(hex.substring(1, 3), 16);
  //   const g = parseInt(hex.substring(3, 5), 16);
  //   const b = parseInt(hex.substring(5, 7), 16);  return [r, g, b];
  // };

  ledOn.onclick = async () => {
    // const data = new Uint8Array([1, ...hexToRgb(colourPicker.value)]);
    // sendCharacteristic.writeValue(data);
    // one more
    // characteristic.writeValue(new TextEncoder().encode(data));
    sendCharacteristic.writeValue(new Uint8Array([1]));
  };
  ledOff.onclick = async () => {
    sendCharacteristic.writeValue(new Uint8Array([0]));
  }

  const listen = () => {
    receiveCharacteristic
      .addEventListener('characteristicvaluechanged', 
        (event) => {
          console.log(event);
          const value = event.target.value.getInt16(0, true);
          // deviceHeartbeat.innerText = value;
          let value2 = new TextDecoder().decode(event.target.value);
          console.log(value);
          console.log(value2);
          console.log('---------');
        });
    
    receiveCharacteristic.startNotifications();
  };