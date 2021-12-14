import * as React from 'react';
import { View, Text, Pressable, Keyboard, Modal, ToastAndroid } from 'react-native';
import { useDarkMode, useDynamicStyleSheet } from 'react-native-dark-mode';
import { OutlinedTextField } from 'rn-material-ui-textfield';
import { SERVER_URL, AUTH_TOKEN, KEY } from '@env';
import EncryptedStorage from 'react-native-encrypted-storage';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dynamicStyles from '../styles/Signup';
import OTPTextView from '../assets/OTPView';
import Button from '../assets/AccentButton';
import Picker from '../assets/Picker';
import Waiter from '../assets/Waiter';
import Alert from '../assets/Alert';
import SecureRequest from '../assets/SecureRequest';
import global from '../styles/global';
import { ScrollView } from 'react-native-gesture-handler';

const batches = [
    '- Select batch -',
    '2021-2025 Batch',
    '2020-2024 Batch',
    '2019-2023 Batch',
    '2018-2022 Batch',
    '2017-2021 Batch',
];

const streams = [
    '- Select stream -',
    'Computer Science Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Electrical & Electronics Engineering',
    'Civil Engineering',
];

var Request = new SecureRequest(KEY);
//eslint-disable-next-line no-undef
export default SignUp = ({ navigation, route }) => {
    const { data } = route.params;
    // const data = { phone_number: '', email: '', name: '' };
    const styles = useDynamicStyleSheet(dynamicStyles);
    const isDarkMode = useDarkMode();

    // ui hooks
    let [ph_login] = React.useState(data.phone_number ? true : false);
    let [waiter, set_waiter] = React.useState({ visible: false });
    let [alert_info, set_alert] = React.useState({ visible: false });
    let [auth_prompt, set_auth] = React.useState(false);
    let [kb_focused, set_focus] = React.useState(false);
    let [visible, set_visible] = React.useState(true);
    let [seconds, setSeconds] = React.useState(59);

    // info hooks
    let [gender, set_gender] = React.useState('Female');
    const batch = React.useRef(batches[0]);
    const stream = React.useRef(streams[0]);
    let [otp, set_otp] = React.useState('');
    let [conf_obj, set_conf] = React.useState(null);
    let [inputs, set_input_arr] = React.useState([data.name, data.email, '', data.phone_number ? `+91${data.phone_number}` : '', '']);
    let [error, set_error_arr] = React.useState(['', '', '', '', '']);
    let [course_error, set_course_error_arr] = React.useState([false, false]); // this hook was added later to improve UX. it couldn't be added to the error hook due to lack of time. PR's invited
    var result = { uid: data.uid, name: '', email: '', password: '', phone: '', stream: stream.current, batch: batch.current, roll: '', gender: gender, image: data.image };
    const field_ids = ['name', 'email', 'password', 'phone', 'roll'];
    const error_names = ['your name', 'an email ID', 'a password', 'your phone number', ''];

    const phone_field = React.useRef(null);
    const email_field = React.useRef(null);
    const passsword_field = React.useRef(null);
    const rollno_field = React.useRef(null);


    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => set_focus(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => set_focus(false)
        );
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    React.useEffect(() => {
        if (seconds > 0) {
            setTimeout(() => setSeconds(seconds - 1), 1000);
        }
    }, [seconds]);

    const wait = (text) => text ? set_waiter({ visible: true, text: text }) : set_waiter({ visible: false });

    const alert = (heading, content) => {
        if (!content) set_alert({ visible: false });
        else set_alert({ visible: true, heading: heading, content: content });
    };

    const set_input = (index, text) => {
        let temp = inputs;
        temp[index] = text;
        set_input_arr(temp);
    };
    const set_error = (index, err) => {
        let temp = error;
        temp[index] = err;
        set_error_arr([...temp]);
    };
    const set_course_error = (index, err) => {
        let temp = course_error;
        temp[index] = err;
        set_course_error_arr([...temp]);
    };
    const verify = async (signup) => {
        wait('Checking details');
        if (signup) {
            // verify that nothing is blank
            for (let i = 0; i < inputs.length; i++) {
                if (!inputs[i]) set_error(i, `Please enter ${error_names[i]}`);
                else {
                    set_error(i, '');
                    result[field_ids[i]] = inputs[i];
                }
            }
            if (!/^[6-9]\d{9}$/gi.test(inputs[3].replace('+91', ''))) set_error(3, 'Invalid phone number');
            // eslint-disable-next-line no-useless-escape
            if (!/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(inputs[1])) set_error(1, 'Invalid email ID');
            var safe = false;
            for (const each of error) {
                if (!each) safe = true;
                else {
                    safe = false;
                    console.log(`Error detected: ${error}`);
                    break;
                }
            }
            console.log(`Batch selected is ${batch.current} and stream is ${stream.current}`);
            // optimise this crap
            if (batch.current === batches[0]) { safe = false; set_course_error(0, true); } else { set_course_error(0, false); result.batch = batch.current; }
            if (stream.current === streams[0]) { safe = false; set_course_error(1, true); } else { set_course_error(1, false); result.stream = stream.current; }
            if (safe) {
                wait('Connecting to server');
                await fetch(`${SERVER_URL}/accounts/signup`, {
                    method: 'POST',
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${AUTH_TOKEN}`,
                    },
                    body: Request.encrypt(result),
                })
                    .then(res => res.json())
                    .then(async (json) => {
                        wait('Creating your account');
                        try {
                            var response = await Request.decrypt(json.cipher);
                        } catch (e) { throw Error(e.message); }
                        if (!response.error) {
                            await EncryptedStorage.setItem('user_creds', JSON.stringify(response.user_info));
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Tabs' }],
                            });
                            navigation.navigate('Tabs');
                        }
                        else alert('Oops', response.error);
                    }).catch((e) => console.log(`Logic threw an error: ${e.message}`));
                wait();
            } else {
                wait();
                set_auth(false);
            }
        } else {
            set_auth(false);
            if (/^[6-9]\d{9}$/gi.test(inputs[3].replace('+91', ''))) {
                set_error(3, '');
                try {
                    wait('Making a new one time code for you');
                    const confirmation = await auth().signInWithPhoneNumber(inputs[3]);
                    set_conf(confirmation);
                    seconds <= 0 ? setSeconds(59) : null;
                    wait();
                    set_auth(true);
                } catch (e) {
                    wait();
                    if (e.message.includes('We have blocked all requests from this device due to unusual activity. Try again later.')) alert('Oops', 'We have blocked all requests from this device due to unusual activity. Try again later.');
                    else alert('Error', e.message);
                }
            }
            else set_error(3, 'Please enter a valid Indian number');
        }
    };
    const handleOTP = async () => {
        try {
            wait('Checking OTP');
            await conf_obj.confirm(otp);
            set_auth(false);
            verify(true);
        } catch (e) {
            wait();
            if (auth().currentUser.uid && e.message.includes('has expired')) verify(true);
            else alert('Oops', e.message);
        }
    };

    const SegmentedControl = ({ value }) => {
        return (
            <Pressable onPress={() => set_gender(value)} style={[styles.segmented_control, { backgroundColor: gender === value ? global.accent.color : isDarkMode ? '#333333' : '#f2f2f2' }]}>
                <Text style={[styles.segmented_control_text, { color: gender === value ? 'white' : global.accent.color }]}>{value}</Text>
            </Pressable>
        );
    };

    return (
        <View style={styles.root}>
            <Waiter visible={waiter.visible} text={waiter.text} />
            <Alert visible={alert_info.visible} heading={alert_info.heading} content={alert_info.content} onApprove={alert} />
            <Modal
                visible={auth_prompt}
                statusBarTranslucent={true}
                transparent={true}
                animationType={'fade'}
                onRequestClose={() => navigation.goBack()}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ flex: kb_focused ? 0.5 : 2 }} />
                    <View style={styles.prompt_box}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 1 }} />
                            <View style={{ flex: 8, justifyContent: 'center' }}>
                                <Text style={styles.screen_name}>Enter OTP</Text>
                            </View>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <View style={{ flex: 1 }} />
                            <View style={{ flex: 7, alignItems: 'center' }}>
                                <OTPTextView handleTextChange={temp => set_otp(temp)} handleSubmit={verify} />
                                <Button text="Continue" onPress={handleOTP} containerStyle={{ marginTop: 10 }} />
                                <Pressable onPress={(() => {
                                    if (seconds <= 0) verify(false);
                                })}>
                                    {seconds > 0 ? <Text style={styles.links}>Wait {seconds}s to resend OTP</Text> : <Text style={styles.links} >Resend OTP</Text>}
                                </Pressable>
                            </View>
                            <View style={{ flex: 1 }} />
                        </View>
                        {kb_focused ? <View style={{ flex: 1.5 }} /> : null}
                    </View>
                </View>
            </Modal>
            <View style={{ flex: 1.2, flexDirection: 'row' }}>
                <View style={{ flex: 0.6 }} />
                <View style={{ flex: 8, justifyContent: 'center' }}>
                    <Text style={styles.screen_name}>SignUp</Text>
                </View>
            </View>
            <View style={{ flex: 10 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ flex: 4 }}>
                        <Text style={styles.heading}>Profile Details</Text>
                        <OutlinedTextField
                            label="Name"
                            baseColor={isDarkMode ? 'white' : 'gray'}
                            textColor={isDarkMode ? 'white' : 'gray'}
                            tintColor={global.accent.color}
                            onChangeText={text => set_input(0, text)}
                            onSubmitEditing={() => ph_login ? email_field.current.focus() : phone_field.current.focus()}
                            returnKeyType={'next'}
                            defaultValue={data.name}
                            error={error[0]}
                        />
                        <OutlinedTextField
                            label="Phone number"
                            ref={phone_field}
                            baseColor={isDarkMode ? 'white' : 'gray'}
                            textColor={isDarkMode ? 'white' : 'gray'}
                            tintColor={global.accent.color}
                            onChangeText={text => set_input(3, `+91${text}`)}
                            onSubmitEditing={() => passsword_field.current.focus()}
                            returnKeyType={'next'}
                            keyboardType={'phone-pad'}
                            maxLength={10}
                            error={error[3]}
                            disabled={ph_login}
                            defaultValue={ph_login ? data.phone_number : ''}
                        />
                        <OutlinedTextField
                            label="Email address"
                            ref={email_field}
                            baseColor={isDarkMode ? 'white' : 'gray'}
                            textColor={isDarkMode ? 'white' : 'gray'}
                            tintColor={global.accent.color}
                            onChangeText={text => set_input(1, text)}
                            onSubmitEditing={() => passsword_field.current.focus()}
                            returnKeyType={'next'}
                            keyboardType={'email-address'}
                            disabled={!ph_login}
                            defaultValue={!ph_login ? data.email : ''}
                            error={error[1]}
                        />
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 6 }}>
                                <OutlinedTextField
                                    label="Password"
                                    ref={passsword_field}
                                    baseColor={isDarkMode ? 'white' : 'gray'}
                                    textColor={isDarkMode ? 'white' : 'gray'}
                                    tintColor={global.accent.color}
                                    onChangeText={text => set_input(2, text)}
                                    onSubmitEditing={() => rollno_field.current.focus()}
                                    secureTextEntry={visible}
                                    returnKeyType={'next'}
                                    error={error[2]}
                                />
                            </View>
                            <Pressable onPress={() => set_visible(!visible)} style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name={visible ? 'visibility' : 'visibility-off'} color={'gray'} size={40} />
                            </Pressable>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            <SegmentedControl value={'Female'} />
                            <SegmentedControl value={'Male'} />
                        </View>
                    </View>
                    <View style={{ flex: 2 }}>
                        <Text style={styles.heading}>Institutional Details</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 5 }}>
                                <Picker list={batches} onValueChange={(e) => { batch.current = e; set_course_error(0, false); rollno_field.current.focus(); }} heading={'Choose your batch'} containerStyle={styles.batch_picker_width} error={course_error[0]} />
                            </View>
                            <View style={{ flex: 2 }}>
                                <OutlinedTextField
                                    label="Roll No"
                                    ref={rollno_field}
                                    baseColor={isDarkMode ? 'white' : 'gray'}
                                    textColor={isDarkMode ? 'white' : 'gray'}
                                    tintColor={global.accent.color}
                                    onChangeText={text => set_input(4, text)}
                                    onSubmitEditing={() => { Keyboard.dismiss(); ToastAndroid.show('Select stream and batch', ToastAndroid.LONG); }}
                                    error={error[4]}
                                    maxLength={2}
                                    keyboardType={'number-pad'}
                                />
                            </View>
                            <View style={{ flex: 0.5 }} />
                        </View>
                        <Picker list={streams} onValueChange={(e) => { stream.current = e; set_course_error(1, false); }} heading={'Choose your stream'} error={course_error[1]} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Button text={'Register'} onPress={() => verify(ph_login)} containerStyle={styles.button} />
                    </View>
                </ScrollView>
            </View>
            {kb_focused ? <View style={{ flex: 3 }} /> : null}
        </View>
    );
};
