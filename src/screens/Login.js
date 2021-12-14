import * as React from 'react';
import { View, Text, ImageBackground, Image, Animated, Pressable } from 'react-native';
import { useDarkMode, useDynamicStyleSheet } from 'react-native-dark-mode';
import { OutlinedTextField } from 'rn-material-ui-textfield';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { SERVER_URL, AUTH_TOKEN, KEY, WEBCLIENT } from '@env';
import { openDatabase } from 'react-native-sqlite-storage';
import OTPTextView from '../assets/OTPView';
import ImgToBase64 from 'react-native-image-base64';
import EncryptedStorage from 'react-native-encrypted-storage';
import auth from '@react-native-firebase/auth';
import dynamicStyles from '../styles/Login';
import Button from '../assets/AccentButton';
import Alert from '../assets/Alert';
import Waiter from '../assets/Waiter';
import SecureRequest from '../assets/SecureRequest';
import global from '../styles/global';

const welcome_texts = [
    'Hi there,',
    'Welcome to',
    'Selseus.',
    'Login to continue...',
];

var db = openDatabase({ name: 'Selseus.db' });
var Request = new SecureRequest(KEY);
// eslint-disable-next-line no-undef
export default Login = ({ navigation }) => {
    const styles = useDynamicStyleSheet(dynamicStyles);
    const isDarkMode = useDarkMode();
    const animRef1 = React.useRef(new Animated.Value(0)).current;
    const animRef2 = React.useRef(new Animated.Value(1)).current;
    const textRef = React.useRef(0);

    // ui hooks
    let [is_auth_ongoing, set_auth_status] = React.useState(false);
    let [seconds, setSeconds] = React.useState(59);
    let [text, changeText] = React.useState('');
    let [conf_obj, set_conf] = React.useState(null);
    let [alert_info, set_alert] = React.useState({ visible: false });
    let [waiter, set_waiter] = React.useState({ visible: false });

    // hooks for storing account info
    let [otp, set_otp] = React.useState('');
    // let [password, set_password] = React.useState('');
    let [info, set_info] = React.useState(null);

    // error hooks
    let [error_1, seterror_1] = React.useState('');
    // let [error_2, seterror_2] = React.useState('');

    // create a table if none exists
    React.useEffect(() => db.transaction(function (txn) {
        txn.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='attendance'",
            [],
            function (_tx, res) {
                if (res.rows.length === 0) {
                    txn.executeSql('DROP TABLE IF EXISTS attendance', []);
                    txn.executeSql(
                        'CREATE TABLE IF NOT EXISTS attendance(attendance_id INTEGER PRIMARY KEY AUTOINCREMENT, temperature DEC(4, 2), date VARCHAR(200), time VARCHAR(200), object VARCHAR(200), terminal VARCHAR(128))',
                        []
                    );
                }
            }
        );
    }), []);

    React.useEffect(() => {
        if (seconds > 0) {
            setTimeout(() => setSeconds(seconds - 1), 1000);
        }
    }, [seconds]);

    const alert = (heading, content) => {
        if (!content) set_alert({ visible: false });
        else set_alert({ visible: true, heading: heading, content: content });
    };

    const wait = (content) => content ? set_waiter({ visible: true, text: content }) : set_waiter({ visible: false });

    // global function to sign in with our server
    const login = async (user_info) => {
        wait('Connecting to server');
        await fetch(`${SERVER_URL}/accounts/login`, {
            method: 'POST',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
            body: Request.encrypt({
                uid: auth().currentUser.uid,
            }),
        })
            .then((response) => response.json())
            .then(async (json) => {
                try {
                    var response = await Request.decrypt(json.cipher);
                } catch (e) { throw Error(e.message); }
                if (response.error) {
                    if (!response.user_info) {
                        navigation.navigate('Signup', { data: { uid: auth().currentUser.uid, ...user_info } });
                    } else console.error(response.user_info);
                } else {
                    wait('Logging in');
                    wait('Syncing your attendance');
                    for (const each of response.attendance) {
                        console.log(each);
                        db.transaction(function (tx) {
                            tx.executeSql(
                                'INSERT INTO attendance (temperature, date, time, object, terminal) VALUES (?,?,?,?,?)',
                                [each.temperature, each.date, each.time, each.object, each.terminal],
                                () => { },
                                (e) => console.error(e),
                            );
                        });
                    }
                    await EncryptedStorage.setItem('user_creds', JSON.stringify(response.user_info));
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Tabs' }],
                    });
                    navigation.navigate('Tabs');
                }
            }).catch((e) => { console.log(e); alert('Oops', "Something went wrong and we couldn't connect you to our server. Please try again later."); });
        wait();
    };

    const handleGoogle = async () => {
        try {
            wait('Checking this device');
            await GoogleSignin.hasPlayServices();
            await GoogleSignin.isSignedIn() ? await GoogleSignin.signOut() : null;
            wait('Waiting for Google');
            const { idToken, user } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            await auth().signInWithCredential(googleCredential);
            wait('Logging in');
            let user_info = { email: user.email, name: user.name, phone_number: '' };
            await ImgToBase64.getBase64String(user.photo)
                .then(base64String => { user_info = { email: user.email, name: user.name, phone_number: '', image: `data:image;base64,${base64String}` }; })
                .catch(() => set_info({ email: user.email, name: user.name, phone_number: '' }));
            login(user_info);
        } catch (err) {
            if (err.message === 'DEVELOPER_ERROR') {
                wait('Google sign in failed. Retrying...');
                await handleGoogle();
            }
            wait();
            if (err.code === statusCodes.SIGN_IN_CANCELLED) alert('Sign In', 'Please sign in to use this service');
            else if (err.code === statusCodes.IN_PROGRESS) alert('Please wait', 'We are working with Google servers to sign in. Please wait or check your network connection.');
            else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) alert('Oops', "Your phone doesn't have Google Play Services installed. Please use a different device or use other ways to sign in.");
            else alert('Uh Oh', 'An unknown error occured. Please check your network connection.');
        }
    };
    const handlePhoneLogin = async () => {
        if (/^[6-9]\d{9}$/gi.test(info.phone_number)) {
            seterror_1('');
            try {
                wait('Making a new one time code for you');
                // we're creating account here in order to pass the UID to server
                // this causes many fundamental problems during runtime.
                // any PR's to switch these to MFA-like account creation are welcome
                // try to remove confirmation variable
                const confirmation = await auth().signInWithPhoneNumber(`+91${info.phone_number}`);
                set_conf(confirmation);
                set_auth_status(true);
                changeText('Enter your OTP');
                seconds <= 0 ? setSeconds(59) : null;
                wait();
            } catch (e) {
                wait();
                if (e.message.includes('We have blocked all requests from this device due to unusual activity. Try again later.')) alert('Oops', 'We have blocked all requests from this number due to unusual activity. Try again later.');
                else alert('Oh no', e.message);
            }
        }
        else seterror_1('Please enter a valid Indian number');
    };

    // implement wrong OTP handling
    const handleOTP = async () => {
        try {
            wait('Checking OTP');
            await conf_obj.confirm(otp);
            login(info);
        } catch (e) {
            wait();
            // android can auto detect OTP's already. But the app's not prepared for it yet.
            if (auth().currentUser.uid && e.message.includes('has expired')) login(info);
            else alert('Oops', e.message);
        }
    };

    // flagged for a later release (bugs present)
    // const handleEmailLogin = () => {
    //     // eslint-disable-next-line no-useless-escape
    //     if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(info.email)) {
    //         wait('Logging you in');
    //         auth()
    //             .fetchSignInMethodsForEmail(info.email)
    //             .then((array) => { array.length > 0 ? set_auth_status(true) : console.error("User doesn't exist"); })
    //             .catch((error) => { error.code === 'auth/invaild-email' ? seterror_2('Please enter a valid email ID') : alert('Uh, oh', 'An unknown error occured. Please check your network connection'); });
    //         wait();
    //     } else seterror_2('Please enter a valid email ID');
    // };

    // const handlePassword = () => {
    //     auth()
    //         .signInWithEmailAndPassword(info.email, password)
    //         .then(() => login())
    //         .catch(() => alert('Oops', 'There was an error in signing you in. Please check your internet connection.'));
    // };

    const slideshow_text = () => {
        if (textRef.current < welcome_texts.length) {
            Animated.timing(animRef1, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                changeText(welcome_texts[textRef.current]);
                Animated.timing(animRef1, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => setTimeout(() => {
                    textRef.current++;
                    slideshow_text();
                }, 1000));
            });
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => { GoogleSignin.configure({ webClientId: WEBCLIENT }); slideshow_text(); }, []);
    return (
        <View style={styles.root}>
            <Waiter visible={waiter.visible} text={waiter.text} />
            <Alert visible={alert_info.visible} heading={alert_info.heading} content={alert_info.content} onApprove={alert} />
            <View style={{ flex: 1 }} />
            <View style={styles.cartoon_container}>
                <ImageBackground
                    source={require('../assets/img/animation.gif')}
                    style={styles.animation}
                >
                    <Animated.Text style={[styles.welcome, { opacity: animRef1 }]}>{text}</Animated.Text>
                </ImageBackground>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', width: '85%' }}>
                {is_auth_ongoing ?
                    <View style={{ alignItems: 'center' }}>
                        <OTPTextView handleTextChange={temp => set_otp(temp)} handleSubmit={handleOTP} />
                        <Button text="Continue" onPress={handleOTP} containerStyle={{ marginTop: 20 }} />
                        <Text style={styles.or} >OR</Text>
                        <Pressable onPress={(() => {
                            if (seconds <= 0) handlePhoneLogin();
                        })}>
                            {seconds > 0 ? <Text style={styles.links}>Wait {seconds}s to resend OTP</Text> : <Text style={styles.links} >Resend OTP</Text>}
                        </Pressable>
                        <Pressable onPress={() => set_auth_status(false)}>
                            <Text style={styles.links} >Change phone number</Text>
                        </Pressable>
                    </View>
                    : <View>
                        <Animated.View style={{ opacity: animRef2 }}>
                            <OutlinedTextField
                                label="Enter your phone number"
                                keyboardType="phone-pad"
                                onChangeText={no => set_info({ phone_number: no, email: '' })}
                                onSubmitEditing={handlePhoneLogin}
                                maxLength={10}
                                baseColor={isDarkMode ? 'white' : 'gray'}
                                tintColor={global.accent.color}
                                error={error_1}
                                textColor={isDarkMode ? 'white' : 'gray'}
                            />
                        </Animated.View>
                        <View style={{ alignItems: 'center' }}>
                            <Button onPress={handlePhoneLogin} text="Continue" containerStyle={styles.button_margin} />
                            <Text style={styles.or} >OR</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Pressable onPress={handleGoogle}>
                                    <Image
                                        source={require('../assets/img/google.png')}
                                        style={styles.google}
                                    />
                                </Pressable>
                                <Animated.View>
                                    {/* <Pressable onPress={() => Animated.timing(animRef2, {
                                        toValue: 0,
                                        duration: 500,
                                        useNativeDriver: true,
                                    }).start(() => {
                                        set_ph_login(!is_ph_selected);
                                        Animated.timing(animRef2, {
                                            toValue: 1,
                                            duration: 500,
                                            useNativeDriver: true,
                                        }).start();
                                    })} style={styles.switch}>
                                        <Icon name={is_ph_selected ? 'email' : 'phone'} style={styles.switch_icon} />
                                    </Pressable> */}
                                </Animated.View>
                            </View>
                        </View>
                    </View>}
            </View>
            <View style={{ flex: 2 }} />
            <View style={{ flex: 1 }} >
                <Text style={styles.footer}>By logging in, you're agreeing to our</Text>
                <Pressable onPress={() => navigation.navigate('Policy')}><Text style={[styles.footer, { color: global.accent.color }]}>Privacy Policy</Text></Pressable>
            </View>
        </View >
    );
};
