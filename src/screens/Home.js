/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { View, Text, FlatList, TouchableNativeFeedback, Modal, Pressable, Image, Dimensions, Animated, Vibration, ToastAndroid, RefreshControl } from 'react-native';
import { useDarkMode, useDynamicStyleSheet } from 'react-native-dark-mode';
import { openDatabase } from 'react-native-sqlite-storage';
import { SERVER_URL, AUTH_TOKEN, KEY, TERMINAL_KEY } from '@env';
import { RNCamera } from 'react-native-camera';
import { io } from 'socket.io-client';
import EncryptedStorage from 'react-native-encrypted-storage';
import QRCodeScanner from 'react-native-qrcode-scanner';
import QRCode from 'react-native-qrcode-generator';
import MarqueeText from 'react-native-marquee';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import dynamicStyles from '../styles/Home';
import Button from '../assets/AccentButton';
import Waiter from '../assets/Waiter';
import Alert from '../assets/Alert';
import CircleSnail from '../assets/CircleSnail';
import SecureRequest from '../assets/SecureRequest';
import global from '../styles/global';

var db = openDatabase({ name: 'Selseus.db' });
var CryptoJS = require('crypto-js');
var Request = new SecureRequest(KEY);
var terminal_key = new SecureRequest(TERMINAL_KEY);
const socket = io(SERVER_URL);

// eslint-disable-next-line no-undef
export default Home = () => {
    const isDarkMode = useDarkMode();
    const styles = useDynamicStyleSheet(dynamicStyles);
    let [prompt, show_prompt] = React.useState(false);
    let [data, set_data] = React.useState({});
    let [list, set_list] = React.useState([]);
    let [scanner, show_scanner] = React.useState(false);
    let [torch, switch_torch] = React.useState(false);
    let [show_code, set_mode] = React.useState(false);
    let [qr_string, set_qr] = React.useState('');
    let [waiter, set_waiter] = React.useState({ visible: false });
    let [alert_info, set_alert] = React.useState({ visible: false });
    let [refreshing, set_refreshing] = React.useState(false);
    let [cloud, set_cloud] = React.useState('cloud-sync');
    let prompt_index = React.useRef(0);
    const animref = React.useRef(new Animated.Value(0)).current;
    const width = Dimensions.get('window').width;
    const height = Dimensions.get('window').height;
    const markerRef = React.useRef(new Animated.Value(1)).current;
    const camera = React.useRef(null);

    const refresh_list_local = () => db.transaction((tx) => {
        tx.executeSql('SELECT * FROM attendance', [], (_tx, results) => {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) temp.push(results.rows.item(i));
            set_list(temp);
        });
    });

    const refresh_list_network = async () => {
        var user_creds = JSON.parse(await EncryptedStorage.getItem('user_creds'));
        fetch(`${SERVER_URL}/attendance/refresh`, {
            method: 'POST',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
            body: Request.encrypt({
                uid: user_creds.uid,
            }),
        })
            .then((res) => res.json())
            .then(async (json) => {
                try {
                    var response = await Request.decrypt(json.cipher);
                } catch (e) { throw Error(e.message); }
                if (response.error) {
                } else {
                    JSON.stringify(response.result);
                    for (const each of response.result) {
                        db.transaction(function (txn) {
                            txn.executeSql(
                                'DELETE FROM attendance',
                                [],
                                () => {
                                    db.transaction(function (tx) {
                                        tx.executeSql(
                                            'INSERT INTO attendance (temperature, date, time, object, terminal) VALUES (?,?,?,?,?)',
                                            [each.temperature, each.date, each.time, each.object, each.terminal],
                                            () => refresh_list_local(),
                                            (e) => console.error(e),
                                        );
                                    });
                                },
                                () => { throw Error('Deletion of rows failed'); }
                            );
                        });
                    }
                }
            }).catch((e) => { console.log(e); ToastAndroid.show('Attendance sync failed', ToastAndroid.LONG); });
    };

    React.useEffect(refresh_list_local, []);
    React.useEffect(refresh_list_network, []);
    React.useEffect(async () => {
        var user_creds = JSON.parse(await EncryptedStorage.getItem('user_creds'));
        set_qr(CryptoJS.AES.encrypt(JSON.stringify({ uid: user_creds.uid }), terminal_key.patched_key()).toString());
    }, []);

    React.useEffect(() => {

        socket.once('connect', () => set_cloud('cloud'));

        socket.on('disconnect', () => set_cloud('cloud-alert'));

        socket.on('connect_error', () => set_cloud('cloud-alert'));

        socket.on('marked_client', async (msg) => {
            try {
                var response = await Request.decrypt(JSON.parse(msg).cipher);
                if (response.uid === JSON.parse(await EncryptedStorage.getItem('user_creds')).uid) {
                    wait('Confirming attendance');
                    wait('Almost there');
                    db.transaction(function (txn) {
                        txn.executeSql(
                            'INSERT INTO attendance (temperature, date, time, object, terminal) VALUES (?,?,?,?,?)',
                            [response.temperature, response.date, response.time, response.object, response.terminal],
                            () => {
                                refresh_list_network();
                                prompt_index.current = 0;
                                set_data({ temperature: response.temperature, date: response.date, time: response.time });
                                show_prompt(true);
                            },
                            (e) => console.error(e),
                        );
                    });
                    wait();
                }
            } catch (e) { console.error(e); }
        });

        socket.on('duplicate', async (msg) => {
            try {
                var response = await Request.decrypt(JSON.parse(msg).cipher);
                if (response.uid === JSON.parse(await EncryptedStorage.getItem('user_creds')).uid) {
                    wait();
                    alert('Nope nope', "Looks like you've already marked today's attendance.");
                }
            } catch (e) { console.error(e); }
        });

        socket.on('failed', async (msg) => {
            try {
                var response = await Request.decrypt(JSON.parse(msg).cipher);
                if (response.uid === JSON.parse(await EncryptedStorage.getItem('user_creds')).uid) {
                    wait();
                    alert('Uh Oh', "We've encountered an unknown error while marking your attendance. Please contact system admin or staff advisor immediately.");
                }
            } catch (e) { console.error(e); }
        });

    }, [socket]);

    const wait = (text) => text ? set_waiter({ visible: true, text: text }) : set_waiter({ visible: false });

    const alert = (heading, content) => {
        if (!content) set_alert({ visible: false });
        else set_alert({ visible: true, heading: heading, content: content });
    };

    const list_item = ({ item, index }) => (
        <TouchableNativeFeedback onLongPress={() => alert('Nope', "No actions are permitted on a marked attendance. You can't modify or delete the attendance of a day.")} onPress={() => { prompt_index.current = index; set_data(item); show_prompt(true); }} background={TouchableNativeFeedback.Ripple('gray', false)} r>
            <View style={styles.item_container}>
                <View style={{ marginLeft: 20 }}>
                    <Text style={styles.item_date}>{item.time}, {item.date}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.item_temperature}>{item.temperature}&deg; C </Text>
                        {item.temperature <= 38.5 ?
                            <MaterialIcon name={'verified'} style={styles.accent} size={20} /> :
                            <MaterialCommunityIcon name={'alert-decagram'} color={'red'} size={20} />
                        }
                    </View>
                </View>
            </View>
        </TouchableNativeFeedback>
    );
    // Basic sliding animation with card switching for prompt box
    const slide = (direction) => Animated.timing(animref, {
        toValue: direction === 'next' ? -width : width,
        duration: 100,
        useNativeDriver: true,
    }).start(() => {
        set_data({});
        Animated.timing(animref, {
            toValue: direction === 'next' ? width : -width,
            duration: 0,
            useNativeDriver: true,
        }).start(() => {
            set_data(list[prompt_index.current]);
            Animated.timing(animref, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }).start();
        });
    });

    // a function for simulating qr scan
    // const simulate_mark = async (input) => {
    //     show_scanner(false);
    //     wait('Marking your attendance');
    //     var user_creds = JSON.parse(await EncryptedStorage.getItem('user_creds'));
    //     try {
    //         socket.emit('mark', Request.encrypt({
    //             uid: user_creds.uid,
    //             temperature: input.temperature,
    //             date: input.date,
    //             time: input.time,
    //             terminal: input.terminal,
    //         }));
    //     } catch { alert('Uh Oh', 'We encountered an error while trying to mark your attendance. Please retry by showing your code to the terminal.'); }
    //     wait('Waiting for confirmation');
    // };

    const mark_attendance = async (input) => {
        show_scanner(false);
        wait('Marking your attendance');
        var user_creds = JSON.parse(await EncryptedStorage.getItem('user_creds'));
        var info = JSON.parse(input);
        try {
            socket.emit('mark', Request.encrypt({
                uid: user_creds.uid,
                temperature: info.temperature,
                date: info.date,
                time: info.time,
                object: info.object,
                terminal: info.terminal,
            }));
        } catch { wait(); alert('Uh Oh', 'We encountered an error while trying to mark your attendance. Please retry by showing your code to the terminal.'); }
        wait('Waiting for confirmation');
    };

    const qr_onread = string => Animated.timing(markerRef, {
        toValue: 1.5,
        duration: 500,
        useNativeDriver: true,
    }).start(() => Animated.timing(markerRef, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
    }).start(() => {
        try {
            const decrypted = CryptoJS.AES.decrypt(string.data.search('http://') >= 0 ? string.data.slice(7, string.data.length) : string.data, terminal_key.patched_key()).toString(CryptoJS.enc.Utf8);
            mark_attendance(decrypted);
            Vibration.vibrate(40);
        } catch (e) {
            console.error(e);
            Animated.timing(markerRef, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start(() => setTimeout(() => camera.current.reactivate(), 2000));
        }
    }));

    return (
        <View style={styles.root}>
            <Alert visible={alert_info.visible} heading={alert_info.heading} content={alert_info.content} onApprove={alert} />
            <Waiter visible={waiter.visible} text={waiter.text} />
            <View style={{ flex: 1.25, flexDirection: 'row' }}>
                <View style={{ flex: 0.6 }} />
                <View style={{ flex: 6, alignItems: 'center', flexDirection: 'row' }}>
                    <Image
                        source={require('../assets/img/logo.png')}
                        style={styles.heading_image}
                    />
                    <Text style={styles.screen_name}>elseus</Text>
                    <Text style={styles.beta_text}>BETA</Text>
                </View>
                <Pressable style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcon name={cloud} style={styles.status_icon} />
                </Pressable>
            </View>
            <View style={{ flex: 8 }}>
                {list.length > 0 ? <FlatList
                    data={list}
                    renderItem={list_item}
                    style={styles.float_button_heights}
                    keyExtractor={item => item.attendance_id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            colors={[global.accent.color, global.error.color]}
                            onRefresh={async () => {
                                set_refreshing(true);
                                await refresh_list_network();
                                set_refreshing(false);
                            }}
                        />
                    }
                /> : <View style={[styles.float_button_heights, { width: width }]} >
                    <View style={{ flex: 1 }} />
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.placeholder}>Click the QR button below</Text>
                        <Text style={styles.placeholder}>after showing your hand at the terminal</Text>
                        <Text style={styles.placeholder}>to get started</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                </View>}
                <View style={{ height: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                    <Pressable onPress={() => show_scanner(true)}>
                        <View style={styles.scan_button}>
                            <MaterialIcon name="qr-code-scanner" style={styles.scan_button_icon} />
                        </View>
                    </Pressable>
                </View>
            </View>
            <Modal
                animationType={'fade'}
                onRequestClose={() => show_scanner(false)}
                visible={scanner}
            >
                <View style={styles.scanner_bg}>
                    {show_code ?
                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <View style={{ flex: 0.5 }} />
                                <View style={{ flex: 10, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={styles.heading}>Scan the code</Text>
                                    <Text style={styles.sub_heading}>After placing your hand near the device, point your camera at the QR code displayed on screen.</Text>
                                </View>
                                <View style={{ flex: 0.5 }} />
                            </View>
                            <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                                <QRCode
                                    value={qr_string}
                                    size={300}
                                    bgColor={isDarkMode ? 'white' : 'black'}
                                    fgColor={isDarkMode ? 'black' : 'white'} />
                            </View>
                            <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                                <Button onPress={() => set_mode(false)} text={'Scan a code'} />
                            </View>
                            <View style={{ flex: 0.5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <CircleSnail color={global.accent.color} size={width / 10} />
                                <Text style={[styles.info, { marginLeft: 10 }]}>Waiting for server</Text>
                            </View>
                        </View>
                        : <QRCodeScanner
                            customMarker={<Animated.View style={[styles.marker_outline, { transform: [{ scale: markerRef }] }]}>
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <View style={[styles.marker_squares, { borderStartWidth: 5, borderTopWidth: 5, borderTopLeftRadius: 20 }]} />
                                    <View style={{ flex: 3 }} />
                                    <View style={[styles.marker_squares, { borderRightWidth: 5, borderTopWidth: 5, borderTopRightRadius: 20 }]} />
                                </View>
                                <View style={{ flex: 3 }} />
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <View style={[styles.marker_squares, { borderStartWidth: 5, borderBottomWidth: 5, borderBottomLeftRadius: 20 }]} />
                                    <View style={{ flex: 3 }} />
                                    <View style={[styles.marker_squares, { borderRightWidth: 5, borderBottomWidth: 5, borderBottomRightRadius: 20 }]} />
                                </View>
                            </Animated.View>}
                            topContent={<View style={{ flex: 1, flexDirection: 'row' }}>
                                <View style={{ flex: 1 }} />
                                <View style={{ flex: 6, alignItems: 'center' }}>
                                    <Text style={styles.heading}>Scan a code</Text>
                                    <Text style={styles.sub_heading}>After placing your hand near the device, point your camera at the QR code displayed on screen.</Text>
                                </View>
                                <View style={{ flex: 1 }} />
                            </View>}
                            bottomContent={<View style={{ flex: 1 }}>
                                <Button onPress={() => set_mode(true)} text={'Show my code'} />
                                <View style={{ flexDirection: 'row', marginTop: 50 }}>
                                    <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                                        <CircleSnail color={global.accent.color} size={width / 10} />
                                    </View>
                                    <View style={{ flex: 0.5 }} />
                                    <View style={{ flex: 10, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={styles.info}>Searching for QR code</Text>
                                    </View>
                                    <View style={{ flex: 0.1 }}>
                                        <Pressable onPress={() => switch_torch(!torch)} style={[styles.torch_button, { backgroundColor: torch ? 'white' : null }]}>
                                            <MaterialCommunityIcon name={'flashlight'} color={torch ? 'black' : 'white'} size={30} />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>}
                            fadeIn={false} flashMode={torch ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off} ref={camera} showMarker={true} onRead={qr_onread} vibrate={false} cameraStyle={styles.camera} />}
                </View>
            </Modal>
            <Modal
                animationType={'slide'}
                transparent={true}
                onRequestClose={() => show_prompt(false)}
                visible={prompt}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <Pressable onPress={() => { set_data({}); show_prompt(false); }} style={{ flex: 1 }} />
                    <View style={styles.prompt_box}>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <View style={{ flex: 0.4 }}>
                                {/*TO DO: Devise a better condition than data.temperature <=38.5 || !data.temperature to determine colours of slider switches*/}
                                {prompt_index.current !== 0 ? <Pressable onPress={() => { prompt_index.current -= 1; slide(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <MaterialIcon name={'keyboard-arrow-left'} style={data.temperature <= 38.5 || !data.temperature ? styles.accent : styles.error} size={height / 20} />
                                </Pressable> : null}
                            </View>
                            <View style={{ flex: 2 }}>
                                {Object.keys(data).length > 0 ?
                                    <Animated.View style={{ flex: 1, flexDirection: 'row', transform: [{ translateX: animref }] }}>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flex: 1 }} />
                                            <View style={{ flex: 2 }}>
                                                <Image
                                                    source={data.temperature <= 38.5 ? require('../assets/img/happy.gif') : require('../assets/img/problem.gif')}
                                                    style={styles.prompt_gif}
                                                />
                                                <Text style={[styles.prompt_status, data.temperature <= 38.5 ? styles.accent : styles.error]}>{data.temperature <= 38.5 ? 'You seem healthy!' : 'This is problematic'}</Text>
                                            </View>
                                            <View style={{ flex: 1 }} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flex: 1 }} />
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={[styles.prompt_temperature, data.temperature <= 38.5 ? styles.accent : styles.error]}>{data.temperature}&deg; C </Text>
                                                    {data.temperature <= 38.5 ?
                                                        <MaterialIcon name={'verified'} style={styles.accent} size={height / 28} /> :
                                                        <MaterialCommunityIcon name={'alert-decagram'} style={styles.error} size={height / 28} />
                                                    }
                                                </View>
                                                <MarqueeText
                                                    style={styles.prompt_date}
                                                    marqueeOnStart
                                                    loop
                                                    marqueeDelay={3000}
                                                >{data.date}</MarqueeText>
                                                {/* <Text style={styles.prompt_date}>{data.date}</Text> */}
                                                <Text style={styles.prompt_date}>{data.time}</Text>
                                            </View>
                                            <View style={{ flex: 1 }} />
                                        </View>
                                    </Animated.View> : null}
                            </View>
                            <View style={{ flex: 0.3 }}>
                                {prompt_index.current + 1 !== list.length ? <Pressable onPress={() => { prompt_index.current += 1; slide('next'); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <MaterialIcon name={'keyboard-arrow-right'} style={data.temperature <= 38.5 || !data.temperature ? styles.accent : styles.error} size={height / 20} />
                                </Pressable> : null}
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View >
    );
};
