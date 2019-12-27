const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');const colourPicker = document.getElementById('colourPicker');
// const colourButton = document.getElementById('colourButton');
const askIsToken = document.getElementById('askIsToken');
const getToken = document.getElementById('getToken');
const setToken = document.getElementById('setToken');
const tokenToSend = document.getElementById('tokenToSend');
const connect = document.getElementById('connect');

// services
let primaryServiceUuid = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
let commandService = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
let tokenService = '6e400004-b5a3-f393-e0a9-e50e24dcca9e'
let sendDataService = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'

let device, sendCommand, sendToken, recieveData;
let currWorkMode;
const workModes = {
    'isToken': 0,
    'getToken': 1,
    'setToken': 2
};
const answerTypes = {
    0: {
        name: 'Is token set',
        values: {
            0: 'yes',
            1: 'no'
        }
    },
    1: {
        name: "Token"
    },
    2: {
      name: "Token writed"
    }
}

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

  receiveCharacteristic = await service.getCharacteristic(sendDataService);
  sendCommand = await service.getCharacteristic(commandService);
  sendToken = await service.getCharacteristic(tokenService);
  
  device.ongattserverdisconnected = disconnect;
  listen();

  connected.style.display = 'block';
};

const disconnect = () => {
    device = null;
    receiveCharacteristic = null;
    sendCommand = null;
    sendToken = null;
    connected.style.display = 'none';
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

  askIsToken.onclick = async () => {
    // const data = new Uint8Array([1, ...hexToRgb(colourPicker.value)]);
    // sendCharacteristic.writeValue(data);
    // one more
    // characteristic.writeValue(new TextEncoder().encode(data));
    currWorkMode = workModes['isToken'];
    sendCommand.writeValue(new Uint8Array([0]));
  };
  getToken.onclick = async () => {
    currWorkMode = workModes['getToken'];
    sendCommand.writeValue(new Uint8Array([1]));
  };
  setToken.onclick = async () => {
    currWorkMode = workModes['setToken'];
    sendToken.writeValue(new TextEncoder().encode(tokenToSend.value));
  }

  const listen = () => {
    receiveCharacteristic
      .addEventListener('characteristicvaluechanged', 
        (event) => {
          console.log(event);
          if (currWorkMode == workModes['isToken'])
            isTokenHandler(event);
          else if (currWorkMode == workModes['getToken'])
            getTokenHandler(event);
          else if (currWorkMode == workModes['setToken'])
            checkTokenIntegrity(event);
          
          console.log('---------');
        });
    
    receiveCharacteristic.startNotifications();
  };

  let isTokenHandler = event => {
    const value = event.target.value.getInt8();
    /*let value = event.target.value.getInt16(0, true);
    let value2 = new TextDecoder().decode(event.target.value);
    console.log(value);
    console.log(value2);*/
    console.log(answerTypes[currWorkMode]['name'] + ": " + answerTypes[currWorkMode]['values'][value])
  }
  let getTokenHandler = event => {
    let value = new TextDecoder().decode(event.target.value);
    console.log(value);
  }
  let checkTokenIntegrity = event => {
    let value = new TextDecoder().decode(event.target.value);
    let status;
    status = value == tokenToSend.value ? 'successfully' : 'badly';
    console.log(answerTypes[currWorkMode]['name'] + " " + status);
  }