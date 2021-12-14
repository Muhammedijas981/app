import * as React from 'react';
import { View, Text, Keyboard, Pressable, ToastAndroid, BackHandler } from 'react-native';
import { useDynamicStyleSheet, useDarkMode } from 'react-native-dark-mode';
import { OutlinedTextField } from 'rn-material-ui-textfield';
import { SERVER_URL, AUTH_TOKEN, KEY } from '@env';
import EncryptedStorage from 'react-native-encrypted-storage';
import OTPTextView from '../assets/OTPView';
import auth from '@react-native-firebase/auth';
import Styles from '../styles/PhoneNumber';
import Button from '../assets/AccentButton';
import Waiter from '../assets/Waiter';
import Alert from '../assets/Alert';
import SecureRequest from '../assets/SecureRequest';
import global from '../styles/global';

var Request = new SecureRequest(KEY);
const PhoneNumber = ({ navigation, route }) => {
    const { default_phone } = route.params;
    const isDarkMode = useDarkMode();
    const styles = useDynamicStyleSheet(Styles);

    let [is_auth, set_auth] = React.useState(false);
    let [phone, set_phone] = React.useState(default_phone.slice(3, 13));
    let [user, set_user] = React.useState({});
    let [confirm, setConfirm] = React.useState(null);
    let [otp, set_otp] = React.useState('');
    let [error, set_error] = React.useState('');
    let [waiter, set_waiter] = React.useState({ visible: false });
    let [seconds, setSeconds] = React.useState(59);
    let [alert_info, set_alert] = React.useState({ visible: false });
    const input = React.useRef(null);

    React.useEffect(() => {
        if (seconds > 0) {
            setTimeout(() => setSeconds(seconds - 1), 1000);
        }
    }, [seconds]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(async () => {
        try {
            var user_creds = await EncryptedStorage.getItem('user_creds');
            if (user_creds !== undefined) set_user(JSON.parse(user_creds));
        } catch {
            ToastAndroid.show('You were logged out', ToastAndroid.LONG);
            BackHandler.exitApp();
        }
    }, []);

    const alert = (heading, content) => {
        if (!content) set_alert({ visible: false });
        else set_alert({ visible: true, heading: heading, content: content });
    };

    const wait = (text) => text ? set_waiter({ visible: true, text: text }) : set_waiter({ visible: false });

    const send_code = async () => {
        if (/^[6-9]\d{9}$/gi.test(phone)) {
            Keyboard.dismiss();
            set_error('');
            try {
                wait('Making a one time code for you');
                const confirmation = await auth().signInWithPhoneNumber(`+91${phone}`);
                setConfirm(confirmation);
                set_auth(true);
            } catch { console.error('Something fucked up'); }
            wait();
        }
        else set_error('Please enter a valid phone number');
    };

    const handle_code = async () => {
        Keyboard.dismiss();
        console.log(`Length of input is ${otp.length}`);
        if (otp.length < 6) alert('Hey there', 'How am I supposed to check a blank OTP... Please enter one.');
        else {
            seconds <= 0 ? setSeconds(59) : null;
            try {
                wait('Authenticating');
                confirm.confirm(otp);
                wait('Connecting to server');
                console.log(`Old UID is ${user.uid}, new temporary UID is ${auth().currentUser.uid}`);
                await fetch(`${SERVER_URL}/accounts/updateph`, {
                    method: 'POST',
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${AUTH_TOKEN}`,
                    },
                    body: Request.encrypt({
                        user: user.uid,
                        phone: `+91${phone}`,
                    }),
                })
                    .then(res => res.json())
                    .then(async (json) => {
                        try {
                            var response = await Request.decrypt(json.cipher);
                        } catch (e) { throw Error(e.message); }
                        wait('Changing phone number');
                        if (response.user_info && !response.error) {
                            await auth().signInWithEmailAndPassword(response.user_info.email, response.user_info.password);
                            await EncryptedStorage.setItem('user_creds', JSON.stringify(response.user_info));
                            alert('Woohoo', 'Your phone number just got updated. You can use it to login from now on.');
                            navigation.goBack();
                        } else alert('Oops', response.error);
                    })
                    .catch(() => alert('Uh Oh. Looks like there is a problem changing your number. Please check your internet connectivity or try again later'));
                wait();
            } catch (e) {
                console.error(e);
                if (e.code === 'auth/invalid-verification-code') {
                    alert('Uh oh', 'This OTP is incorrect. Please double check with the message we sent you and try again.');
                    input.current.clear();
                } else if (e.code === 'auth/session-expired') { alert('Oh no', 'Session has expired. Send OTP again'); }
                else alert('Sorry', 'An unknown error has occured. Please check your network connectivity also.');
            }
        }
    };

    return (
        <View style={styles.root}>
            <Waiter visible={waiter.visible} text={waiter.text} />
            <Alert visible={alert_info.visible} heading={alert_info.heading} content={alert_info.content} onApprove={alert} />
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 0.5 }} />
                <View style={{ flex: 6, justifyContent: 'flex-end' }}>
                    <Text style={styles.screen_name}>Change phone number</Text>
                </View>
                <View style={{ flex: 2 }} />
            </View>
            <View style={{ flex: 1 }} />
            {is_auth ?
                <View style={{ flex: 8, marginRight: 20, marginLeft: 20 }}>
                    <OTPTextView ref={input} handleTextChange={temp => set_otp(temp)} handleSubmit={async () => await handle_code} />
                    <Button onPress={handle_code} text="Change number" containerStyle={{ alignSelf: 'center', marginTop: 30, marginBottom: 20 }} />
                    <Pressable onPress={(() => {
                        if (seconds <= 0) handle_code();
                    })}>
                        {seconds > 0 ? <Text style={styles.links}>Wait {seconds}s to resend OTP</Text> : <Text style={styles.links} >Resend OTP</Text>}
                    </Pressable>
                    <Pressable onPress={() => { input.current.clear(); set_auth(false); }}>
                        <Text style={styles.links}>Change phone number</Text>
                    </Pressable>
                </View> : <View style={{ flex: 8, marginRight: 10, marginLeft: 10 }}>
                    <OutlinedTextField
                        label="Phone number"
                        baseColor={isDarkMode ? 'white' : 'gray'}
                        textColor={isDarkMode ? 'white' : 'gray'}
                        defaultValue={default_phone.slice(3, 13)}
                        keyboardType={'phone-pad'}
                        maxLength={10}
                        tintColor={global.accent.color}
                        returnKeyType={'send'}
                        autoFocus={true}
                        error={error}
                        onChangeText={temp => set_phone(temp)}
                        onSubmitEditing={send_code}
                    />
                    <Text style={styles.text}>This phone number can be used to login if you ever switch phones or reinstall this app.</Text>
                    <Button onPress={send_code} text="Send code" containerStyle={{ alignSelf: 'center', marginTop: 10 }} />
                </View>}
        </View>
    );
};

export default PhoneNumber;
