

// How to Detect Call States in React Native App
// https://aboutreact.com/detect-call-states/

//Import React
import React, {useState} from 'react';

//Import required component
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  FlatList,
  SafeAreaView,
  Image, Button, PermissionsAndroid 
} from 'react-native';


//Import Call Detector
import CallDetectorManager from 'react-native-call-detection';


const App = () => {
 
  //to keep callDetector reference
  let callDetector = undefined;

  let [callStates, setCallStates] = useState([]);
  let [isStart, setIsStart] = useState(false);
  let [flatListItems, setFlatListItems] = useState([]);
  let [stateGranted, setStateGranted] = useState(null);

  const requestPhoneStatePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        {
          title: "Cool READ_PHONE_STATE Permission",
          message:
            "Listener needs access to your READ_PHONE_STATE",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setStateGranted(PermissionsAndroid.RESULTS.GRANTED)
        console.log("You can use the READ_PHONE_STATE");
      } else {
        console.log("READ_PHONE_STATE permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };



  const callFriendTapped = () => {
    
    Linking.openURL('tel:5555555555').catch((err) => {
      console.log(err);
    });
  };

  const startStopListener = async () => {
    if (isStart) {
      console.log('Stop');
      callDetector && callDetector.dispose();
    } else {
      console.log('Start', 'stateGranted===', stateGranted);
      callDetector = new CallDetectorManager(
        (event, number) => {
          console.log('event -> ',
            event + (number ? ' - ' + number : '')
          );
          var updatedCallStates = callStates;
          updatedCallStates.push(
            event + (number ? ' - ' + number : '')
          );
          setFlatListItems(updatedCallStates);
          setCallStates(updatedCallStates);

          // For iOS event will be either "Connected",
          // "Disconnected","Dialing" and "Incoming"

          // For Android event will be either "Offhook",
          // "Disconnected", "Incoming" or "Missed"
          // phoneNumber should store caller/called number

          if (event === 'Disconnected') {
            console.log('Disconnected');
            // Do something call got disconnected
          } else if (event === 'Connected') {
            console.log('Connected');
            // Do something call got connected
            // This clause will only be executed for iOS
          } else if (event === 'Incoming') {
            console.log('Incoming');
            // Do something call got incoming
          } else if (event === 'Dialing') {
            console.log('Dialing');
            // Do something call got dialing
            // This clause will only be executed for iOS
          } else if (event === 'Offhook') {
            console.log('Offhook');
            //Device call state: Off-hook.
            // At least one call exists that is dialing,
            // active, or on hold,
            // and no calls are ringing or waiting.
            // This clause will only be executed for Android
          } else if (event === 'Missed') {
            console.log('Missed');
            // Do something call got missed
            // This clause will only be executed for Android
          }
        },
        true, // To detect incoming calls [ANDROID]
        () => {
          // If your permission got denied [ANDROID]
          // Only if you want to read incoming number
          // Default: console.error
          console.log('Permission Denied by User');
        }, 
        {
          title: 'Phone State Permission',
          message:
            'This app needs access to your phone state in order to react and/or to adapt to incoming calls.',
        },
      );
    }
    setIsStart(!isStart);
  };

  const listSeparator = () => {
    return (
      <View
        style={{
          height: 0.5,
          width: '100%',
          backgroundColor: '#ebebeb'
        }} />
    );
  };
console.log('flatListItems', flatListItems, 'callStates', callStates)
  return (
    <SafeAreaView style={{flex: 1, paddingTop: 30}}>
       <View style={styles.container}>
    <Text style={styles.item}>Try permissions</Text>
    <Button title="request permissions" onPress={requestPhoneStatePermission} />
  </View>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTextLarge}>
            Example to detect call states
          </Text>
          <Text style={styles.headerText}>
            www.aboutreact.com
          </Text>
        </View>
        <FlatList
          style={{flex: 1}}
          data={flatListItems}
          ItemSeparatorComponent={listSeparator}
          renderItem={({item}) => (
            <View style={{flex: 1}}>
              <Text style={styles.callLogs}>
                {JSON.stringify(item)}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={startStopListener}>
          <Text style={styles.buttonText}>
            {isStart ? 'Stop Listner' : 'Start Listener'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={callFriendTapped}
          style={styles.fabStyle}>
          <Image
            source={{
              uri:
                'https://raw.githubusercontent.com/AboutReact/sampleresource/master/input_phone.png',
            }}
            style={styles.fabImageStyle}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    backgroundColor: '#ff8c21',
    padding: 10,
  },
  headerTextLarge: {
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
  },
  headerText: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 18,
    color: 'white',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#ff8c21',
    padding: 10,
    justifyContent: 'center',
    height: 60,
    width: '100%',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'white',
  },
  callLogs: {
    padding: 16,
    fontSize: 16,
    color: '#333333',
  },
  fabStyle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor: 'yellow',
  },
  fabImageStyle: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
});









// // Example to Send Text SMS on Button Click in React Native
// // https://aboutreact.com/send-text-sms-in-react-native/

// // import React in our code
// import React, {useState} from 'react';

// // import all the components we are going to use
// import {
//   SafeAreaView,
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
// } from 'react-native';

// // import SMS API
// import SendSMS from 'react-native-sms';

// const App = () => {
//   const [mobileNumber, setMobileNumber] = useState('9999999999');
//   const [bodySMS, setBodySMS] = useState(
//     'Please follow https://aboutreact.com',
//   );

//   const initiateSMS = () => {
//     // Check for perfect 10 digit length
//     if (mobileNumber.length != 10) {
//       alert('Please insert correct contact number');
//       return;
//     }

//     SendSMS.send(
//       {
//         // Message body
//         body: bodySMS,
//         // Recipients Number
//         recipients: [mobileNumber],
//         // An array of types 
//         // "completed" response when using android
//         successTypes: ['sent', 'queued'],
//       },
//       (completed, cancelled, error) => {
//         if (completed) {
//           console.log('SMS Sent Completed');
//         } else if (cancelled) {
//           console.log('SMS Sent Cancelled');
//         } else if (error) {
//           console.log('Some error occured');
//         }
//       },
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.container}>
//         <Text style={styles.titleText}>
//           Example to Send Text SMS on Button Click in React Native
//         </Text>
//         <Text style={styles.titleTextsmall}>
//           Enter Mobile Number
//         </Text>
//         <TextInput
//           value={mobileNumber}
//           onChangeText={
//             (mobileNumber) => setMobileNumber(mobileNumber)
//           }
//           placeholder={'Enter Conatct Number to Call'}
//           keyboardType="numeric"
//           style={styles.textInput}
//         />
//         <Text style={styles.titleTextsmall}>
//           Enter SMS body
//         </Text>
//         <TextInput
//           value={bodySMS}
//           onChangeText={(bodySMS) => setBodySMS(bodySMS)}
//           placeholder={'Enter SMS body'}
//           style={styles.textInput}
//         />
//         <TouchableOpacity
//           activeOpacity={0.7}
//           style={styles.buttonStyle}
//           onPress={initiateSMS}>
//           <Text style={styles.buttonTextStyle}>
//             Send Message
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default App;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//     padding: 10,
//     textAlign: 'center',
//   },
//   titleText: {
//     fontSize: 22,
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   titleTextsmall: {
//     marginVertical: 8,
//     fontSize: 16,
//   },
//   buttonStyle: {
//     justifyContent: 'center',
//     marginTop: 15,
//     padding: 10,
//     backgroundColor: '#8ad24e',
//   },
//   buttonTextStyle: {
//     color: '#fff',
//     textAlign: 'center',
//   },
//   textInput: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     width: '100%',
//     paddingHorizontal: 10,
//   },
// });

















// import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
// import React from 'react';

// import Telephony from 'react-native-telephony'

// import CallDetectorManager from 'react-native-call-detection'

// import SendSMS from 'react-native-sms'


// import CallLogs from 'react-native-call-log'

// import call from 'react-native-phone-call'

// class TestedOnly extends React.Component {
    //componentWillMount() {
    // Telephony.addEventListener(Telephony.LISTEN_CALL_STATE | Telephony.LISTEN_DATA_ACTIVITY,
    //     (event: any) => {
    //         if (event.type === 'LISTEN_CALL_STATE') {
    //             console.log(event.data)
    //         } else {
    //             console.log(event.data)
    //         }
    //     })

    // Telephony.isNetworkRoaming((roaming: any) => {
    //     if (roaming) {
    //         // ...
    //     }
    // })

    // Telephony.getNetworkClass((network: any) => {
    //     switch (network) {
    //         case "2G":
    //             // ...
    //             break;
    //         case "3G":
    //             // ...
    //             break;
    //         case "4G":
    //             // ...
    //             break;
    //         default:
    //             // ...
    //             break;
    //     }
    // })


    // const requestCameraPermission = async () => {
    //     try {
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.CAMERA,
    //             {
    //                 title: "Cool Photo App Camera Permission",
    //                 message:
    //                     "Cool Photo App needs access to your camera " +
    //                     "so you can take awesome pictures.",
    //                 buttonNeutral: "Ask Me Later",
    //                 buttonNegative: "Cancel",
    //                 buttonPositive: "OK"
    //             }
    //         );
    //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //             console.log("You can use the camera");
    //         } else {
    //             console.log("Camera permission denied");
    //         }
    //     } catch (err) {
    //         console.warn(err);
    //     }
    // };

    // const sendSms = async () => {
    //     return SendSMS.send({
    //         body: 'The default body of the SMS!',
    //         recipients: ['0663952488', '0668848072'],
    //         // @ts-ignore
    //         successTypes: ['sent', 'queued'],
    //         allowAndroidSendWithoutReadPermission: true
    //     }, (completed, cancelled, error) => console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error));
    // }


    // const log = async () => {

    //     try {
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    //             {
    //                 title: 'Call Log Example',
    //                 message: 'Access your call logs',
    //                 buttonNeutral: 'Ask Me Later',
    //                 buttonNegative: 'Cancel',
    //                 buttonPositive: 'OK',
    //             }
    //         )
    //         const check = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE)
    //         console.log('check===', check, 'granted===', granted)
    //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {

    //             // const log = CallLogs.load().then((c: any) => c);
    //             // const json  = await log.json()
    //             console.log('json')
    //         } else {
    //             console.log('Call Log permission denied');
    //         }

    //     }
    //     catch (e) {
    //         console.log(e);
    //     }
    // }

    // const handlePress = async () => {
    //     const rrr = await sendSms();
    //     await makeCall('0663952488')
    //     log()
    //     sendSms()
    //     console.log('handlePress', rrr)
    //     requestCameraPermission()
    // }

    // const log = async () => {

    //     try {
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    //             {
    //                 title: 'Call Log Example',
    //                 message: 'Access your call logs',
    //                 buttonNeutral: 'Ask Me Later',
    //                 buttonNegative: 'Cancel',
    //                 buttonPositive: 'OK',
    //             }
    //         )
    //         console.log('granted', granted)
    //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {

    //             const log = CallLogs.load().then((c: any) => c);
    //             const json  = await log.json()
    //             console.log('json', json)
    //         } else {
    //             console.log('Call Log permission denied');
    //         }

    //     }
    //     catch (e) {
    //         console.log(e);
    //     }
    // }
    // useEffect(() => {
    //     log()

    // }, [])

    // Telephony.getCellInfo((cellInfos: any) => {
    //     cellInfos.map((info: any) => {
    //         switch (info.connectionType) {
    //             case "CDMA":
    //                 console.log(info.cellIdentity)
    //                 console.log(info.cellSignalStrength)
    //                 break;
    //             case "WCDMA":
    //                 console.log(info.cellIdentity)
    //                 console.log(info.cellSignalStrength)
    //                 break;
    //             case "GSM":
    //                 console.log(info.cellIdentity)
    //                 console.log(info.cellSignalStrength)
    //                 break;
    //             case "LTE":
    //                 console.log(info.cellIdentity)
    //                 console.log(info.cellSignalStrength)
    //                 break;
    //             default:
    //                 // ...
    //                 break;
    //         }
    //     })
    // })
    //}

    // componentWillUnmount() {
    //     Telephony.removeEventListener()
    // }

    // startListenerTapped() {
    //     this.callDetector = new CallDetectorManager((event, phoneNumber)=> {
    //     // For iOS event will be either "Connected",
    //     // "Disconnected","Dialing" and "Incoming"
     
    //     // For Android event will be either "Offhook",
    //     // "Disconnected", "Incoming" or "Missed"
    //     // phoneNumber should store caller/called number
     
     
    //     if (event === 'Disconnected') {
    //     // Do something call got disconnected
    //     }
    //     else if (event === 'Connected') {
    //     // Do something call got connected
    //     // This clause will only be executed for iOS
    //     }
    //     else if (event === 'Incoming') {
    //     // Do something call got incoming
    //     }
    //     else if (event === 'Dialing') {
    //     // Do something call got dialing
    //     // This clause will only be executed for iOS
    //     }
    //     else if (event === 'Offhook') {
    //     //Device call state: Off-hook.
    //     // At least one call exists that is dialing,
    //     // active, or on hold,
    //     // and no calls are ringing or waiting.
    //     // This clause will only be executed for Android
    //     }
    //     else if (event === 'Missed') {
    //         // Do something call got missed
    //         // This clause will only be executed for Android
    //   }
    // },
    // false, // if you want to read the phone number of the incoming call [ANDROID], otherwise false
    // ()=>{}, // callback if your permission got denied [ANDROID] [only if you want to read incoming number] default: console.error
    // {
    // title: 'Phone State Permission',
    // message: 'This app needs access to your phone state in order to react and/or to adapt to incoming calls.'
    // } // a custom permission request message to explain to your user, why you need the permission [recommended] - this is the default one
    // )
    // }
     
    // stopListenerTapped() {
    //     this.callDetector && this.callDetector.dispose();
    // }

    // callFriendTapped() {
    //     // Add the telephone num to call
    //       Linking.openURL('tel:5555555555')
    //         .catch(err => {
    //           console.log(err)
    //         });
    //     }


//     makeCall = async () => {
//         const args = {
//             number: '0663952488',
//             prompt: false
//         }
//         return call(args)
//             .then((res: any) => {
//                 console.log('makeCall', res)
//                 return res;
//             })
//             .catch((err: any) => {
//                 return err
//             })
//     }

//     render() {

//         return (
//             <View style={styles.container}>
//                         <TouchableOpacity
//                             style={styles.text}
//                             onLongPress={this.makeCall}>
//                             <Text> Test!!!!!!!!!!</Text>
//                         </TouchableOpacity>
//             </View>
//         )
//     }
// }

// const styles = StyleSheet.create({
//     container: {

//         marginTop: 200,
//     },
//     text: {
// padding: 30,
// backgroundColor: 'grey'
//     }
// });

// export default TestedOnly