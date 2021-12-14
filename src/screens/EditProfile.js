import * as React from 'react';
import { View, Text, ToastAndroid, BackHandler, Pressable } from 'react-native';
import { useDynamicStyleSheet, useDarkMode } from 'react-native-dark-mode';
import { OutlinedTextField } from 'rn-material-ui-textfield';
import EncryptedStorage from 'react-native-encrypted-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../assets/AccentButton';
import Alert from '../assets/Alert';
import Styles from '../styles/EditProfile';
import global from '../styles/global';

const EditProfile = () => {
    const isDarkMode = useDarkMode();
    const styles = useDynamicStyleSheet(Styles);
    let [user, set_user] = React.useState({});
    let [name, set_name] = React.useState('');
    let [email, set_email] = React.useState('');
    let [password, set_password] = React.useState('');
    let [visible, set_visible] = React.useState(true);
    let [alert_info, set_alert] = React.useState({ visible: false });
    const email_field = React.useRef(null);
    const passsword_field = React.useRef(null);

    const alert = (heading, content) => {
        if (!content) set_alert({ visible: false });
        else set_alert({ visible: true, heading: heading, content: content });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(async () => {
        try {
            var user_creds = await EncryptedStorage.getItem('user_creds');
            if (user_creds !== undefined) {
                var temp_user = JSON.parse(user_creds);
                set_user(temp_user);
                set_name(temp_user.name);
                set_email(temp_user.email);
                set_password(temp_user.password);
            }
        } catch {
            ToastAndroid.show('You were logged out', ToastAndroid.LONG);
            BackHandler.exitApp();
        }
    }, []);

    const update = () => {
        if (name === user.name && email === user.email && password === user.password) alert('Hmm', "It seems like you haven't changed anything.");
        // eslint-disable-next-line no-useless-escape
        if (!/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email)) console.error('Invalid email');
        if (!name || !password) alert('Hey there', 'Please fill all the fields');
        else alert('Checks passed', `Email: ${email}, Name: ${name}, Password: ${password}`);
    };

    return (
        <View style={styles.root}>
            <Alert visible={alert_info.visible} heading={alert_info.heading} content={alert_info.content} onApprove={alert} />
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 0.5 }} />
                <View style={{ flex: 6, justifyContent: 'flex-end' }}>
                    <Text style={styles.screen_name}>Edit Profile</Text>
                </View>
                <View style={{ flex: 2 }} />
            </View>
            <View style={{ flex: 8 }}>
                <View style={{ flex: 1 }} />
                <View style={styles.container}>
                    <OutlinedTextField
                        label="Name"
                        baseColor={isDarkMode ? 'white' : 'gray'}
                        textColor={isDarkMode ? 'white' : 'gray'}
                        tintColor={global.accent.color}
                        onChangeText={text => set_name(text)}
                        onSubmitEditing={() => email_field.current.focus()}
                        defaultValue={name}
                        returnKeyType={'next'}
                    />
                    <OutlinedTextField
                        label="Email address"
                        ref={email_field}
                        baseColor={isDarkMode ? 'white' : 'gray'}
                        textColor={isDarkMode ? 'white' : 'gray'}
                        tintColor={global.accent.color}
                        onChangeText={text => set_email(text)}
                        onSubmitEditing={() => passsword_field.current.focus()}
                        returnKeyType={'next'}
                        defaultValue={email}
                        keyboardType={'email-address'}
                    />
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 6 }}>
                            <OutlinedTextField
                                label="Password"
                                ref={passsword_field}
                                baseColor={isDarkMode ? 'white' : 'gray'}
                                textColor={isDarkMode ? 'white' : 'gray'}
                                tintColor={global.accent.color}
                                onChangeText={text => set_password(text)}
                                defaultValue={password}
                                secureTextEntry={visible}
                            />
                        </View>
                        <Pressable onPress={() => set_visible(!visible)} style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center' }}>
                            <Icon name={visible ? 'visibility' : 'visibility-off'} color={'gray'} size={40} />
                        </Pressable>
                    </View>
                    <Button text={'Update'} onPress={update} containerStyle={{ alignSelf: 'center', marginTop: 10 }} />
                </View>
                <View style={{ flex: 1 }} />
            </View>
        </View>
    );
};

export default EditProfile;
