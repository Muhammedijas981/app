import * as React from 'react';
import { View, Text, Image, TouchableNativeFeedback, Switch, ToastAndroid, BackHandler, Modal, Pressable, Dimensions, Linking } from 'react-native';
import { useDynamicStyleSheet } from 'react-native-dark-mode';
import { ScrollView } from 'react-native-gesture-handler';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { openDatabase } from 'react-native-sqlite-storage';
import { SERVER_URL, DEFAULT_DP, AUTH_TOKEN, KEY } from '@env';
import EncryptedStorage from 'react-native-encrypted-storage';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import MarqueeText from 'react-native-marquee';
import QRCode from 'react-native-qrcode-generator';
import auth from '@react-native-firebase/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dynamicStyles from '../styles/Settings';
import Alert from '../assets/Alert';
import Waiter from '../assets/Waiter';
import SecureRequest from '../assets/SecureRequest';
import global from '../styles/global';

var db = openDatabase({ name: 'Selseus.db' });
var Request = new SecureRequest(KEY);
const Settings = ({ navigation }) => {
    const styles = useDynamicStyleSheet(dynamicStyles);
    let [user, set_user] = React.useState({});
    let [dp, set_dp] = React.useState({ uri: DEFAULT_DP });
    let [fingerprint, set_fingerprint] = React.useState(false);
    let [fp_available, set_availability] = React.useState(true);
    let [disabled, disable_fp] = React.useState(false);
    let [alert_info, set_alert] = React.useState({ visible: false });
    let [waiter, set_waiter] = React.useState({ visible: false });
    let [image_picker, show_image_picker] = React.useState(false);
    let [support_picker, show_support] = React.useState(false);
    let [qr_prompt, qr_visible] = React.useState(false);
    let [qr_string, set_string] = React.useState('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(async () => {
        try {
            var user_creds = await EncryptedStorage.getItem('user_creds');
            if (user_creds !== undefined) { set_user(JSON.parse(user_creds)); set_string(JSON.parse(user_creds).uid); set_dp({ uri: JSON.parse(user_creds).image }); }
        } catch (error) {
            ToastAndroid.show('You were logged out', ToastAndroid.LONG);
            BackHandler.exitApp();
        }
    }, []);

    React.useEffect(() => {
        FingerprintScanner
            .isSensorAvailable()
            .then(async () => {
                try {
                    const FP = await EncryptedStorage.getItem('fingerprint');
                    FP != null ? set_fingerprint(true) : set_fingerprint(false);
                } catch { ToastAndroid.show('An error occured while configuring fingerprint data', ToastAndroid.LONG); }
            })
            .catch(error => {
                if (!error.name === 'FingerprintScannerNotEnrolled') { set_availability(false); }
                else disable_fp(true);
            });
    }, []);

    const alert = (heading, content, onApprove, onCancel) => {
        if (!content) set_alert({ visible: false });
        else set_alert({ visible: true, heading: heading, content: content, onApprove: onApprove, onCancel: onCancel });
    };

    const wait = (text) => text ? set_waiter({ visible: true, text: text }) : set_waiter({ visible: false });

    const toggle_fp = async () => {
        if (disabled) ToastAndroid.show('Setup fingerprints in settings first', ToastAndroid.LONG);
        else {
            if (!fingerprint) {
                FingerprintScanner
                    .authenticate({ title: 'Verify fingerprint', description: 'This will enable biometric authentication for logging into Selseus the next time you open the app', cancelButton: 'Cancel' })
                    .then(async () => { await EncryptedStorage.setItem('fingerprint', 'true'); set_fingerprint(true); })
                    .catch((error) => error.name === 'FingerprintScannerNotEnrolled' ? ToastAndroid.show('Setup fingerprints in settings first', ToastAndroid.LONG) : null);
            }
            else { await EncryptedStorage.removeItem('fingerprint'); set_fingerprint(false); }
        }
    };

    const logout = async () => {
        try {
            await GoogleSignin.signOut();
        } catch { }
        auth()
            .signOut()
            .then(async () => {
                await EncryptedStorage.removeItem('user_creds');
                try { await EncryptedStorage.removeItem('fingerprint'); } catch { }
                db.transaction(function (txn) {
                    txn.executeSql(
                        'DELETE from attendance',
                        [],
                        () => {
                            ToastAndroid.show('You were logged out', ToastAndroid.LONG);
                            BackHandler.exitApp();
                        }
                    );
                });
            }).catch(() => { ToastAndroid.show('You were logged out', ToastAndroid.LONG); BackHandler.exitApp(); });
    };

    const change_dp = async (response) => {
        show_image_picker(false);
        try {
            if (!response.didCancel) {
                let temp_object = user;
                temp_object.image = `data:${response.assets[0].type};base64,${response.assets[0].base64}`;
                set_user(temp_object);
                wait('Connecting...');
            }
        } catch { }
        await fetch(`${SERVER_URL}/accounts/update`, {
            method: 'POST',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
            body: Request.encrypt(user),
        })
            .then(res => res.json())
            .then(async (json) => {
                wait('Updating your photo...');
                try {
                    var res = await Request.decrypt(json.cipher);
                } catch (e) { throw Error(e.message); }
                if (res) {
                    set_dp({ uri: user.image });
                    await EncryptedStorage.setItem('user_creds', JSON.stringify(user));
                } else throw Error;
            }).catch(() => alert('Oops', 'Failed to update profile picture. Please try later or check you internet connectivity.', () => alert()));
        wait();
    };

    const Header = ({ heading }) => (
        <View style={styles.header}>
            <View style={styles.heading_container}>
                <Text style={[styles.heading, styles.accent]}>{heading}</Text>
            </View>
            <View style={{ flex: 8 }} />
        </View>
    );

    const Item = ({ icon, heading, description, onpress, switch_ }) => (
        <View style={{ flex: 2 }}>
            <TouchableNativeFeedback onPress={onpress} background={TouchableNativeFeedback.Ripple('gray', false)} r>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 0.5 }} />
                    <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialIcons name={icon} size={40} style={styles.accent} />
                    </View>
                    <View style={{ flex: 7 }}>
                        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                            <Text style={styles.item_heading}>{heading}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.description}>{description}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 2, justifyContent: 'center', alignItems: 'flex-start' }}>
                        {switch_ ? <Switch
                            trackColor={{ false: '#767577', true: global.accent_muted.color }}
                            thumbColor={switch_.hook ? global.accent.color : '#f4f3f4'}
                            value={switch_.hook}
                            onValueChange={onpress}
                            disabled={disabled} /> : null}
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );

    const Picker_Button = ({ text, materialicon, icon, onPress }) => (
        <Pressable onPress={onPress} android_ripple={{ color: 'gray' }} style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
            {materialicon ? <MaterialIcons name={materialicon} color={global.accent.color} size={40} /> : <Icon name={icon} color={global.accent.color} size={40} />}
            <Text style={styles.image_picker_text}>{text}</Text>
        </Pressable>
    );

    return (
        <View style={styles.root}>
            <Waiter visible={waiter.visible} text={waiter.text} />
            <Alert visible={alert_info.visible} heading={alert_info.heading} content={alert_info.content} onApprove={alert_info.onApprove} onCancel={alert_info.onCancel} />
            <Modal
                animationType={'slide'}
                transparent={true}
                statusBarTranslucent={true}
                visible={image_picker}
                onRequestClose={() => show_image_picker(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <Pressable onPress={() => show_image_picker(false)} style={{ flex: 3 }} />
                    <View style={styles.prompt_box}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 1 }} />
                            <View style={{ flex: 8, justifyContent: 'center' }}>
                                <Text style={styles.item_heading}>{dp.uri !== DEFAULT_DP ? 'Update' : 'Upload'} your photo</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 1 }} />
                            <Picker_Button onPress={() => launchCamera({ mediaType: 'photo', includeBase64: true, quality: 0.5 }, (response) => change_dp(response))} text={'Camera'} icon={'add-a-photo'} />
                            <View style={{ flex: 0.5 }} />
                            <Picker_Button onPress={() => launchImageLibrary({ mediaType: 'photo', includeBase64: true, quality: 0.5 }, (response) => change_dp(response))} text={'Gallery'} icon={'photo-library'} />
                            {dp.uri !== DEFAULT_DP ? <View style={{ flex: 0.5 }} /> : null}
                            {dp.uri !== DEFAULT_DP ? <Picker_Button onPress={() => {
                                show_image_picker(false);
                                wait('Removing photo...');
                                fetch(`${SERVER_URL}/accounts/removedp`, {
                                    method: 'POST',
                                    headers: {
                                        Accept: '*/*',
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${AUTH_TOKEN}`,
                                    },
                                    body: Request.encrypt({ uid: user.uid }),
                                })
                                    .then(res => res.json())
                                    .then(async (json) => {
                                        try {
                                            var response = await Request.decrypt(json.cipher);
                                        } catch (e) { throw Error(e.message); }
                                        if (response) {
                                            set_dp({ uri: DEFAULT_DP });
                                            var obj = user;
                                            obj.image = DEFAULT_DP;
                                            await EncryptedStorage.setItem('user_creds', JSON.stringify(obj));
                                            wait();
                                        } else throw Error;
                                    })
                                    .catch(() => alert(''));
                            }} text={'Remove photo'} icon={'no-photography'} /> : null}
                            <View style={{ flex: 1 }} />
                        </View>
                        <View style={{ flex: 0.5 }} />
                    </View>
                </View>
            </Modal>
            <Modal
                animationType={'slide'}
                transparent={true}
                statusBarTranslucent={true}
                visible={support_picker}
                onRequestClose={() => show_support(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <Pressable onPress={() => show_support(false)} style={{ flex: 3 }} />
                    <View style={styles.prompt_box}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 1 }} />
                            <View style={{ flex: 8, justifyContent: 'center' }}>
                                <Text style={styles.item_heading}>Get in touch</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 1 }} />
                            <Picker_Button onPress={() => { show_support(false); Linking.openURL('https://api.whatsapp.com/send?phone=+919747590228&text=Hi%20Selseus%20team.%20I%20need%20some%20help%20about%20using%20your%20service.%20Hope%20you%27ll%20be%20able%20to%20help%20me%20out.'); }} text={'WhatsApp'} materialicon={'whatsapp'} />
                            <View style={{ flex: 0.5 }} />
                            <Picker_Button onPress={() => { show_support(false); Linking.openURL('https://t.me/selseus'); }} text={'Telegram'} materialicon={'telegram'} />
                            <View style={{ flex: 0.5 }} />
                            <Picker_Button onPress={() => { show_support(false); Linking.openURL('tel:+919747590228'); }} text={'Call us'} materialicon={'phone'} />
                            <View style={{ flex: 1 }} />
                        </View>
                        <View style={{ flex: 0.5 }} />
                    </View>
                </View>
            </Modal>
            <Modal
                animationType={'slide'}
                transparent={true}
                statusBarTranslucent={true}
                visible={qr_prompt}
                onRequestClose={() => qr_visible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <Pressable onPress={() => qr_visible(false)} style={{ flex: 1.5 }} />
                    <View style={styles.prompt_box}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 1 }} />
                            <View style={{ flex: 8, justifyContent: 'center' }}>
                                <Text style={styles.qr_prompt_heading} >Your QR code</Text>
                            </View>
                        </View>
                        <View style={{ flex: 2, alignItems: 'center' }}>
                            <QRCode
                                value={qr_string}
                                size={Dimensions.get('window').width / 3}
                                bgColor={'black'}
                                fgColor={'white'}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            <View style={{ flex: 0.1, flexDirection: 'row' }}>
                <View style={{ flex: 0.5 }} />
                <View style={{ flex: 6, justifyContent: 'flex-end' }}>
                    <Text style={styles.screen_name}>Settings</Text>
                </View>
                <View style={{ flex: 2 }} />
            </View>
            <ScrollView style={{ flex: 10 }}>
                <View style={styles.account_container}>
                    <View style={styles.dp_container}>
                        <Pressable onPress={() => show_image_picker(true)}>
                            <Image
                                source={dp}
                                style={styles.dp} />
                        </Pressable>
                    </View>
                    <View style={{ flex: 0.1 }} />
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <MarqueeText
                            marqueeOnStart
                            loop
                            duration={3000}
                            style={styles.username}
                            marqueeResetDelay={1000}
                        >{user.name}</MarqueeText>
                        <MarqueeText
                            marqueeOnStart
                            loop
                            duration={3000}
                            style={styles.user_info}
                            marqueeResetDelay={1000}
                        >{user.stream}</MarqueeText>
                        <MarqueeText
                            marqueeOnStart
                            loop
                            duration={3000}
                            style={styles.user_info}
                            marqueeResetDelay={1000}
                        >{user.email}</MarqueeText>
                        <MarqueeText
                            marqueeOnStart
                            loop
                            duration={3000}
                            style={styles.user_info}
                            marqueeResetDelay={1000}
                        >{user.phone}</MarqueeText>
                    </View>
                    <View style={{ flex: 0.2 }} />
                </View>
                <View style={styles.options_container}>
                    <Header heading={'General'} />
                    <Item icon={'qrcode'} onpress={() => qr_visible(true)} heading={'Your code'} description={'View your entry QR code'} />
                    {/* <Item icon={'account-edit'} onpress={() => navigation.navigate('EditProfile')} heading={'Edit profile'} description={'Change your account details'} /> */}
                    <Item icon={'phone-lock'} onpress={() => navigation.navigate('PhoneNumber', { default_phone: user.phone, uid: user.uid })} heading={'Phone number'} description={'Change your login phone number'} />
                    {fp_available ? <Item switch_={{ 'hook': fingerprint }} onpress={toggle_fp} icon={'fingerprint'} heading={'Biometric Login'} description={'To avoid someone from peeking'} /> : null}
                    <Item icon={'logout'} onpress={() => alert('Confirm logout', 'Are you sure want to logout from this device?', () => logout(), () => alert())} heading={'Logout'} description={'Logout account from this device'} />
                    <Header heading={'Misc'} />
                    <Item icon={'help-network'} onpress={() => show_support(true)} heading={'Get help'} description={'Chat with us or call us for help'} />
                    <Item icon={'shield-account'} onpress={() => navigation.navigate('Policies')} heading={'Privacy Policy'} description={'Describes how we respect your privacy'} />
                </View>
            </ScrollView>
        </View>
    );
};
export default Settings;
